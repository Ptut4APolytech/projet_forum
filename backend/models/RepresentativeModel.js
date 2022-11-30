const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");
const UserModel = require("./UserModel");
const CompanyModel = require("./CompanyModel");

class RepresentativeModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'representative';
        this.userModel = new UserModel();
        this.companyModel = new CompanyModel();
    }

    async findAll() {

        // Récupération des représentants
        let representatives = await db.collection(this.collection).get();
        representatives = modelUtils.arrayFromQuery(representatives);

        if (representatives.length) {

            // Ajout des informations complètes sur un utilisateur et une entreprise
            const users = await this.userModel.findByIds([...new Set(representatives.map((s) => s.userId))]);
            const companies = await this.companyModel.findByIds([...new Set(representatives.map((s) => s.companyId))]);

            for (let representative of representatives) {
                representative.user = users.find((user) => user.id === representative.userId);
                representative.company = companies.find((company) => company.id === representative.companyId);
            }
            representatives.sort((a, b) => a.user.lastname.localeCompare(b.user.lastname));
        }

        return representatives;
    }

    async findOne(representativeId) {

        let representative = await db.collection(this.collection).doc(representativeId).get();

        // Vérification de l'existence du représentant
        if (!representative.exists) {
            representative = {}
        }
        else {

            // Ajout des informations d'un utilisateur et d'une entreprise
            representative = modelUtils.itemFromQuery(representative);
            representative.user = await this.userModel.findOne(representative.userId);
            representative.company = await this.companyModel.findOne(representative.companyId);
        }

        return representative;
    }

    /**
     * Retourne un représentant selon son identifiant utilisateur
     *
     * @param userId Identifiant utilisateur
     *
     * @returns {Promise<Object>}
     */
    async findByUserId(userId) {

        let representative = await db.collection(this.collection)
            .where('userId', '==', userId)
            .limit(1).get();

        representative = modelUtils.arrayFromQuery(representative)[0];

        return (representative) ? representative : {};
    }

    async findByCompanyId(companyId) {

        let representatives = await db.collection(this.collection).where('companyId', '==', companyId).get();

        representatives = modelUtils.arrayFromQuery(representatives);

        return (representatives) ? representatives : [];
    }
}
module.exports = RepresentativeModel;
