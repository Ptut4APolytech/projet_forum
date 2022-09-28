'use strict';

const tools = require('../utils/tools');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const StudentModel = require('../models/StudentModel');
const RepresentativeModel = require('../models/RepresentativeModel');

const userModel = new UserModel();
const studentModel = new StudentModel();
const representativeModel = new RepresentativeModel();

/**
 * retourne un token de connexion ou une erreur
 *
 * @param email     Email envoyé
 * @param password  Mot de passe envoyé
 *
 * @returns {Promise<Object>}
 */
exports.login = async function (email, password) {

    let response;
    try {

        // Recherche de l'utilisateur selon son email
        let user = await userModel.findByEmail(email);

        // Email trouvé
        if (user.id) {

            // Comparaison du mdp utilisateur et mdp envoyé
            let result = await bcrypt.compare(password, user.password);

            // Mot de passe pareils
            if (result) {

                let token = jwt.sign({ email: email }, process.env.SECRET_KEY);
                user = await userModel.update(user.id, {
                    token: token,
                    lastLogin: Date.now()
                });

                // Ajout de l'étudiant ou du représentant
                let entity;
                if (user.role === "student") {
                    entity = await studentModel.findByUserId(user.id);
                    entity.user = user;
                }
                else if (user.role === "representative") {
                    entity = await representativeModel.findByUserId(user.id);
                    entity.user = user
                }
                else {
                    entity = { user };
                }

                response = { token: token, me: entity };
            }
            else {
                response = tools.respondWithCode(400, "Identifiants incorrects");
            }
        }
        else {
            response = tools.respondWithCode(400, "Identifiants incorrects");
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Verifie le token dans le header, appelle le controller en cas de réussite, erreur en cas d'échec
 * @param req
 * @param authOrSecDef
 * @param token
 * @param callback fonction dans le controlleur
 */
exports.verifyToken = async function (req, authOrSecDef, token, callback) {
    /*
    callback();
    return;
    */

    try {

        const authorization = req.headers.authorization;

        // Vérification de l'existence d'un bearer dans le header
        if (authorization) {

            // Recherche d'un utilisateur selon le token
            const user = await userModel.findByToken(authorization.split('Bearer ')[1]);

            // Vérification de l'existence de l'utilisateur
            if (user.id) {
                req.data = user;
                callback();
            }
            else {
                let error = new Error("Authentification expirée, veuillez vous reconnecter");
                error['statusCode'] = 403;
                callback(error);
            }
        }
        else {
            let error = new Error("Authentification expirée, veuillez vous reconnecter");
            error['statusCode'] = 403;
            callback(error);
        }
    }
    catch (error) {
        callback(error);
    }
};
