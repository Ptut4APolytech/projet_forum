'use strict';
const admin = require("firebase-admin");
const db = admin.storage();
const tools = require('../utils/tools');

/**
 * Cette fonction permet de téléverser un fichier
 * @returns {Promise<Object>}
 */
exports.uploadFile = async function (file, path) {

    let response;
    try {
        await db.bucket().file(path).save(file.buffer);

        response = { succcess: true };
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Cette fonction permet de télécharger un fichier
 * 
 * @returns {Promise<Readable>}
 */
exports.downloadFile = async function (path) {

    try {

        let file = await db.bucket().file(path);

        // Vérification de l'existence du fichier
        if (!(await file.exists())[0]) {
            throw tools.respondWithCode(404, "Fichier introuvable");
        }
        else {
            // On retourne un stream lisible en réponse
            return file.createReadStream();
        }
    }
    catch (error) {

        // On vérifie si c'est une erreur contrôlée
        if (error.code && error.payload) {
            throw error;
        }
        else {
            throw tools.respondWithCode(500, error);
        }
    }
};

/**
 * Cette fonction permet de supprimer un fichier
 * 
 * @returns {Promise<Object>}
 */
exports.removeFile = async function (path) {

    let response;
    try {
        let file = await db.bucket().file(path);

        // Vérification de l'existence du fichier
        if (!(await file.exists())[0]) {
            response = tools.respondWithCode(404, "Fichier introuvable");
        }
        else {
            await file.delete();

            response = { success: true };
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};