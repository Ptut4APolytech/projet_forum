'use strict';

var utils = require('../utils/writer.js');
var roleUtil = require('../utils/role');
var Student = require('../services/StudentService.js');
const Offer = require("../services/OfferService.js");

/**
 * Retourne la liste des étudiants
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//roleUtil.checkRole(req.data.role, ['admin', 'student', 'representative'])
module.exports.getStudents = async function (req, res, next) {
    Student.getStudents().then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Retourne un étudiant selon son identifiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getStudent = async function (req, res, next) {
    const studentId = req.swagger.params.studentId.value;

    Student.getStudent(studentId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Suppression d'un étudiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.delStudent = async function (req, res, next) {

    const studentId = req.swagger.params.studentId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }

    Student.delStudent(studentId).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Modification d'un étudiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.setStudent = async function (req, res, next) {

    const studentId = req.swagger.params.studentId.value;
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'], ['student'], studentId)) { return; }

    const body = req.body;

    Student.setStudent(studentId, body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Création d'un étudiant
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addStudent = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin'])) { return; }
    const body = req.body;

    Student.addStudent(req.body).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

/**
 * Recherche d'étudiant avec filtres
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.searchStudent = async function (req, res, next) {
    if (!await roleUtil.canExecuteRequest(res, req.data, ['admin', 'representative'])) { return; }
    const search = req.body.search;
    Student.searchStudent(search).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};