const { TemplateBuilder } = require("./templateBuilder");

class ResetPasswordTemplate extends TemplateBuilder {

    /**
     * The ResetPasswordTemplate class constructor
     * @param {*} p_user_firstname The user firstname.
     * @param {*} p_user_lastname The user lastname.
     * @param {*} p_user_token The user token.
     */
    constructor(p_user_firstname, p_user_lastname, p_user_token) {
        super("Réinitialisation du mot de passe", p_user_firstname);
        this._userFistname = p_user_firstname;
        this._userLastname = p_user_lastname;
        this._userToken = p_user_token;
    }

    getMailBody() {
        return `Voici le lien de réinitialisation de votre mot de passe pour le compte ${this._userFistname} ${this._userLastname.toUpperCase()}: <a href="${process.env.BASEURL_FRONT}reset/${this._userToken}">cliquez-ici</a>`;
    }

}

module.exports = {
    ResetPasswordTemplate
};
