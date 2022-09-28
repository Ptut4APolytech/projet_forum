'use strict';

var utils = require('../utils/writer.js');
var Test = require('../services/TestService');

module.exports.hello = function (req, res, next) {
    
    Test.hello(req, res)
      .then(function (response) {
        utils.writeJson(res, response);
      })
      .catch(function (response) {
        utils.writeJson(res, response);
      });
  };