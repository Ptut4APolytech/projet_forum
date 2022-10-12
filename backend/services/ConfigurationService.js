'use strict';

const tools = require('../utils/tools');
const ConfigurationModel = require('../models/ConfigurationModel');

const configurationModel = new ConfigurationModel();

/**
 * Retourne la configuration
 *
 * @returns {Promise<Object>}
 */
exports.getConfiguration = async function () {
    let response;
    try {
        response = await configurationModel.find();
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};

/**
 * Modifie la configuration
 * 
 * @param {string} configId 
 * @param {Object} config 
 * 
 * @returns {Promise<Object>} 
 */
exports.setConfiguration = async function (configId, config) {

    let response;
    try {
        
        const configInBase = await configurationModel.findOne(configId);

        // Vérification de l'existence de la configuration
        if (!configInBase.id) {
            response = tools.respondWithCode(404, "Configuration introuvable");
        }
        else {

            let newDatas = {};
            if (config.forumDate) {
                newDatas.forumDate = config.forumDate;
            }
            if (config.hasOwnProperty('showPlanning')) {
                newDatas.showPlanning = config.showPlanning;
            }

            response = await configurationModel.update(configId, newDatas);
        }
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
}

/**
 * Création d'une config
 *
 * @returns {Promise<Object>}
 */
 exports.addConfig = async function () {

    let response;
    try {
		let configItem = {
			showPlanning: false
		};
		response = await configurationModel.create(configItem);
    }
    catch (error) {
        response = tools.respondWithCode(500, error);
    }

    return response;
};