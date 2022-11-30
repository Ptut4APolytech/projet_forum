const { SatisfactionSurveyTemplate } = require("./satisfactionSurveyTemplate");

const c_FORM_LINK_REPRESENTATIVE = "https://framaforms.org/bilan-forum-virtuel-entreprise-1626878799";

class RepresentativeSatisfactionSurveyTemplate extends SatisfactionSurveyTemplate {

    /**
     * The RepresentativeSatisfactionSurveyTemplate class constructor
     */
    constructor() {
        super(c_FORM_LINK_REPRESENTATIVE);
    }
}

module.exports = {
    RepresentativeSatisfactionSurveyTemplate
};