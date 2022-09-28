'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Offer = require('../services/OfferService.js');

/**
 * Retourne la liste des offres
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getOffers = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student'])) { return; }

    Offer.getOffers().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne une offre selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getOffer = async function (req, res, next) {

    const offerId = req.swagger.params.offerId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student'], ['offer'], offerId)) { return; }

    Offer.getOffer(offerId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Suppression d'une offre
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delOffer = async function (req, res, next) {
    const offerId = req.swagger.params.offerId.value;

    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'representative'], ['offer'], offerId)) { return; }
    Offer.delOffer(offerId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'une offre
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setOffer = async function (req, res, next) {

    const offerId = req.swagger.params.offerId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'], ['offer'], offerId)) { return; }
    const body = req.body;

    Offer.setOffer(offerId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'une offre
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addOffer = async function (req, res, next) {

    const body = req.body;
    if (!await roleUtil.canExecuteRequest(res, req.data, [], ['company'], body.companyId)) { return; }

    Offer.addOffer(body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Recherche d'offres avec filtres
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.searchOffers = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student'])) { return; }

    const search = req.body.search;

    Offer.searchOffers(search).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Recherche d'offres d'une company
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.companyOffer = async function (req, res, next) {

    const companyId = req.swagger.params.companyId.value;
    const status = req.swagger.params.status.value ? req.swagger.params.status.value : null;

    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'student'], ['company'], companyId)) { return; }

    Offer.searchOffersByCompanyId(companyId, status).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne les étudiants choisis pour une offre
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.offerStudents = async function (req, res, next) {

    const offerId = req.swagger.params.offerId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'representative'])) { return; }

    Offer.offerStudents(offerId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};
