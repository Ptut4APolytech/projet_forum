'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Admin = require('../services/AdminService');
const {getRepresentatives} = require("../services/RepresentativeService");
const {getStudents} = require("../services/StudentService");

/**
 * Retourne la liste des étudiants
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getAdmins = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Admin.getAdmins().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Envoi l'enquete
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.sendSurvey = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Admin.sendSurvey().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};