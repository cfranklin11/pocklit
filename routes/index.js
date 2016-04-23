'use strict';

var adminHelper = require( './middleware/admin.js' );

module.exports = function ( app ) {


var adminHelper, configAuth;

adminHelper = require( './middleware/admin.js' ),
configAuth = require( './config/auth.js' ),

module.exports = function ( app, passport ) {

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================

  app.get( '/', function ( req, res ) {
    res.render( 'index.ejs', { message: req.flash( 'loginMsg' )});
  });

  // process the login form
  app.post( '/login', passport.authenticate( 'local-login', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get( '/signup', function ( req, res ) {

    // render the page and pass in any flash data if it exists
    res.render( 'signup.ejs', {
      message: req.flash( 'signupMsg' )
    });
  });

  // process the signup form
  app.post( '/signup', passport.authenticate( 'local-signup', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =====================================
  // ADMIN ==============================
  // =====================================
  app.all( '/admin*', isLoggedIn, isAdmin, function ( req, res, next ) {
    next();
  });

  // PARAMETERS
  app.param( 'user', function ( req, res, next, user ) {
    req.appUser = user;
    next();
  });

  app.param( 'account', function ( req, res, next, account ) {
    req.account = account;
    next();
  });

  app.get( '/admin', function ( req, res ) {
    res.render( 'admin.ejs', { message: req.flash( 'adminMsg' )});
  });

  // ACCOUNT ADMIN
  app.get( '/admin/accounts', function ( req, res ) {
    adminHelper.getAccounts( req, res );
  });

  app.post( '/admin/accounts', function ( req, res ) {
    adminHelper.addAccount( req, res );
  });

  app.get( '/admin/accounts/:platform',
    function ( req, res ) {
      adminHelper.getFbToken( req, res );
    }
  );

  app.post( '/admin/accounts/:account/delete', function ( req, res ) {
    adminHelper.deleteAccount( req, res );
  });

  // USER ADMIN
  app.get( '/admin/users', function ( req, res ) {
    adminHelper.getUsers( req, res );
  });

  app.get( '/admin/users/:user', function ( req, res ) {
    adminHelper.getUser( req, res );
  });

  app.post( '/admin/users/:user', adminHelper.toggleAdmin, function ( req, res ) {
    res.redirect( '/admin/users/' + encodeURIComponent( req.appUser ));
  });

  app.post( '/admin/users/:user/delete', function ( req, res ) {
    adminHelper.deleteUser( req, res );
  });

  app.get( '/admin/users/:user/accounts', function ( req, res ) {
    adminHelper.getAccounts( req, res );
  });

  app.post( '/admin/users/:user/accounts', function ( req, res ) {
    adminHelper.addUserAccount( req, res );
  });

  app.post( '/admin/users/:user/accounts/:account/delete', function ( req, res ) {
    adminHelper.deleteUserAccount( req, res );
  });

  // API DATA ROUTES
  app.get( '/api/:metric/:time', function ( req, res ) {
    var metric, time;

    metric = req.dataMetric;
    time = req.dataTime;

    switch ( metric ) {

      case 'spend':
        req.customParams = {
          metric: 'Spend',
          label: 'Pub. Cost $'
        };
        break;

      case 'impressions':
        req.customParams = {
          metric: 'Impressions',
          label: 'Impr.'
        };
        break;

      case 'clicks':
        req.customParams = {
          metric: 'Clicks',
          label: 'Clicks'
        };
        break;

      case 'conversions':
        req.customParams = {
          metric: 'Conversions',
          label: 'Conv.'
        };
        break;
    }

    switch ( time ) {

      case 'total':
        d3Helper.getTotalData( req, res );
        break;

      case 'now':
        d3Helper.getNowData( req, res );
        break;
    }
  });

  app.get( '/api/accounts', function ( req, res ) {
    req.customParams = {
      metric: 'Account',
    };

    d3Helper.getAccountList( req, res );
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('loginMsg', 'Debes iniciar una sesión para ver esta página');
  res.redirect('/acceder');
}