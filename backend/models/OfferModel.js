const modelUtils = require('../utils/model');
const tools = require('../utils/tools');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");
const CompanyModel = require('./CompanyModel');
const StudentModel = require('./StudentModel');

class OfferModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'offer';
        this.companyModel = new CompanyModel();
        this.studentModel = new StudentModel();
    }

    async findAll() {

        // Récupération des offres
        let offers = await db.collection(this.collection).get();
        offers = modelUtils.arrayFromQuery(offers);

        if (offers.length) {

            // Ajout des informations complètes sur une entreprise
            const companies = await this.companyModel.findByIds([...new Set(offers.map((s) => s.companyId))]);
            for (let offer of offers) {
                offer.company = companies.find((company) => company.id === offer.companyId);
            }
            offers.sort((a, b) => a.company.name.localeCompare(b.company.name));
        }

        return offers;
    }

    async findAllByCompanyId(companyId, status = null) {

        // Récupération des offres
        let offers = db.collection(this.collection).where('companyId', '==', companyId);

        // On récupère des offres avec un statut précis, s'il est fourni
        if (status) {
            offers = offers.where("status", "==", status);
        }

        offers = await offers.get();
        offers = modelUtils.arrayFromQuery(offers);

        if (offers.length) {
            // Ajout des informations complètes sur une entreprise
            const companies = await this.companyModel.findByIds([...new Set(offers.map((s) => s.companyId))]);
            for (let offer of offers) {
                offer.company = companies.find((company) => company.id === offer.companyId);
            }
            offers.sort((a, b) => a.title.localeCompare(b.title));
        }

        return offers;
    }

    async findOne(offerId) {

        let offer = await db.collection(this.collection).doc(offerId).get();

        // Vérification de l'existence de l'offre
        if (!offer.exists) {
            offer = {}
        }
        else {

            // Ajout des informations d'une entreprise
            offer = modelUtils.itemFromQuery(offer);
            offer.company = await this.companyModel.findOne(offer.companyId);
        }

        return offer;
    }

    /**
     * Fonction de recherche générale sur une offre
     *
     * @param search tableau de filtres de recherche
     *
     * @returns {Promise<Object[]>}
     */
    async search(search) {

        let query = db.collection(this.collection);

        let localFts = [];
        for (let s of search) {

            if (s.path == "id") {
                query = query.where(admin.firestore.FieldPath.documentId(), s.operator, s.value);
            }
            // Cas où on ne cherche pas une partie d'un string
            else if (s.operator != 'LIKE') {
                query = query.where(s.path, s.operator, s.value);
            }
            else {
                localFts.push(s);
            }
        }
        query = await query.get();
        query = modelUtils.arrayFromQuery(query);

        if (query.length) {

            // Ajout des informations complètes sur une entreprise
            const companies = await this.companyModel.findByIds([...new Set(query.map((s) => s.companyId))]);
            for (let offer of query) {
                offer.company = companies.find((company) => company.id === offer.companyId);
            }
        }

        // Full-text search local (avec l'opérator 'LIKE')
        if (localFts.length) {

            let tmpQuery = [];
            for (let elem of query) {
                for (let fts of localFts) {

                    // Cas où on cherche sur tous les attributs utilisables
                    if (fts.path == "global") {

                        // Recherche sur le titre
                        if (
                            tools.toLowerCaseNormalized(elem.title)
                                .includes(tools.toLowerCaseNormalized(fts.value))
                            ||
                            tools.toLowerCaseNormalized(elem.company.name)
                                .includes(tools.toLowerCaseNormalized(fts.value))
                        ) {
                            tmpQuery.push(elem);
                        }
                        // Recherche sur les tags
                        else {
                            for (let tag of elem.tags) {
                                if (tools.toLowerCaseNormalized(tag)
                                    .includes(tools.toLowerCaseNormalized(fts.value))) {

                                    tmpQuery.push(elem);
                                    break;
                                }
                            }
                        }
                    }
                    else if (tools.toLowerCaseNormalized(elem[fts.operator])
                        .includes(tools.toLowerCaseNormalized(fts.value))) {
                        tmpQuery.push(elem);
                    }
                }
            }
            query = tmpQuery;
        }
        query.sort((a, b) => a.title.localeCompare(b.title));

        return query;
    }

    /**
     * Retourne la liste des étudiants d'une offre
     *
     * @param offerId Identifiant de l'offre
     *
     * @returns {Promise<Object[]>}
     */
    async findOrderedStudents(offerId) {

        let offer = await db.collection(this.collection).doc(offerId).get();

        let students;
        // Vérification de l'existence de l'offre
        if (!offer.exists) {
            students = null;
        }
        else {

            offer = modelUtils.itemFromQuery(offer);
            students = await this.studentModel.findByIds(offer.orderedStudents);
        }

        return students;
    }

    async findByCompanyId(companyId) {

        let offers = await db.collection(this.collection).where('companyId', '==', companyId).get();

        offers = modelUtils.arrayFromQuery(offers);

        return (offers) ? offers : [];
    }

    async findAllByStudentId(studentId) {

        let offers = await db.collection(this.collection).where('orderedStudents', 'array-contains', studentId).get();

        offers = modelUtils.arrayFromQuery(offers);

        return (offers) ? offers : [];
    }

    /**
     * Supprime une entité
     *
     * @param id Identifiant de l'entité
     *
     * @returns {Promise<boolean>}
     */
    async delete(id) {

        // Suppression du voeu des étudiants ayant postulé à l'offre
        let students = await this.studentModel.findAllByOfferId(id);
        for (let student of students) {
            student.orderedOffers.splice(student.orderedOffers.indexOf(id), 1);

            let result = await this.studentModel.update(student.id, student);

            // Arrêt de la fonction si la mise à jour échoué
            if (!result.id) {
                return false;
            }
        }

        // Suppression de l'offre
        await super.delete(id);

        return true;
    }
}
module.exports = OfferModel;
