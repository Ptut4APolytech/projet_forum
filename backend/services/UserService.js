'use strict';

const bcrypt = require('bcrypt');
const tools = require('../utils/tools');
const UserModel = require('../models/UserModel');
const mailing = require('../utils/mailing/mailing')
const jwt = require("jsonwebtoken");
const { ResetPasswordTemplate } = require('../utils/mailing/mailing-template/resetPasswordTemplate');
const { CreateAccountStatusTemplate } = require('../utils/mailing/mailing-template/createAccountTemplate');

const userModel = new UserModel();

/**
 * Retourne la liste des utilisateurs
 *
 * @returns {Promise<Object[]>}
 */
exports.getUsers = async function () {

    let response;
    try {
        response = await userModel.findAll();
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Retourne un utilisateur
 *
 * @param userId : Identifiant utilisateur
 *
 * @returns {Promise<Object>}
 */
exports.getUser = async function (userId) {

    let response;
    try {
        const user = await userModel.findOne(userId);

        if (!user.id) {
            response = tools.respondWithCode(404, "Utilisateur introuvable");
        }
        else {
            response = user;
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Création d'un utilisateur
 *
 * @param user : Objet utilisateur à créer
 *
 * @returns {Promise<Object>}
 */
exports.addUser = async function (user) {

    let response;
    try {

        const searchUser = await userModel.findByEmail(user.email);

        // Vérification de l'existence de l'email dans la BD
        if (searchUser.id) {
            response = tools.respondWithCode(400, "L'email existe déjà");
        }
        else {

            let clearPassword = (process.env.ENVIRONMENT === "dev") ? "azerty123" : tools.generatePassword(11);

            let userItem = {
                email: user.email,
                password: await bcrypt.hash(clearPassword, 11),
                role: user.role,
                firstname: user.firstname,
                lastname: user.lastname,
                token: null,
                avatarPath: null,
                lastLogin: null
            }

            // Ajout dans la BD
            response = await userModel.create(userItem);

            //Send creation mail
            let createAccountStatusTemplate = new CreateAccountStatusTemplate(user.firstname, clearPassword);
            await mailing.sendMail(
                createAccountStatusTemplate.getSubject(),
                [user.email],
                createAccountStatusTemplate.getHTML()
            );
        }

    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Suppression d'un utilisateur
 *
 * @param userId : Identifiant utilisateur
 *
 * @returns {Promise<Object>}
 */
exports.delUser = async function (userId) {

    let response;
    try {

        const deleteSuccess = await userModel.delete(userId);

        if (deleteSuccess) {
            response = { success: true };
        }
        else {
            response = tools.respondWithCode(404, "Utilisateur introuvable");
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modification d'un utilisateur
 *
 * @param userId : Identifiant utilisateur
 * @param user : Objet utilisateur à modifier
 *
 * @returns {Promise<Object>}
 */
exports.setUser = async function (userId, user) {

    let response;
    try {
        const userInBase = await userModel.findOne(userId);

        // Vérification de l'existence utilisateur
        if (!userInBase.id) {
            response = tools.respondWithCode(404, "Utilisateur introuvable");
        }
        else {
            let newDatas = {};
            if (user.role) {
                newDatas.role = user.role;
            }
            if (user.password) {
                // Hachage du mot de passe
                const pwdHash = await bcrypt.hash(user.password, 11);
                newDatas.password = pwdHash;
            }
            if (user.firstname) {
                newDatas.firstname = user.firstname;
            }
            if (user.lastLogin) {
                newDatas.lastLogin = user.lastLogin;
            }
            if (user.lastname) {
                newDatas.lastname = user.lastname;
            }
            if (user.avatarPath) {
                newDatas.avatarPath = user.avatarPath;
            }

            response = await userModel.update(userId, newDatas);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

exports.resetPassword = async function (email) {

    let response;
    try {

        const searchUser = await userModel.findByEmail(email)

        if (!searchUser.id) {
            return tools.respondWithCode(200, 'ok');
        }

        let token = jwt.sign({ email: email }, process.env.SECRET_KEY)

        searchUser.resetToken = token

        await userModel.update(searchUser.id, searchUser);

        let resetPwdBTemplate = new ResetPasswordTemplate(searchUser.firstname, searchUser.lastname, token);
        await mailing.sendMail(
            resetPwdBTemplate.getSubject(),
            [email],
            resetPwdBTemplate.getHTML()
        );

        response = { success: true };
    }
    catch (error) {
        console.log("bonjour");
        response = tools.respondWithCode(500, error);
    }

    return response;
};

exports.updatePasswordByToken = async function (password, token) {

    let response;
    try {

        const searchUser = await userModel.findByResetToken(token)

    if (!searchUser.id) {
        return tools.respondWithCode(404, 'Authentification invalide')
    }

        searchUser.password = await bcrypt.hash(password, 11)
        searchUser.resetToken = null

        await userModel.update(searchUser.id, searchUser);

        response = { success: true };
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};
