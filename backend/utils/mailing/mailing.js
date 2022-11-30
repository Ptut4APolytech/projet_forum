const fs = require("fs");
const nodemailer = require("nodemailer");

const c_mailingConfig = JSON.parse(fs.readFileSync("./utils/mailing/mailing-config.json"));

// MAILING DOCS
// https://ourcodeworld.com/articles/read/264/how-to-send-an-email-gmail-outlook-and-zoho-using-nodemailer-in-node-js

//Activate less secure app to gmail account
//https://myaccount.google.com/lesssecureapps

/**
 * This function allow to send an email to a list of recipients in BCC
 * @param {string} p_subject The subject of the email.
 * @param {string[]} p_recipients The list of the email recipients.
 * @param {string} p_email The email to send as HTML code.
 * 
 * @returns A rejected promise if the email cannot be sent or resolved promised otherwise
 */
async function sendMail(p_subject, p_recipients, p_email, p_attachments = []) {
    let { user: v_userConfig, password: v_passwordConfig, senderAlias: v_senderAliasConfig } = c_mailingConfig;

    let v_transporter = (process.env.ENVIRONMENT === "dev") 
	? nodemailer.createTransport({
        service: 'gmail',
    	auth: {
        	user: v_userConfig,
        	pass: v_passwordConfig
        }
    })
	: nodemailer.createTransport({
        host: 'smtpbv.univ-lyon1.fr',
        port: 25,
        secure: false
    });

    let v_mailOptions = {
        from: `"${v_senderAliasConfig}" <${v_userConfig}>`,
        bcc: p_recipients.join(","),
        subject: p_subject,
        html: p_email,
        attachments: [{
            filename: 'logo-teameet.png',
            path: './assets/logo-teameet.png',
            cid: 'logo'
        },
        ...p_attachments],
    };

    await v_transporter.sendMail(v_mailOptions);
}

module.exports = {
    sendMail
};