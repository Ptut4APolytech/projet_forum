'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Appointment = require('../services/AppointmentService.js');

/**
 * Retourne la liste des RDV
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getAppointments = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Appointment.getAppointments().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne la liste des RDV d'un étudiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getStudentAppointments = async function (req, res, next) {

    const studentId = req.swagger.params.studentId.value;

    if (!await roleUtil.canExecuteRequest(res, req.data, ['student'])) { return; }

    Appointment.getStudentAppointments(studentId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne la liste des RDV d'une entreprise
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getCompanyAppointments = async function (req, res, next) {

    const companyId = req.swagger.params.companyId.value;

    if (!await roleUtil.canExecuteRequest(res, req.data, ['representative'])) { return; }

    Appointment.getCompanyAppointments(companyId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne un RDV selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getAppointment = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const appointmentId = req.swagger.params.appointmentId.value;

    Appointment.getAppointment(appointmentId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Suppression d'un RDV
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delAppointment = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const appointmentId = req.swagger.params.appointmentId.value;

    Appointment.delAppointment(appointmentId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'un RDV
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setAppointment = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const appointmentId = req.swagger.params.appointmentId.value;
    const body = req.body;

    Appointment.setAppointment(appointmentId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'un RDV
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addAppointment = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    const body = req.body;

    Appointment.addAppointment(body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création du planning
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.createPlanning = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Appointment.createPlanning().then(function (response) {

        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};
