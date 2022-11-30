'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var User = require('../services/UserService.js');

/**
 * Retourne la liste des utilisateurs
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getUsers = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    User.getUsers().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne un utilisateur selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getUser = async function (req, res, next) {

    const userId = req.swagger.params.userId.value;

    User.getUser(userId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Suppression d'un utilisateur
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delUser = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }
    const userId = req.swagger.params.userId.value;

    User.delUser(userId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'un utilisateur
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setUser = function (req, res, next) {

    const userId = req.swagger.params.userId.value;
    const body = req.body;

    User.setUser(userId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'un utilisateur
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addUser = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const body = req.body;

    User.addUser(body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

module.exports.resetPassword = async function (req, res, next) {

    const email = req.body.email

    User.resetPassword(email).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

module.exports.updatePasswordByToken = async function (req, res, next) {

    const password = req.body.password
    const token = req.swagger.params.token.value;

    User.updatePasswordByToken(password, token).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};