'use strict';

const tools = require('../utils/tools');
const OfferModel = require('../models/OfferModel');
const CompanyModel = require('../models/CompanyModel');
const RepresentativeModel = require('../models/RepresentativeModel');
const AppointmentService = require('../services/AppointmentService');
const StudentService = require('../services/StudentService');
const UserModel = require('../models/UserModel');
const { UpdateOfferStatusTemplate } = require('../utils/mailing/mailing-template/updateOfferStatusTemplate');
const mailing = require("../utils/mailing/mailing");

const offerModel = new OfferModel();
const companyModel = new CompanyModel();
const representativeModel = new RepresentativeModel();
const userModel = new UserModel();

/**
 * Retourne la liste des offres
 *
 * @returns {Promise<Object[]>}
 */
exports.getOffers = async function () {

    let response;
    try {
        response = await offerModel.findAll();
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne une offre
 *
 * @param offerId : Identifiant de l'offre
 *
 * @returns {Promise<Object>}
 */
exports.getOffer = async function (offerId) {

    let response;
    try {

        const offer = await offerModel.findOne(offerId);

        // Vérification de l'existence de l'offre
        if (!offer.id) {
            response = tools.respondWithCode(404, "Offre introuvable");
        } else {
            response = offer;
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Création d'une offre
 *
 * @param offer : Objet offre à créer
 *
 * @returns {Promise<Object>}
 */
exports.addOffer = async function (offer) {

    let response;
    try {

        // Vérification de l'existence de l'entreprise
        if (!(await companyModel.findOne(offer.companyId)).id) {
            response = tools.respondWithCode(404, "Entreprise introuvable");
        }
        else {

            let offerItem = {
                companyId: offer.companyId,
                title: offer.title,
                content: (offer.content) ? offer.content : null,
                files: offer.files,
                tags: (offer.tags) ? offer.tags : [],
                status: (offer.status) ? offer.status : 'notValidated',
                nbAppointmentsAvailable: (offer.nbAppointmentsAvailable) ? offer.nbAppointmentsAvailable : 8,
                orderedStudents: []
            }

            response = await offerModel.create(offerItem);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Suppression d'une offre
 *
 * @param offerId : Identifiant de l'offre
 *
 * @returns {Promise<Object>}
 */
exports.delOffer = async function (offerId) {

    let response;
    try {

        const deleteSuccess = await offerModel.delete(offerId);

        if (deleteSuccess) {
            response = { success: true };
        }
        else {
            response = tools.respondWithCode(404, "Offre introuvable");
        }
        await AppointmentService.delAppointmentByTypeId(offerId, 'offerId');
        await StudentService.delOfferFromOrderedOffer(offerId);
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};


/**
 * Suppression de toutes les offres liées à l'entreprise
 *
 * @param companyId : Identifiant de l'entreprise liée
 *
 * @returns {Promise<Object>}
 */
exports.delOffersByCompanyId = async function (companyId) {

    let response;
    try {

        let offsToDelete = await offerModel.findAllByCompanyId(companyId);
        for (let offToDelete of offsToDelete) {
            await offerModel.delete(offToDelete.id);
            await StudentService.delOfferFromOrderedOffer(offToDelete.id);
        }
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Suppression d'un studentId de toutes les orderedStudent des offres
 * @param studentId id de l'étudiant à supprimer
 * @returns {Promise<Object>}
 */
exports.delStudentFromOrderedStudent = async function (studentId) {

    let response;
    try {

        let offsToDelete = await offerModel.findAllByStudentId(studentId);
        for (let offToDelete of offsToDelete) {
            let listStudent = offToDelete.orderedStudents.filter((s) => s !== studentId)
            await offerModel.update(offToDelete.id, {
                orderedStudents: listStudent
            });
        }
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modification de l'offre
 *
 * @param offerId : Identifiant de l'offre
 * @param offer : Objet offre à modifier
 *
 * @returns {Promise<{id: *}>}
 */
exports.setOffer = async function (offerId, offer) {

    let response;
    try {

        let offerInBase = await offerModel.findOne(offerId);

        // Vérification de l'existence de l'offre
        if (!offerInBase.id) {
            response = tools.respondWithCode(404, "Offre introuvable");
        }
        else {

            let newDatas = {};
            if (offer.companyId) {
                newDatas.companyId = offer.companyId;
            }
            if (offer.title) {
                newDatas.title = offer.title;
            }
            if (offer.content) {
                newDatas.content = offer.content;
            }
            if (offer.files) {
                newDatas.files = offer.files;
            }
            if (offer.tags) {
                newDatas.tags = offer.tags;
            }
            if (offer.status) {
                newDatas.status = offer.status;
            }
            if (offer.nbAppointmentsAvailable) {
                newDatas.nbAppointmentsAvailable = offer.nbAppointmentsAvailable;
            }
            if (Array.isArray(offer.orderedStudents)) {
                newDatas.orderedStudents = offer.orderedStudents;
            }

            response = await offerModel.update(offerId, newDatas);

            //Retrieve company users mail
            let companyRepresentatives = await representativeModel.findByCompanyId(offerInBase.companyId);
            let representativeIds = companyRepresentatives.map(x => x.userId);
            let companyUsers = await userModel.findByIds(representativeIds);
            let companyUsersMail = companyUsers.map(x => x.email);

            if (newDatas.status === 'validated') {
                await companyModel.update(offerInBase.companyId, {
                    isValidated: true
                });

                let updateOfferStatusTemplate = new UpdateOfferStatusTemplate(offerInBase.title, true);
                await mailing.sendMail(
                    updateOfferStatusTemplate.getSubject(),
                    companyUsersMail,
                    updateOfferStatusTemplate.getHTML()
                );
            }
            else if (newDatas.status === 'notValidated') {
                let updateOfferStatusTemplate = new UpdateOfferStatusTemplate(offerInBase.title, false, offer.reason);
                await mailing.sendMail(
                    updateOfferStatusTemplate.getSubject(),
                    companyUsersMail,
                    updateOfferStatusTemplate.getHTML()
                );
            }
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Liste des offres filtrées
 *
 * @param search Tableau de recherche de la forme [{"path":"p", "value":"v", "operator": "="}]
 *
 * @returns {Promise<Object[]>}
 */
exports.searchOffers = async function (search) {

    let response;
    try {
        response = await offerModel.search(search);
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Liste des offres d'une entreprise
 *
 * @param companyId id de l'entreprise
 *
 * @returns {Promise<Object[]>}
 */
exports.searchOffersByCompanyId = async function (companyId, status) {
    let response;
    try {
        response = await offerModel.findAllByCompanyId(companyId, status);
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne la liste des étudiants choisis sur une offre par l'entreprise
 *
 * @param offerId Identifiant de l'offre
 *
 * @returns {Promise<Object[]>}
 */
exports.offerStudents = async function (offerId) {

    let response;
    try {
        response = await offerModel.findOrderedStudents(offerId);

        // Cas où l'offre n'a pas été trouvée
        if (response == null) {
            response = tools.respondWithCode(404, 'Offre introuvable');
        }
        // Cas où un étudiant n'a pas été trouvé
        else if (response == []) {
            response = tools.respondWithCode(404, 'Etudiant introuvable');
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};
