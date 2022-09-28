const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");

class CompanyModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'company';
    }

    /**
     * Retourne une liste d'entreprise selon un tableau d'ids
     *
     * @param ids : Tableau d'ids
     */
    async findByIds(ids) {
        let idsByTen = [];
        while (ids.length > 0) {
            idsByTen.push(ids.splice(0, ids.length > 10 ? 10 : ids.length));
        }

        let companiesToReturn = [];
        for (let idbt of idsByTen) {
            const companies = await db.collection(this.collection)
              .where(admin.firestore.FieldPath.documentId(), 'in', idbt)
              .get();

            companiesToReturn.push(...modelUtils.arrayFromQuery(companies));
        }
        return companiesToReturn;
    }

    async findByName(name) {

        let company = await db.collection(this.collection)
          .where('name', '==', name)
          .limit(1).get();

        company = modelUtils.arrayFromQuery(company)[0];

        return (company) ? company : {};
    }
}
module.exports = CompanyModel;
