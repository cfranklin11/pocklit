'use strict';

var fs, parse, Language, self;

fs = require('fs');
parse = require('csv-parse');
Language = require('../models/language.js');

self = module.exports = {
  getLanguages: function (req, res, next) {
    Language.find({'name': /.*/},
      function (err, languages) {
        if (err) {
          req.flash('adminMsg', err);
          res.redirect('/');

        } else {
          if (!languages) {
            req.flash('adminMsg', 'No languages found.');
            res.redirect('/');

         } else {
            res.render('languages.ejs', {
              languages: languages,
              title: 'Languages that Have Modules',
              message: req.flash('langMsg')
           });
          }
        }
    });
  },
  addLanguage: function(req, res, next) {
    var inputs,langName, langPath;

    console.log(req.body);

    inputs = req.body;

    langName = inputs.name;
    langPath = inputs.path;

    // Language.findOne({'name': langName},
    //   function (err, language) {
    //     if (err) {
    //       req.flash('langMsg', err);
    //       res.redirect('/admin/languages');

    //     } else {
    //       if (language) {
    //         req.flash('langMsg', 'That language already exists. Please edit existing language instead.');
    //         res.redirect('/admin/languages');

    //       } else {
    //         language = new Language({
    //           name: langName,
    //           reading: [],
    //           numbers: []
    //         });

    //         language.save(function(err) {
    //           if (err) {
    //             req.flash('langMsg', err);
    //             res.redirect('/admin/languages');

    //           } else {
    //             req.flash('langMsg', 'New language added.');
    //             res.redirect('/admin/languages');
    //           }
    //         });
    //       }
    //     }
    // });
  },
  getModules: function (req, res, next) {
    var langName, readModules, numModules, readLength, numLength, readArray,
      numArray, i, moduleIndex;

    langName = req.eduLanguage;

    Language.findOne({'name': langName}, function (err, language) {
      if (err) {
        req.flash('langMsg', err);
        res.redirect('/admin/languages');

      } else {
        if (!language) {
          req.flash('langMsg', 'Language not found.');
          res.redirect('/admin/languages');

        } else {
          readModules = language.reading;
          numModules = language.numbers;
          readLength = readModules.length;
          numLength = numModules.length;
          readArray = [];
          numArray = [];

          for (i = 0; i < readLength; i++) {
            moduleIndex = readModules[i].index;
            readArray[moduleIndex] = moduleIndex;
          }

          readArray.sort(function(a, b) {a - b});

          for (i = 0; i < numLength; i++) {
            moduleIndex = numModules[i].index;
            numArray[moduleIndex] = moduleIndex;
          }

          numArray.sort(function(a, b) {a - b});

          res.render('modules.ejs', {
            reading: readArray,
            numbers: numArray,
            name: langName,
            title: 'Available Learning Modules',
            message: req.flash('moduleMsg')
          });
        }
      }
    });//.lean(); //'lean' so Mongoose returns raw JS object, which can be modified
  },
  addModule: function (req, res, next) {
    var moduleName, form, section, lessons;

    moduleName = req.eduModule;
    form = req.body;
    section = form['x-coord'];
    y = form['y-coord'];
    locationTitle = form.title;
    locationId = locationTitle.toLowerCase();
    descriptionText = form.description;
    linkUrl = form['link-url'];
    linkText = form['link-text'];
    category = form.category;
    imgNames = form.images;

    // Images need to be in form of an array
    if (typeof imgNames === 'string') {
      if (imgNames === '') {
        imgNames = [];
      } else {
        imgNames = [imgNames];
      }
    }

    newLocation = {
      id: locationId,
      title: locationTitle,
      description: {
        images: imgNames,
        text: descriptionText,
        link: {
          text: linkText,
          url: linkUrl
        }
      },
      category: category,
      x: x,
      y: y,
      pin: 'circular',
      fill: 'red'
    };

    Mapa.findOne({'id': mapId},
      function (err, map) {
        if (err) {
          req.flash('mapMsg', err);
          res.redirect('/admin/mapas/' + mapId);

        } else {
          if (!map) {
            req.flash('mapMsg', 'No se encontró ese mapa.');
            res.redirect('/admin/mapas');

          } else {
            map.locations.push(newLocation);

            map.save(function(err) {
              if (err) {
                req.flash('mapMsg', err);
                res.redirect('/admin/mapas/' + mapId + '/puntos/agregar');

              } else {
                req.flash('mapMsg', 'Se agregó el punto nuevo.');
                res.redirect('/admin/mapas/' + mapId);
              }
            });
          }
        }
    });
  },
  getLocation: function (req, res, next) {
    var mapId, locationId, i, thisLocation;

    mapId = req.map;
    locationId = req.location;

    Mapa.findOne({'id': mapId}, function(err, map) {
      if (err) {
        req.flash('mapMsg', err);
        res.redirect('/admin/mapas');

      } else {
        if (!map) {
          req.flash('mapMsg', 'No se encontró el mapa.');
          res.redirect('/admin/mapas');

        } else {
          i = 0;
          while (map.locations[i].id !== locationId &&
            i < map.locations.length) {
            i++
          }

          thisLocation = map.locations[i];

          res.render('admin-punto-editar.ejs', {
            title: 'Editar punto',
            x: thisLocation.x,
            y: thisLocation.y,
            locationTitle: thisLocation.title,
            description: thisLocation.description.text,
            linkText: thisLocation.description.link.text,
            linkUrl: thisLocation.description.link.url,
            category: thisLocation.category,
            images: thisLocation.description.images
          });
        }
      }
    });
  },
  editLocation: function (req, res, next) {
    var mapId, locationId, form, locationTitle, newLocationId, descriptionText,
      linkUrl, linkText, category, imgNames, keyArray, key, keyString, i,
      modifyLocation, x, y, locationImages, j, removed, k;

    mapId = req.map;
    locationId = req.location;
    form = req.body;
    locationTitle = form.title;
    newLocationId = locationTitle.toLowerCase();
    descriptionText = form.description;
    linkUrl = form['link-url'];
    linkText = form['link-text'];
    category = form.category;
    imgNames = form.images;

    // Images need to be in form of an array
    if (typeof imgNames === 'string') {
      if (imgNames === '') {
        imgNames = [];
      } else {
        imgNames = [imgNames];
      }
    }

    keyArray = [];

    // Create array of checked image names to remove from location images
    for (key in form) {
      if (key.search('remove-') >= 0) {
        keyString = key.slice(7);
        keyArray.push(keyString);
      }
    }

    Mapa.findOne({'id': mapId},
      function (err, map) {
        if (err) {
          req.flash('mapMsg', err);
          res.redirect('/admin/mapas');

        } else {
          if (!map) {
            req.flash('mapMsg', 'No se encontró ese mapa.');
            res.redirect('/admin/mapas');

          } else {
            i = 0;
            while (map.locations[i].id !== locationId &&
              i < map.locations.length) {
              i++
            }

            modifyLocation = map.locations[i];

            x = modifyLocation.x
            y = modifyLocation.y
            locationImages = modifyLocation.description.images;

            for (j = 0; j < locationImages.length; j++) {
              removed = false

              // Check location images array for removed images
              for (k = 0; k < keyArray.length; k++) {
                if (keyArray[k] === locationImages[j]) {
                  keyArray.splice(k, 1);
                  k--;
                  removed = true
                }
              }

              // If an image wasn't removed, add it to the new images array
              if (!removed) {imgNames.push(locationImages[j]);}
            }

            // Modifying location object with dot notation, because Mongoose
            // doesn't like literal notation
            modifyLocation.id = newLocationId;
            modifyLocation.title = locationTitle;
            modifyLocation.category = category;
            modifyLocation.description.images = imgNames;
            modifyLocation.description.text = descriptionText;
            modifyLocation.description.link.text = linkText;
            modifyLocation.description.link.url = linkUrl;

            map.save(function(err) {
              if (err) {
                req.flash('mapMsg', err);
                res.redirect('/admin/mapas/' + mapId + '/puntos/' +
                  locationId + '/editar');

              } else {
                req.flash('mapMsg', 'Se revisó el punto.');
                res.redirect('/admin/mapas/' + mapId);
              }
            });
          }
        }
    });
  },
  removeLocation: function (req, res, next) {
    var mapId, locId, i, locationsLength;

    mapId = req.map;
    locId = req.location;

    Mapa.findOne({'id': mapId},
      function (err, map) {
        if (err) {
          req.flash('mapMsg', err);
          res.redirect('/admin/mapas/' + mapId);

        } else {
          if (!map) {
            req.flash('mapMsg', 'No se encontró ese mapa.');
            res.redirect('/admin/mapas');

          } else {
            i = 0;
            while (map.locations[i].id !== locId && i < map.locations.length) {
              i++;
            }
            map.locations[i].remove();

            map.save(function(err) {
              if (err) {
                req.flash('mapMsg', err);
                res.redirect('/admin/mapas/' + mapId);

              } else {
                req.flash('mapMsg', 'Se borró el punto.');
                res.redirect('/admin/mapas/' + mapId);
              }
            });
          }
        }
    });
  },
  uploadData: function(req, res, next) {
    var parser, i, thisData, langName, thisSection, thisModule, langObject,
      langArray, modules, moduleLength, j, moduleMatch, lessonMatch, lessons, lessonsLength,
      k, item;

    langObject = {};
    langArray = [];

    parser = parse({delimiter: ',', columns: true}, function(err, data){

      for (i = 0; i < data.length; i++) {
        thisData = data[i];
        langName = thisData['language-name'];
        thisSection = thisData['module-section'];
        thisModule = {
          index: thisData['module-index'],
          section: thisSection,
          lessons: [{
            reception: {text: thisData['reception-text']},
            textInput: {
              options: [{
                text: thisData['textInput-option-text'],
                correct: thisData['textInput-option-correct']
              }]
            },
            voiceInput: {text: thisData['voiceInput-text']}
          }]
        };

        if (langObject[langName]) {
          if (langObject[langName][thisSection]) {
            modules = langObject[langName][thisSection];
            moduleLength = modules.length;
            moduleMatch = false;

            for (j = 0; j < moduleLength; j++) {
              if (modules[j].index === thisModule.index) {
                moduleMatch = true;
                lessonMatch = false;
                lessons = modules[j].lessons;
                lessonsLength = lessons.length;

                for (k = 0; k < lessonsLength; k++) {
                  if (lessons[k].reception.text === thisModule.lessons[0].reception.text) {
                    lessonMatch = true;
                    langObject[langName][thisSection][j].lessons[k].textInput.options.push(
                      thisModule.lessons[0].textInput.options[0]
                    );
                    break;
                  }
                }

                if (!lessonMatch) {
                  langObject[langName][thisSection][j].lessons.push(thisModule.lessons[0]);
                }
                break;
              }
            }

            if (!moduleMatch) {
              langObject[langName][thisSection].push(thisModule);
            }

          } else {
            langObject[langName][thisSection] = [thisModule];
          }

        } else {
          langObject[langName] = {name: langName};
          langObject[langName][thisSection] = [thisModule];
        }
      }

      for (item in langObject) {
        langArray.push(langObject[item]);
      }

      Language.create(langArray, function(err, languages) {
        if (err) {
          console.log(err);
        }

        console.log(languages);
      });

      res.send('uploaded');
    });

    fs.createReadStream(__dirname + '/model-data.csv').pipe(parser);
  }
};