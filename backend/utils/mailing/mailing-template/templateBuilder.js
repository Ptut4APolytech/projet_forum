/**
 * Class to store basic information about mail templates.
 */
class TemplateBuilder {

    /**
     * The TemplateBuilder class constructor.
     * @param {*} p_subject The subject of the mail template.
     */
    constructor(p_subject, p_user_firstname) {
        this._subject = p_subject;
        this._header = `Bonjour`;
        if (p_user_firstname)
            this._header += ` ${p_user_firstname}`;
        this._header += `, <br/><br/>`;

        this._signature = `<br/><br/>
        Cet email est envoyé automatiquement. Merci de ne pas y répondre.<br/>
        Pour toute demande de contact, merci d'envoyer un mail à : <a href="mailto:appr-epu-info@univ-lyon1.fr">appr-epu-info@univ-lyon1.fr</a><br/><br/>
        L'équipe TeaMeeT<br/>
        <img style="width: 100px" src="cid:logo"><br/>
        ${process.env.BASEURL_FRONT}`;
    }

    /**
     * A function to override in children class to get final HTML template to send by email.
     */
    getHTML() {
        return (this._header + this.getMailBody() + this._signature).replace(/\n/g, '');;
    }

    /**
     * A function to override in children class to get the HTML body of the sended email.
     */
    getMailBody() {
        throw new Error('You have to implement the method getMailBody in subclass!');
    }

    /**
     * Function to get the mail subject
     */
    getSubject() {
        return `[TeaMeet] ${this._subject}`;
    }

}

module.exports = {
    TemplateBuilder
};