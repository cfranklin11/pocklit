'use-strict';

var LocalStrategy, User, config;

LocalStrategy = require('passport-local').Strategy;
User = require('../public/javascripts/models/user');
config = require('../config/auth');

module.exports = function (passport) {

  // passport needs ability to serialize and unserialize users out of session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser( function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // LOCAL SIGNUP
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function (req, email, password, done) {
      process.nextTick( function () {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to sign up already exists
        User.findOne({
          'email': email
        }, function (err, user) {
          var newUser, adminEmail;

          adminEmail = config.admin;

          if (err) {
            return done(err);
          }

          // check to see if there's already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMsg',
              'That email is already taken.'));
          } else {

            // if there is no user with that email
            // create the user
            newUser = new User();

            // set the user's local credentials
            newUser.email = email;
            newUser.password = newUser.generateHash(password);

            if (email === adminEmail) {
              newUser.admin = true;
            } else {
              newUser.admin = false;
            }

            // save the user
            newUser.save(function(err) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
  }));

  // LOCAL LOGIN
  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function (req, email, password, done) {

      // find a user whose email is the same as the form's email
      // we are checking to see if the user trying to log in already exists
      User.findOne({
        'email': email
      }, function (err, user) {
        if (err) {
          return done(err);
        }

        // if no user is found, return the message
        if (!user)
          return done( null, false, req.flash('loginMsg', 'No se encuentra el usuario'));

        // if the user is found but the password is wrong
        if (!user.validPassword( password))
          return done( null, false, req.flash('loginMsg', 'Clave incorrecta'));

        // all is well, return successful user
        return done(null, user);
      });
  }));
};