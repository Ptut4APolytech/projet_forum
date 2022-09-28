const { SatisfactionSurveyTemplate } = require("./satisfactionSurveyTemplate");

const c_FORM_LINK_STUDENT = "https://framaforms.org/bilan-forum-virtuel-candidats-polytech-lyon-1627028701";

class StudentSatisfactionSurveyTemplate extends SatisfactionSurveyTemplate {

    /**
     * The StudentSatisfactionSurveyTemplate class constructor
     */
    constructor() {
        super(c_FORM_LINK_STUDENT);
    }
}

module.exports = {
    StudentSatisfactionSurveyTemplate
};