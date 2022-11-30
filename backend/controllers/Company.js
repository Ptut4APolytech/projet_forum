'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Company = require('../services/CompanyService.js');

/**
 * Retourne la liste des entreprises
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getCompanies = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student'])) { return; }

    Company.getCompanies().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};


/**
 * Retourne une entreprise selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getCompany = async function (req, res, next) {

    const companyId = req.swagger.params.companyId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student', 'representative'], ['company'], companyId)) { return; }

    Company.getCompany(companyId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};


/**
 * Suppression d'une entreprise
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delCompany = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const companyId = req.swagger.params.companyId.value;

    Company.delCompany(companyId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'une entreprise
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setCompany = async function (req, res, next) {

    const companyId = req.swagger.params.companyId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'], ['company'], companyId)) { return; }
    const body = req.body;

    Company.setCompany(companyId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'une entreprise
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addCompany = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const body = req.body;

    Company.addCompany(body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};
