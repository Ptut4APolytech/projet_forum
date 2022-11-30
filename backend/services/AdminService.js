'use strict';

const tools = require('../utils/tools');
const UserModel = require('../models/UserModel');
const RepresentativeModel = require("../models/RepresentativeModel");
const StudentModel = require("../models/StudentModel");
const mailing = require("../utils/mailing/mailing");
const { StudentSatisfactionSurveyTemplate } = require('../utils/mailing/mailing-template/studentSatisfactionSurveyTemplate');
const { RepresentativeSatisfactionSurveyTemplate } = require('../utils/mailing/mailing-template/representativeSatisfactionSurveyTemplate');
const CompanyModel = require("../models/CompanyModel");

const userModel = new UserModel();
const representativeModel = new RepresentativeModel();
const studentModel = new StudentModel();
const companyModel = new CompanyModel();
/**
 * Retourne la liste des admins
 *
 * @returns {Promise<Object[]>}
 */
exports.getAdmins = async function () {

    let response;
    try {
        response = await userModel.findAllByRole('admin');
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

exports.sendSurvey = async function () {
    let response;

    let students;
    let representatives;
    let emailStudent = [];
    let emailRepresentatives = [];
    let companies = [];

    try {
        representatives = await representativeModel.findAll();
        students = await studentModel.findAll();
        companies = await companyModel.findAll();

        for (let student of students) {
            if (student.status == "validated"){
                emailStudent.push(student.user.email);
            }
        }
        for (let representative of representatives) {
            for (let company of companies){
                if (company.id == representative.companyId && company.isValidated) {
                    emailRepresentatives.push(representative.user.email);
                    break;
                }
            }
        }

        if (emailStudent.length > 0) {
            let studentSatisfactionSurveyTemplate = new StudentSatisfactionSurveyTemplate();
            await mailing.sendMail(
                studentSatisfactionSurveyTemplate.getSubject(),
                emailStudent,
                studentSatisfactionSurveyTemplate.getHTML()
            )
        }

        if (emailRepresentatives.length > 0) {
            let representativeSatisfactionSurveyTemplate = new RepresentativeSatisfactionSurveyTemplate();
            await mailing.sendMail(
                representativeSatisfactionSurveyTemplate.getSubject(),
                emailRepresentatives,
                representativeSatisfactionSurveyTemplate.getHTML()
            )
        }
    } catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
}