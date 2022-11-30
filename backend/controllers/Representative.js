'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Representative = require('../services/RepresentativeService.js');

/**
 * Retourne la liste des représentants des entreprises
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getRepresentatives = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Representative.getRepresentatives().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne un représentant selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getRepresentative = async function (req, res, next) {

    const representativeId = req.swagger.params.representativeId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'], ['representative'], representativeId)) { return; }

    Representative.getRepresentative(representativeId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Suppression d'un représentant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delRepresentative = async function (req, res, next) {

    const representativeId = req.swagger.params.representativeId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Representative.delRepresentative(representativeId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'un représentant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setRepresentative = async function (req, res, next) {

    const representativeId = req.swagger.params.representativeId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'], ['representative'], representativeId)) { return; }
    const body = req.body;

    Representative.setRepresentative(representativeId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'un représentant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addRepresentative = async function (req, res, next) {

    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }
    const body = req.body;

    Representative.addRepresentative(body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};
