'use strict';

const tools = require('../utils/tools');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AppointmentModel = require('../models/AppointmentModel');
const StudentModel = require('../models/StudentModel');
const AppointmentService = require('../services/AppointmentService');
const OfferService = require('../services/OfferService');
const mailing = require("../utils/mailing/mailing");
const { UpdateStatusTemplate } = require('../utils/mailing/mailing-template/updateStatusTemplate');
const { CreateAccountStatusTemplate } = require('../utils/mailing/mailing-template/createAccountTemplate');

const userModel = new UserModel();
const studentModel = new StudentModel();

/**
 * Retourne la liste des étudiants
 *
 * @returns {Promise<Object[]>}
 */
exports.getStudents = async function () {

    let response;
    try {
        response = await studentModel.findAll();
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne un étudiant
 *
 * @param studentId : Identifiant de l'étudiant
 *
 * @returns {Promise<Object>}
 */
exports.getStudent = async function (studentId) {

    let response;
    try {

        const student = await studentModel.findOne(studentId)
        // Vérification de l'existence de l'étudiant
        if (!student.id) {
            response = tools.respondWithCode(404, "Etudiant inconnu");
        }
        else {
            response = student;
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;

};

/**
 * Création d'un étudiant
 *
 * @param student : Objet étudiant à créer
 *
 * @returns {Promise<Object>}
 */
exports.addStudent = async function (student) {

    let response;
    try {

        const searchUser = await userModel.findByEmail(student.email);

        if (searchUser.id) {
            response = tools.respondWithCode(400, "L'email est déjà utilisé");
        }
        else {
            let clearPassword = (process.env.ENVIRONMENT === "dev") ? "azerty123" : tools.generatePassword(11);

            // Création utilisateur
            let newUser = {
                email: student.email,
                password: await bcrypt.hash(clearPassword, 11),
                firstname: student.firstname,
                lastname: student.lastname,
                isRemote: student.isRemote,
                role: 'student',
                token: null,
                avatarPath: null,
                lastLogin: null
            };
            newUser = await userModel.create(newUser);

            let studentItem = {
                userId: newUser.id,
                description: (student.description) ? student.description : null,
                cvPath: null,
                tags: [],
                isRemote: (student.isRemote) ? student.isRemote : false,
                orderedOffers: [],
                status: 'notValidated'
            };

            response = await studentModel.create(studentItem);

            let createAccountStatusTemplate = new CreateAccountStatusTemplate(student.firstname, clearPassword);
            await mailing.sendMail(
                createAccountStatusTemplate.getSubject(),
                [student.email],
                createAccountStatusTemplate.getHTML(),
                [
                    {
                        filename: "Documentation-TeaMeeT.pdf",
                        path: "./assets/documentation/documentation_etudiant.pdf"
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
 * Suppression d'un étudiant
 *
 * @param studentId : Identifiant de l'étudiant
 *
 * @returns {Promise<Object>}
 */
exports.delStudent = async function (studentId) {

    let response;
    try {
        const student = await studentModel.findOne(studentId);

        // Suppression étudiant
        const studentDelSuccess = await studentModel.delete(studentId);
        if (studentDelSuccess) {

            // Suppression utilisateur
            const userDelSuccess = await userModel.delete(student.userId);
            if (userDelSuccess) {
                response = { success: true };
            }
            else {
                response = tools.respondWithCode(404, "Utilisateur introuvable");
            }
            await AppointmentService.delAppointmentByTypeId(studentId, 'studentId');
            await OfferService.delStudentFromOrderedStudent(studentId);
        }
        else {
            response = tools.respondWithCode(404, "Etudiant introuvable");
        }

        return response;
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};


/**
 * Suppression d'un offerId de toutes les orderedoffer des étudiants
 * @param offerId id de l'offre à supprimer
 * @returns {Promise<Object>}
 */
exports.delOfferFromOrderedOffer = async function (offerId) {

    let response;
    try {
        let stusToDelete = await studentModel.findAllByOfferId(offerId);
        for (let stuToDelete of stusToDelete) {
            let listOffer = stuToDelete.orderedOffers.filter((o) => o !== offerId)
            await studentModel.update(stuToDelete.id, {
                orderedOffers: listOffer
            });
        }
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modification d'un étudiant
 *
 * @param studentId : Identifiant de l'étudiant
 * @param student : Objet étudiant à modifier
 *
 * @returns {Promise<Object>}
 */
exports.setStudent = async function (studentId, student) {

    let response;
    try {

        const studentInBase = await studentModel.findOne(studentId);

        // Vérification de l'existence de l'étudiant
        if (!studentInBase.id) {
            return tools.respondWithCode(404, "Etudiant inconnu");
        }
        else {

            let newDatas = {};
            if (student.description) {
                newDatas.description = student.description;
            }
            if (student.hasOwnProperty('cvPath')) {
                newDatas.cvPath = student.cvPath;
            }
            if (Array.isArray(student.tags)) {
                newDatas.tags = student.tags;
            }
            if (typeof student.isRemote != 'undefined') {
                newDatas.isRemote = student.isRemote;
            }
            if (Array.isArray(student.orderedOffers)) {
                newDatas.orderedOffers = student.orderedOffers;
            }
            if (student.status) {
                newDatas.status = student.status;
                if (student.status === 'validated' && studentInBase.status !== 'validated') {
                    const user = await userModel.findOne(studentInBase.userId);

                    let updateStatusTemplate = new UpdateStatusTemplate(user.firstname, true);
                    await mailing.sendMail(
                        updateStatusTemplate.getSubject(),
                        [user.email],
                        updateStatusTemplate.getHTML()
                    );
                }
                else if (student.status === 'notValidated' && studentInBase.status !== 'notValidated') {
                    const user = await userModel.findOne(studentInBase.userId);

                    let updateStatusTemplate = new UpdateStatusTemplate(user.firstname, false, student.reason);
                    await mailing.sendMail(
                        updateStatusTemplate.getSubject(),
                        [user.email],
                        updateStatusTemplate.getHTML()
                    );
                }
            }
            response = await studentModel.update(studentId, newDatas);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Liste des étudiants filtrées
 *
 * @param search Tableau de recherche de la forme [{"path":"p", "value":"v", "operator": "="}]
 *
 * @returns {Promise<Object[]>}
 */
exports.searchStudent = async function (search) {
    let response;
    try {
        response = await studentModel.search(search);
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};
