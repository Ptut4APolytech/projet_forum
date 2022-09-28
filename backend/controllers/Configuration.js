'use strict';

const utils = require('../utils/writer.js');
const roleUtil = require('../utils/role');
const Configuration = require('../services/ConfigurationService');

/**
 * Retourne la configuration générale de l'application
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getConfiguration = async function (req, res, next) {

    Configuration.getConfiguration().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification de la configuration
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setConfiguration = async function (req, res, next) {

    // Modification autorisée pour les admins uniquement
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const configuration = await Configuration.getConfiguration();

    const configurationId = configuration.id;
    const body = req.body;

    Configuration.setConfiguration(configurationId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};