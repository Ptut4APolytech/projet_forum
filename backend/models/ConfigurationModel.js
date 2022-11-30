const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");

class RepresentativeModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'configuration';
    }

    /**
     * Retourne la configuration générale
     * 
     * @returns {Promise<Object>}
     */
    async find() {

        let config = await db.collection(this.collection).limit(1).get();

        config = modelUtils.arrayFromQuery(config)[0];

        return (config) ? config : {};
    }
}
module.exports = RepresentativeModel;
