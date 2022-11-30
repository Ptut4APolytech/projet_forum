'use strict';

const tools = require('../utils/tools');
const CompanyModel = require('../models/CompanyModel');
const RepresentativeService = require('../services/RepresentativeService');
const OfferService = require('../services/OfferService');
const AppointmentService = require('../services/AppointmentService');

const companyModel = new CompanyModel();

/**
 * Retourne la liste des entreprises
 *
 * @returns {Promise<Object[]>}
 */
exports.getCompanies = async function () {

    let response;
    try {
        response = await companyModel.findAll();
        response.sort((a, b) => a.name.localeCompare(b.name));
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne une entreprise
 *
 * @param companyId : Identifiant de l'entreprise
 *
 * @returns {Promise<Object>}
 */
exports.getCompany = async function (companyId) {

    let response;
    try {

        const company = await companyModel.findOne(companyId);

        // Vérification de l'existence de l'entreprise
        if (!company.id) {
            response = tools.respondWithCode(404, "Entreprise introuvable");
        }
        else {
            response = company;
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Création d'une entreprise
 *
 * @param company : Entreprise à créer
 *
 * @returns {Promise<Object>}
 */
exports.addCompany = async function (company) {

    let response;
    try {
        const searchCompany = await companyModel.findByName(company.name);

        // Vérification de l'existence de l'entreprise dans la BD
        if (searchCompany.id) {
            response = tools.respondWithCode(400, "L'entreprise existe déjà");
        } else {
            let companyItem = {
                name: company.name,
                isValidated: false
            };

            response = await companyModel.create(companyItem);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Suppression d'une entreprise
 *
 * @param companyId : Identifiant de l'entreprise
 *
 * @returns {Promise<Object>}
 */
exports.delCompany = async function (companyId) {

    let response;
    try {

        const deleteSuccess = await companyModel.delete(companyId);

        if (deleteSuccess) {
            response = { success: true };
        }
        else {
            response = tools.respondWithCode(404, "Entreprise introuvable");
        }
        await RepresentativeService.delRepresentativesByCompanyId(companyId);
        await OfferService.delOffersByCompanyId(companyId);
        await AppointmentService.delAppointmentByTypeId(companyId, 'companyId');
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modification d'une entreprise
 *
 * @param companyId : Identifiant de l'entreprise
 * @param company : Objet entreprise à modifier
 *
 * @returns {Promise<Object>}
 */
exports.setCompany = async function (companyId, company) {

    let response;
    try {

        const companyInBase = await companyModel.findOne(companyId);

        // Vérification de l'existence de l'entreprise
        if (!companyInBase.id) {
            response = tools.respondWithCode(404, "Entreprise introuvable");
        }
        else {

            let newDatas = {};
            if (company.name) {
                newDatas.name = company.name;
            }
            if (company.isValidated) {
                newDatas.isValidated = company.isValidated;
            }

            response = await companyModel.update(companyId, newDatas);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};
