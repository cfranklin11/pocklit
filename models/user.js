'use strict';

var mongoose, bcrypt, userSchema;

mongoose = require('mongoose');
bcrypt = require('bcrypt-nodejs');

userSchema = mongoose.Schema({
  email: String,
  password: String,
  admin: Boolean
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);