'use strict';

const tools = require('../utils/tools');
const bcrypt = require('bcrypt');
const mailing = require("../utils/mailing/mailing");
const UserModel = require('../models/UserModel');
const RepresentativeModel = require('../models/RepresentativeModel');
const CompanyModel = require('../models/CompanyModel');
const { CreateAccountStatusTemplate } = require('../utils/mailing/mailing-template/createAccountTemplate');

const userModel = new UserModel();
const representativeModel = new RepresentativeModel();
const companyModel = new CompanyModel();

/**
 * Retourne la liste des représentants
 *
 * @returns {Promise<Object[]>}
 */
exports.getRepresentatives = async function () {

    let response;
    try {
        response = await representativeModel.findAll();
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne un représentant d'entreprise
 *
 * @param representativeId : Identifiant du représentant
 *
 * @returns {Promise<Object>}
 */
exports.getRepresentative = async function (representativeId) {

    let response;
    try {

        const representative = await representativeModel.findOne(representativeId);

        // Vérification de l'existence du représentant
        if (!representative.id) {
            response = tools.respondWithCode(404, "Représentant inconnu");
        }
        else {
            response = representative;
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Création d'un représentant
 *
 * @param representative : Objet représentant à créer
 *
 * @returns {Promise<Object>}
 */
exports.addRepresentative = async function (representative) {

    let response;
    try {

        const searchUser = await userModel.findByEmail(representative.email);
        const searchCompany = await companyModel.findOne(representative.companyId);

        // Vérification de l'existence utilisateur
        if (searchUser.id) {
            response = tools.respondWithCode(400, "L'email est déjà utilisé");
        }
        // Vérification de l'existence de l'entreprise
        else if (!searchCompany.id) {
            response = tools.respondWithCode(404, "Entreprise introuvable");
        }
        else {

            let clearPassword = (process.env.ENVIRONMENT === "dev") ? "azerty123" : tools.generatePassword(11);

            // Création utilisateur
            let newUser = {
                email: representative.email,
                password: await bcrypt.hash(clearPassword, 11),
                role: 'representative',
                firstname: representative.firstname,
                lastname: representative.lastname,
                token: null,
                avatarPath: null,
                lastLogin: null
            };
            newUser = await userModel.create(newUser);

            let representativeItem = {
                userId: newUser.id,
                companyId: representative.companyId
            };

            response = await representativeModel.create(representativeItem);

            //Send creation mail
            let createAccountStatusTemplate = new CreateAccountStatusTemplate(representative.firstname, clearPassword);
            await mailing.sendMail(
                createAccountStatusTemplate.getSubject(),
                [representative.email],
                createAccountStatusTemplate.getHTML(),
                [
                    {
                        filename: "Documentation-TeaMeeT.pdf",
                        path: "./assets/documentation/documentation_entreprise.pdf"
                    }
                ]
            );
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Suppression d'un représentant
 *
 * @param representativeId : Identifiant d'un représentant
 *
 * @returns {Promise<*>}
 */
exports.delRepresentative = async function (representativeId) {

    let response;
    try {

        const representative = await representativeModel.findOne(representativeId);

        // Suppression représentant
        const representativeDelSuccess = await representativeModel.delete(representativeId);
        if (representativeDelSuccess) {

            // Suppression utilisateur
            const userDelSuccess = await userModel.delete(representative.userId);
            if (userDelSuccess) {
                response = { success: true };
            }
            else {
                response = tools.respondWithCode(404, "Utilisateur introuvable");
            }
        }
        else {
            response = tools.respondWithCode(404, "Représentant introuvable");
        }

        return response;
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};


/**
 * Suppression de tous les représentants liés à l'entreprise
 *
 * @param companyId : Identifiant de l'entreprise lié
 *
 * @returns {Promise<Object>}
 */
exports.delRepresentativesByCompanyId = async function (companyId) {

    let response;
    try {

        let repsToDelete = await representativeModel.findByCompanyId(companyId);
        for (let repToDelete of repsToDelete) {
            await representativeModel.delete(repToDelete.id);
            await userModel.delete(repToDelete.userId);
        }
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modification d'un représentant
 *
 * @param representativeId : Identifiant du représentant
 * @param representative : Objet représentant à modifier
 *
 * @returns {Promise<Object>}
 */
exports.setRepresentative = async function (representativeId, representative) {

    let response;
    try {

        // Vérification de l'existence utilisateur
        const representativeInBase = await representativeModel.findOne(representativeId);
        if (!representativeInBase.id) {
            return tools.respondWithCode(404, "Représentant non-trouvé");
        }
        else {

            let newDatas = {};
            if (representative.companyId) {

                const company = await companyModel.findOne(representative.companyId);

                // Vérification de l'existence de l'entreprise
                if (!company.id) {
                    return tools.respondWithCode(404, "Entreprise introuvable");
                }
                else {
                    newDatas.companyId = representative.companyId;
                }
            }

            response = await representativeModel.update(representativeId, newDatas);
        }

        return response;
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};
