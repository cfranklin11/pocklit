'use strict';

// load up the user model
var Account = require( '../public/js/models/account' ),
  User = require( '../public/js/models/user' ),
  FB = require( 'fb' ),
  postmark = require( './postmark.js' );

var self = module.exports = {

  getAccounts: function ( req, res ) {

    // find a user whose email is the same as the forms email
    Account.find({ 'name': /.*/ },
      function ( err, accounts ) {
        // if there are any errors, return the error before anything else
        if ( err ) {
          req.flash( 'adminMsg', err );
          res.redirect( '/admin' );

        } else {
          var appUser = req.appUser;
          req.appUser = null;

          // if all is well, return next
          res.render( 'accounts.ejs',
            { accounts: accounts,
              message: req.flash( 'accountMsg' ),
              user: req.user,
              appUser: appUser
            }
          );
        }
      }
    );
  },

  addAccount: function ( req, res ) {
    if ( req.body.platform === 'facebook' ) {
      self.addFbAccount( req, res );
    } else {
      req.flash( 'accountMsg', "We don't have access to that platform's campaigns yet." );
      res.redirect( 'admin/accounts' );
    }
  },

  addFbAccount: function ( req, res ) {
    var accountId = req.body.id,
      token = req.user.facebook.token;

    FB.setAccessToken( token );

    FB.api('/v2.5/act_' + accountId,
      { fields: [ 'name', 'account_id' ]},
      function (response) {
        if ( response.error ) {
          console.log( response.error );
          req.flash( 'accountMsg', response.error );
          res.redirect( '/admin/accounts' );

        } else {
          if ( response && !response.error ) {
            console.log( response );

            var accountId = response.account_id,
              accountName = response.name;

            // find a user whose email is the same as the forms email
            Account.findOne({ 'name': accountName },
              function ( err, account ) {
                if ( err ) {
                  req.flash( 'accountMsg', err );
                  res.redirect( '/admin/accounts' );

                } else {
                  // if no user is found, return the message
                  if ( account ) {
                  // req.flash is the way to set flashdata using connect-flash
                    req.flash( 'accountMsg', 'That account is already in the database.' );
                    res.redirect( '/admin/accounts' );

                  } else {
                    // if there is no user with that email
                    // create the user
                    var newAccount = new Account();

                    // set the user's local credentials
                    newAccount.platform = 'facebook';
                    newAccount.channel = 'social';
                    newAccount.name = accountName;
                    newAccount.id = accountId;
                    newAccount.adminUser = req.user.local.email;

                    // save the user
                    newAccount.save( function ( err ) {
                      if ( err )
                        throw err;

                      req.flash( 'accountMsg', 'Account added.' )
                      res.redirect( '/admin/accounts' );
                    });
                  }
                }
              }
            );
          } else {
            req.flash( 'accountMsg', "Well, that didn't work" );
            res.redirect( '/admin/accounts' );
          }
        }
      }
    );
  },

  deleteAccount: function ( req, res ) {
    var accountId = req.account;

    // find a user whose email is the same as the forms email
    Account.remove({ 'id': accountId }, function ( err, dbRes ) {
      console.log(dbRes);
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'accountMsg', err );
        res.redirect( '/admin/accounts' );

      } else {
        // if no user is found, return the message
        if ( dbRes.n === 0 ) {
          // req.flash is the way to set flashdata using connect-flash
          req.flash( 'accountMsg', 'No account found.' );
          res.redirect( '/admin/accounts' );

        } else {
          req.flash( 'accountMsg', 'Account was removed.' );
          res.redirect( '/admin/accounts' );
        }
      }
    });
  },

  getUsers: function ( req, res ) {

    // find a user whose email is the same as the forms email
    User.find({ 'local.email': /.*/ },
      function ( err, users ) {
        // if there are any errors, return the error before anything else
        if ( err ) {
          req.flash( 'adminMsg', err );
          res.redirect( '/admin' );

        } else {
          // if no user is found, return the message
          if ( !users ) {
          // req.flash is the way to set flashdata using connect-flash
            req.flash( 'adminMsg', 'No users found.' );
            res.redirect( '/admin' );

          } else {
            console.log( users );
            // if all is well, return next
            res.render( 'users.ejs', { users: users, message: req.flash( 'userMsg' )});
          }
        }
      }
    );
  },

  getUser: function ( req, res ) {
    var userEmail = req.appUser;

    // find a user whose email is the same as the forms email
    User.findOne({ 'local.email': userEmail }, function ( err, user ) {
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'userMsg', err );
        res.redirect( '/admin/users' );

      } else {
        // if no user is found, return the message
        if ( !user ) {
        // req.flash is the way to set flashdata using connect-flash
          req.flash( 'userMsg', 'User not found.' );
          res.redirect( '/admin/users' );

        } else {
          // if all is well, return next
          console.log( user );
          res.render( 'user.ejs', { user: user, message: req.flash( 'userMsg' )});
        }
      }
    });
  },

  toggleAdmin: function ( req, res, next ) {
    var userEmail = req.appUser;

    // find a user whose email is the same as the forms email
    User.findOne({ 'local.email': userEmail }, function ( err, user ) {
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'userMsg', err );
        res.redirect( '/admin/users' );

      } else {
        // if no user is found, return the message
        if ( !user ) {
        // req.flash is the way to set flashdata using connect-flash
          req.flash( 'userMsg', 'User not found.' );
          res.redirect( '/admin/users' );

        } else {
          if ( !user.admin ) {
            self.makeAdmin( req, res, next, user );
          } else {
            self.removeAdmin( req, res, next, user );
          }
        }
      }
    });
  },

  makeAdmin: function ( req, res, next, user ) {
    var userEmail = user.local.email;

    // find a user whose email is the same as the forms email
    User.update({ 'local.email': userEmail }, { admin: true }, function ( err, dbRes ) {
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'userMsg', err );
        res.redirect( '/admin/users' );

      } else {
        // if no user is found, return the message
        if ( dbRes.n === 0 ) {
          // req.flash is the way to set flashdata using connect-flash
          req.flash( 'userMsg', 'No user found' );
          res.redirect( '/admin/users' );

        } else {
          // if all is well, return next
          console.log( dbRes );
          req.flash( 'userMsg', userEmail + ' was made admin.' );
          next();
        }
      }
    });
  },

  removeAdmin: function ( req, res, next, user ) {
    var userEmail = user.local.email;

    // find a user whose email is the same as the forms email
    User.update({ 'local.email': userEmail }, { admin: false }, function ( err, dbRes ) {
      console.log(dbRes);
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'userMsg', err );
        res.redirect( '/admin/users' );
      } else {

        // if no user is found, return the message
        if ( dbRes.n === 0 ) {
          // req.flash is the way to set flashdata using connect-flash
          req.flash( 'userMsg', 'No user found' );
          res.redirect( '/admin/users' );
        } else {

          // if all is well, return next
          console.log( dbRes );
          req.flash( 'userMsg', 'Admin access was removed from ' + userEmail );
          next();
        }
      }
    });
  },

  deleteUser: function ( req, res, next ) {
    var userEmail = req.appUser;

    // find a user whose email is the same as the forms email
    User.remove({ 'local.email': userEmail }, function ( err, dbRes ) {
      // if there are any errors, return the error before anything else
      if ( err ) {
        req.flash( 'userMsg', err );
        res.redirect( '/admin/users' );

      } else {
        // if no user is found, return the message
        if ( dbRes.n === 0 ) {
          // req.flash is the way to set flashdata using connect-flash
          req.flash( 'userMsg', 'No user found' );
          res.redirect( '/admin/users' );

        } else {
          req.flash( 'userMsg', 'User was removed' );
          res.redirect( '/admin/users' );
        }
      }
    });
  },

  addUserAccount: function ( req, res, next ) {
    var userEmail = req.appUser,
      newAccountId = req.body.accountId;

    // find a user whose email is the same as the forms email
    User.findOne({ 'local.email': userEmail },
      'accounts',
      function ( err, user ) {
        // if there are any errors, return the error before anything else
        if ( err ) {
          req.flash( 'userMsg', err );
          res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));

        } else {
          // if no user is found, return the message
          if ( !user ) {
          // req.flash is the way to set flashdata using connect-flash
            req.flash( 'userMsg', 'User not found.' );
            res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));

          } else {
            var userAccounts = user.accounts || [];

            Account.findOne({ 'id': newAccountId },
              function ( err, account ) {
                if ( err ) {
                  req.flash( 'userMsg', err );
                  res.redirect( '/admin/users/' + encodeURIComponent( userEmail ) + '/accounts');

                } else {
                  // if no account is found, return the message
                  if ( !account ) {
                  // req.flash is the way to set flashdata using connect-flash
                    req.flash( 'userMsg', 'Account not found.' );
                    res.redirect( '/admin/users/' + encodeURIComponent( userEmail ) + '/accounts');

                  } else {
                    var newUserAccount = {
                        channel: account.channel,
                        platform: account.platform,
                        name: account.name,
                        id: account.id,
                        adminUser: account.adminUser
                      },
                      newUserAccounts = [];
                      newUserAccounts.push( newUserAccount );

                    user.accounts = newUserAccounts;
                    user.save( function ( err ) {
                      if ( err ) {
                        console.log(err);
                        req.flash( 'accountMsg', err );
                        res.redirect( '/admin/users/' + encodeURIComponent( userEmail ) + '/accounts' );

                      } else {
                        postmark.sendAccessSuccess( userEmail,
                          newUserAccount.name, newUserAccount.platform );
                        req.flash( 'userMsg', 'Account added to user profile.' );
                        res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));
                      }
                    });
                  }
                }
              }
            );
          }
        }
      }
    );
  },

  deleteUserAccount: function ( req, res, next ) {
    var userEmail = req.appUser,
      accountId = req.account;

    // find a user whose email is the same as the forms email
    User.findOne({ 'local.email': userEmail },
      'accounts',
      function ( err, user ) {
        // if there are any errors, return the error before anything else
        if ( err ) {
          req.flash( 'userMsg', err );
          res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));

        } else {
          // if no user is found, return the message
          if ( !user ) {
          // req.flash is the way to set flashdata using connect-flash
            req.flash( 'userMsg', 'User not found.' );
            res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));

          } else {
            var userAccounts = user.accounts || [],
              i = 0;

            do {
              if ( accountId === userAccounts[ i ][ 'id' ]) {
                userAccounts.splice( i, 1 );
              }
              i++;
            } while ( i < userAccounts.length && accountId !== userAccounts[ i ][ 'id' ] );

            user.accounts = userAccounts;
            user.save( function ( err ) {
              if ( err ) {
                console.log(err);
                req.flash( 'accountMsg', err );
                res.redirect( '/admin/users/' + encodeURIComponent( userEmail ) + '/accounts' );
              } else {
                req.flash( 'userMsg', 'Account removed from user profile.' );
                res.redirect( '/admin/users/' + encodeURIComponent( userEmail ));
              }
            });
          }
        }
      }
    );
  }
};