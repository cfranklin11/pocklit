'use strict';

var adminHelper, configAuth;

adminHelper = require( '../middleware/admin.js' );
configAuth = require( '../config/auth.js' );

module.exports = function ( app, passport ) {

  // =====================================
  // LOGIN PAGE ==========================
  // =====================================

  app.get( '/', function ( req, res ) {
    res.render( 'index', { message: req.flash( 'loginMsg' )});
  });

  // process the login form
  // app.post( '/login', passport.authenticate( 'local-login', {
  //   successRedirect: '/admin',
  //   failureRedirect: '/',
  //   failureFlash: true
  // }));

  app.post( '/login', function(req, res, next) {
    res.redirect('/admin');
  });

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // // show the signup form
  // app.get( '/signup', function ( req, res ) {

  //   // render the page and pass in any flash data if it exists
  //   res.render( 'signup.ejs', {
  //     message: req.flash( 'signupMsg' )
  //   });
  // });

  // // process the signup form
  // app.post( '/signup', passport.authenticate( 'local-signup', {
  //   successRedirect: '/admin', // redirect to the secure profile section
  //   failureRedirect: '/signup', // redirect back to the signup page if there is an error
  //   failureFlash: true // allow flash messages
  // }));

  // =====================================
  // ADMIN ==============================
  // =====================================
  // app.all( '/admin*', isLoggedIn, isAdmin, function ( req, res, next ) {
  //   next();
  // });

  // PARAMETERS
  app.param( 'language', function ( req, res, next, user ) {
    req.eduLanguage = language;
    next();
  });
  app.param( 'module', function ( req, res, next, account ) {
    req.eduModule = module;
    next();
  });

  // ADMIN
  app.get( '/admin', function ( req, res ) {
    res.render( 'admin', { message: req.flash( 'adminMsg' )});
  });

  // LANGUAGE ADMIN
  app.get( '/admin/languages', function ( req, res ) {
    adminHelper.getLanguages( req, res );
  });
  app.post( '/admin/languages', function ( req, res ) {
    adminHelper.addLanguage( req, res );
  });
  // app.post( '/admin/languages/:language/delete', function ( req, res ) {
  //   adminHelper.deleteLanguage( req, res );
  // });

  // MODULE ADMIN
  app.get( '/admin/languages/:language/modules', function(req, res) {
    adminHelper.getModules(req, res);
  });
  app.post( '/admin/languages/:language/modules', function ( req, res ) {
    adminHelper.addModule( req, res );
  });
  app.get( '/admin/languages/:language/modules/:module', function(req, res) {
    adminHelper.getModule(req, res);
  });
  app.post( '/admin/languages/:language/modules/:module/delete',
    function ( req, res ) {
      adminHelper.deleteModule( req, res );
  });

  // API DATA ROUTES
  app.get( '/api/languages/:language/modules', function ( req, res ) {
    var section;

    section = req.body.section;
    adminHelper.getModules(req, res);
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('loginMsg', 'You need to log in to see that page.');
  res.redirect('/login');
}