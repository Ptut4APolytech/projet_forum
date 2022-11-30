const writer = require("./writer");

/**
 * Message de retour de l'API pour une erreur
 *
 * @param {int} code
 * @param {string} e
 *
 * @returns {Promise<Object>}
 */
module.exports.respondWithCode = function(code, e) {
    return writer.respondWithCode(code, { message: typeof e === 'string' ? e : (e ? e.message : e) });
};

module.exports.generatePassword = function (length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Retourne un texte en lowercase sans accents
 * 
 * @param {string} text Le texte à modifier
 * 
 * @returns {string}
 */
module.exports.toLowerCaseNormalized = function(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
