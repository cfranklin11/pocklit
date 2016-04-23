'use strict';

var mongoose, moduleSchema;

mongoose = require('mongoose');

moduleSchema = mongoose.Schema({
  index: Number,
  section: String,
  lessons: [{
    reception: {text: String},
    textInput: {
      options: [{
        text: String,
        correct: Boolean
      }]
    },
    voiceInput: {text: String}
  }]
});

module.exports = moduleSchema;