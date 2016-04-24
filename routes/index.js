'use strict';

var adminHelper, configAuth;

adminHelper = require( '../middleware/admin.js' );
configAuth = require( '../config/auth.js' );

module.exports = function ( app, passport ) {

  // =====================================
  // LANDING PAGE ==========================
  // =====================================

  app.get( '/', function ( req, res ) {
    res.render( 'index', { message: req.flash( 'adminMsg' )});
  });
  // app.get('/upload', function(req, res, next) {
  //   adminHelper.uploadData(req, res, next);
  // });

  // =====================================
  // ADMIN ==============================
  // =====================================

  // PARAMETERS
  app.param( 'language', function ( req, res, next, language ) {
    req.eduLanguage = language;
    next();
  });
  app.param( 'module', function ( req, res, next, module ) {
    req.eduModule = module;
    next();
  });

  // LANGUAGE ADMIN
  app.get( '/admin/languages', function ( req, res ) {
    adminHelper.getLanguages( req, res );
  });
  app.get( '/admin/languages/create', function ( req, res ) {
    res.render( 'language-create', { message: req.flash( 'langMsg' )});
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
  app.get( '/admin/languages/:language/modules/create', function(req, res) {
    res.render( 'module-create', { message: req.flash( 'moduleMsg' )});
  });
  app.post( '/admin/languages/:language/modules', function ( req, res ) {

    res.redirect('/admin/languages');
      req.flash('langMsg', 'Module creation not yet enabled.');
  });
  // app.get( '/admin/languages/:language/modules/:module', function(req, res) {
  //   adminHelper.getModule(req, res);
  // });
  // app.post( '/admin/languages/:language/modules/:module/delete',
  //   function ( req, res ) {
  //     adminHelper.deleteModule( req, res );
  // });

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