'use strict';

var mongoose, moduleSchema, languageSchema;

mongoose = require('mongoose');
moduleSchema = require('./module.js');

languageSchema = mongoose.Schema({
  name: String,
  sections: {
    reading: [moduleSchema],
    numbers: [moduleSchema]
  }
});

module.exports = mongoose.model('Language', languageSchema);