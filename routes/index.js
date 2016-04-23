'use strict';

var adminHelper = require( './middleware/admin.js' );

module.exports = function ( app ) {

  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  /* GET users listing. */
  app.get('/users', function(req, res, next) {
    res.send('respond with a resource');
  });
};