const mongoose = require('mongoose');
const bluebird = require('bluebird');
const validator = require('validator');
const Question = require('./models/Question.js');
const auth = require('./auth');

mongoose.Promise = bluebird;

const mongoString = process.env.MONGO_URI;

const createErrorResponse = (statusCode, message) => ({
    statusCode: statusCode || 500,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'message': message}) || JSON.stringify({'message': 'An unexpected error occured'}),
});

const createSuccessResponse = (statusCode, body) => ({
    statusCode: statusCode || 200,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
});

module.exports.authenticate = function (event, context) {
    auth.authenticate(event, function (err, data) {
        if (err) {
            if (!err) context.fail("Unhandled error");
            context.fail("Unauthorized");
        }
        else context.succeed(data);
    });
};


/**
 * LIST QUESTIONS
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.getQuestions = (event, context, callback) => {
    const db = mongoose.connect(mongoString).connection;
    const queryStringParameters = event.queryStringParameters || {};
    const limit = +queryStringParameters.limit || 10;
    const offset = +queryStringParameters.offset || 0;

    db.once('open', () => {
        Question
            .find()
            .skip(offset)
            .limit(limit)
            .then((questions) => {
                callback(null, createSuccessResponse(200, questions));
            })
            .catch((err) => {
                callback(null, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                // Close db connection or node event loop won't exit , and lambda will timeout
                db.close();
            });
    });
};


/**
 * GET QUESTION
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.getQuestion = (event, context, callback) => {
    const db = mongoose.connect(mongoString).connection;
    const question_id = event.pathParameters.question_id;

    if (!mongoose.Types.ObjectId.isValid(question_id)) {
        callback(null, createErrorResponse(400, 'Invalid id'));
        db.close();
        return;
    }

    db.once('open', () => {
        Question
            .findById(question_id)
            .then((question) => {
                if (!question) {
                    callback(null, createErrorResponse(404, "Question not found"));
                } else {
                    callback(null, createSuccessResponse(200, question));
                }
            })
            .catch((err) => {
                callback(null, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                // Close db connection or node event loop won't exit , and lambda will timeout
                db.close();
            });
    });
};


/**
 * CREATE QUESTION
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.createQuestion = (event, context, callback) => {
    const db = mongoose.connect(mongoString).connection;
    let data = JSON.parse(event.body);

    const question = new Question({
        question: data.question,
        answer: data.answer,
        distractors: data.distractors
    });

    const errs = question.validateSync();

    if (errs) {
        console.log(errs);
        callback(null, createErrorResponse(400, 'Incorrect question data'));
        db.close();
        return;
    }


    db.once('open', () => {
        question
            .save()
            .then(() => {
                callback(null, {statusCode: 201, body: JSON.stringify(question)});
            })
            .catch((err) => {
                callback(null, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                db.close();
            });
    });
};


/** UPDATE QUESTION
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.updateQuestion = (event, context, callback) => {
    const db = mongoose.connect(mongoString).connection;
    const data = JSON.parse(event.body);
    const id = event.pathParameters.id;
    let errs = {};
    let question = {};

    if (!validator.isAlphanumeric(id)) {
        callback(null, createErrorResponse(400, 'Incorrect id'));
        db.close();
        return;
    }

    question = new Question({
        _id: id,
        name: data.name,
        firstname: data.firstname,
        birth: data.birth,
        city: data.city,
        ip: event.requestContext.identity.sourceIp
    });

    errs = question.validateSync();

    if (errs) {
        callback(null, createErrorResponse(400, 'Incorrect parameter'));
        db.close();
        return;
    }

    db.once('open', () => {
        // Question.save() could be used too
        Question.findByIdAndUpdate(id, question)
            .then(() => {
                callback(null, {statusCode: 200, body: JSON.stringify('Ok')});
            })
            .catch((err) => {
                callback(err, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                db.close();
            });
    });
};


/** DELETE QUESTION
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.deleteQuestion = (event, context, callback) => {
    const db = mongoose.connect(mongoString).connection;
    const id = event.pathParameters.id;

    if (!validator.isAlphanumeric(id)) {
        callback(null, createErrorResponse(400, 'Incorrect id'));
        db.close();
        return;
    }

    db.once('open', () => {
        Question
            .remove({_id: event.pathParameters.id})
            .then(() => {
                callback(null, {statusCode: 200, body: JSON.stringify('Ok')});
            })
            .catch((err) => {
                callback(null, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                db.close();
            });
    });
};
