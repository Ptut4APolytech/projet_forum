const { TemplateBuilder } = require("./templateBuilder");

class SatisfactionSurveyTemplate extends TemplateBuilder {

    /**
     * The SatisfactionSurveyTemplate class constructor
     */
    constructor(p_form_link) {
        super("Enquête de satisfaction");
        this._formLink = p_form_link;
    }

    getMailBody() {
        return `Merci d'avoir participé à notre forum. Nous espérons que vous avez pu trouver ce que vous étiez venu chercher.<br/>
        Voici un petit questionnaire pour avoir votre avis sur ce forum: <a href="${this._formLink}">cliquez-ici</a>`;
    }
}

module.exports = {
    SatisfactionSurveyTemplate
};