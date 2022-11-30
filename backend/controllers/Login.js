'use strict';

var utils = require('../utils/writer.js');
var Login = require('../services/LoginService');

module.exports.login = function (req, res, next) {

    const email = req.body.email;
    const password = req.body.password;

    Login.login(email, password).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

