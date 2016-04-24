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

    Language.findOne({'name': langName},
      function (err, language) {
        if (err) {
          req.flash('langMsg', err);
          res.json(err);

        } else {
          if (language) {
            req.flash('langMsg', 'That language already exists. Please edit existing language instead.');
            res.json('That language already exists. Please edit existing language instead.');

          } else {
            language = new Language({
              name: langName,
              map: langPath,
              reading: [],
              numbers: []
            });

            language.save(function(err) {
              if (err) {
                req.flash('langMsg', err);
                res.json(err);

              } else {
                req.flash('langMsg', 'New language added.');
                res.json(language);
              }
            });
          }
        }
    });
  },
  getModules: function (req, res, next) {
    var langName, map, readModules, numModules, readLength, numLength, readArray,
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
          map = language.map;
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
            map: map,
            title: 'Available Learning Modules',
            message: req.flash('moduleMsg')
          });
        }
      }
    });//.lean(); //'lean' so Mongoose returns raw JS object, which can be modified
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