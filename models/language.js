'use strict';

var mongoose, moduleSchema, languageSchema;

mongoose = require('mongoose');
moduleSchema = require('./module.js');

languageSchema = mongoose.Schema({
  name: String,
  map: String,
  reading: [moduleSchema],
  numbers: [moduleSchema]
});

module.exports = mongoose.model('Language', languageSchema);