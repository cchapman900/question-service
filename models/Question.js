const mongoose = require('mongoose');
const validator = require('validator');


const model = mongoose.model('User', {
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
    validate: {
      validator(answer) {
        return validator.isNumeric(answer);
      },
    },
  },
  distractors: [{
    type: String,
    required: true,
    validate: {
        validator(answer) {
            return validator.isNumeric(answer);
        },
    },
  }],
});

module.exports = model;
