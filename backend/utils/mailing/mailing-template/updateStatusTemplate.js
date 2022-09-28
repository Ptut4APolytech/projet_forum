const { TemplateBuilder } = require("./templateBuilder");

class UpdateStatusTemplate extends TemplateBuilder {

    /**
     * The UpdateStatusTemplate class constructor
     * @param {*} p_user_firstname The user firstname.
     */
    constructor(p_user_firstname, p_status_validated, p_reason = null) {
        super("Mise à jour du statut", p_user_firstname);
        this._statusValidated = p_status_validated;
        this._reason = p_reason?.replace(/\n/g, '<br/>');
    }

    getMailBody() {
        let v_updateStatusMsg = "";

        if (this._statusValidated) {
            v_updateStatusMsg = `Nous avons une bonne nouvelle à vous annoncer ! Votre profil vient d'être validé sur TeaMeet, vous avez désormais accès aux différentes offres des entreprises !<br/>
            Voici le lien pour y accéder : <a href="${process.env.BASEURL_FRONT}offers">cliquez-ici</a><br/>`;
        }
        else {
            v_updateStatusMsg = `Malheureusement, votre profil vient d'être refusé sur TeaMeet, vous n'avez pas encore accès aux différentes offres des entreprises.<br/>
            Pour cela nous vous invitons à compléter votre profil plus en détail.<br/>`;

            if (this._reason) v_updateStatusMsg += `Voici la raison de ce refus : <br/><br/> ${this._reason}`;
            else v_updateStatusMsg += `Vous pouvez définir des mots-clés représentant vos compétences ou vos technologies préférées.
            Également, vous pouvez écrire une description qui présente votre parcours et vos expériences à l'attention des entreprises.
            Pensez à ajouter un CV complet.`;
        }

        return v_updateStatusMsg;
    }

}

module.exports = {
    UpdateStatusTemplate
};
