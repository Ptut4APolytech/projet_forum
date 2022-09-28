const { TemplateBuilder } = require("./templateBuilder");

class CreateAccountStatusTemplate extends TemplateBuilder {

    /**
     * The CreateAccountStatus class constructor
     * @param {*} p_user_firstname The user firstname.
     */
    constructor(p_user_firstname, p_user_default_password) {
        super("Création de votre compte", p_user_firstname);
        this._userDefaultPassword = p_user_default_password;
    }

    getMailBody() {
        return `Votre profil utilisateur vient d'être créé sur la plateforme TeaMeet.<br/><br/>
        Votre mot de passe par défaut est: ${this._userDefaultPassword}<br/><br/>
        Vous pouvez maintenant vous rendre sur le site du forum pour commencer vos démarches: <a href="${process.env.BASEURL_FRONT}">Accéder au forum</a><br/>
        Nous vous conseillons de compléter votre profil au maximum et de changer votre mot de passe.<br/>`;
    }

}

module.exports = {
    CreateAccountStatusTemplate
};
