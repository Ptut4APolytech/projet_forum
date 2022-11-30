'use strict';

/**
 * Retourne une réponse de succès
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns {Promise<>} 
 */
exports.hello = function(req, res) {
    return Promise.resolve({success: true})
}