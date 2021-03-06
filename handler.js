const mongoose = require('mongoose');
const bluebird = require('bluebird');
const validator = require('validator');
const Question = require('./models/Question.js');
const auth = require('./auth');

mongoose.Promise = bluebird;

const mongoString = process.env.MONGO_URI;

const createErrorResponse = (statusCode, message) => ({
    statusCode: statusCode || 500,
    headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true,
        'Content-Type': 'application/json'},
    body: JSON.stringify({'message': message}) || JSON.stringify({'message': 'An unexpected error occured'}),
});

const createSuccessResponse = (statusCode, body) => ({
    statusCode: statusCode || 200,
    headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true,
        'Content-Type': 'application/json'
    },
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
                callback(null, createSuccessResponse(201, question));
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
    const question_id = event.pathParameters.question_id;
    let data = JSON.parse(event.body);

    if (!mongoose.Types.ObjectId.isValid(question_id)) {
        callback(null, createErrorResponse(400, 'Invalid id'));
        db.close();
        return;
    }

    const question = new Question({
        _id: question_id,
        question: data.question,
        answer: data.answer,
        distractors: data.distractors
    });

    errs = question.validateSync();

    if (errs) {
        callback(null, createErrorResponse(400, 'Incorrect parameters'));
        db.close();
        return;
    }

    db.once('open', () => {
        Question.findByIdAndUpdate(question_id, question)
            .then((question) => {
                callback(null, createSuccessResponse(200, question));
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
    const question_id = event.pathParameters.question_id;

    if (!mongoose.Types.ObjectId.isValid(question_id)) {
        callback(null, createErrorResponse(400, 'Invalid id'));
        db.close();
        return;
    }

    db.once('open', () => {
        Question
            .remove({_id: question_id})
            .then(() => {
                callback(null, createSuccessResponse(204));
            })
            .catch((err) => {
                callback(null, createErrorResponse(err.statusCode, err.message));
            })
            .finally(() => {
                db.close();
            });
    });
};
