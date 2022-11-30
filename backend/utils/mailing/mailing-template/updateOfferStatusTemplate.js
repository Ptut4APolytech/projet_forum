const { TemplateBuilder } = require("./templateBuilder");

class UpdateOfferStatusTemplate extends TemplateBuilder {

    /**
     * The UpdateOfferStatusTemplate class constructor.
     * @param {*} p_offer_title The title of the offer.
     * @param {*} p_status_validated The status of the offer.
     */
    constructor(p_offer_title, p_status_validated, p_reason = null) {
        super(`Mise à jour du statut de votre offre "${p_offer_title}"`, undefined);
        this._statusValidated = p_status_validated;
        this._offerTitle = p_offer_title;
        this._reason = p_reason?.replace(/\n/g, '<br/>');
    }

    getMailBody() {
        let v_updateStatusMsg = "";

        if (this._statusValidated) {
            v_updateStatusMsg = `Nous avons une bonne nouvelle à vous annoncer. Votre offre "${this._offerTitle}" vient d'être validée sur TeaMeet. Les étudiants peuvent maintenant consulter votre annonce.<br/>`;
        }
        else {
            v_updateStatusMsg = `Malheureusement, votre offre "${this._offerTitle}" vient d'être refusée sur TeaMeet. Les étudiants n'ont pas encore accès à votre annonce.<br/><br/>
            Pour changer cela nous vous invitons à compléter votre annonce plus en détail.<br/><br/>`;

            if (this._reason) v_updateStatusMsg += `Voici la raison de ce refus : <br/><br/> ${this._reason}`;
            else v_updateStatusMsg += `Vous pouvez définir des mots-clés représentant les compétences requises ou les technologies utilisées par le poste à pourvoir. 
            Également, vous pouvez écrire une description qui présente les missions, compétences requises des informations sur la localisation des bureaux.`;
        }

        return v_updateStatusMsg;
    }

}

module.exports = {
    UpdateOfferStatusTemplate
};