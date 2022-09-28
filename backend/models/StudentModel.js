const modelUtils = require('../utils/model');
const tools = require('../utils/tools');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");
const UserModel = require("./UserModel");

class StudentModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'student';
        this.userModel = new UserModel();
    }

    async findAll() {

        // Récupération des étudiants
        let students = await db.collection(this.collection).get();
        students = modelUtils.arrayFromQuery(students);

        if (students.length) {

            // Ajout des informations complètes sur un utilisateur
            const users = await this.userModel.findByIds([...new Set(students.map((s) => s.userId))]);
            for (let student of students) {
                student.user = users.find((user) => user.id === student.userId);
            }
            students.sort((a, b) => a.user.lastname.localeCompare(b.user.lastname));
        }

        return students;
    }

    async findOne(studentId) {

        let student = await db.collection(this.collection).doc(studentId).get();

        // Vérification de l'existence de l'étudiant
        if (!student.exists) {
            student = {}
        }
        else {

            // Ajout des informations sur l'utilisateur
            student = modelUtils.itemFromQuery(student);
            student.user = await this.userModel.findOne(student.userId);
        }

        return student;
    }

    /**
     * Retourne un étudiant selon son identifiant utilisateur
     *
     * @param userId Identifiant utilisateur
     *
     * @returns {Promise<Object>}
     */
    async findByUserId(userId) {

        let student = await db.collection(this.collection)
            .where('userId', '==', userId)
            .limit(1).get();

        student = modelUtils.arrayFromQuery(student)[0];

        return (student) ? student : {};
    }

    /**
     * Retourne une liste d'étudiants selon un tableau d'ids
     *
     * @param ids : Tableau d'ids
     */
    async findByIds(ids) {
        let students = [];
        for (let id of ids) {
            let student = await this.findOne(id);
            if (!student.id) {
                return [];
            }
            else {
                students.push(student);
            }
        }

        return students;
    }

    /**
     * Fonction de recherche générale sur les étudiants
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
            } else if (s.operator != 'LIKE') { // Cas où on ne cherche pas une partie d'un string
                query = query.where(s.path, s.operator, s.value);
            } else {
                localFts.push(s);
            }
        }
        query = await query.get();
        query = modelUtils.arrayFromQuery(query);

        if (query.length) {

            // Ajout des informations complètes sur un utilisateur
            const users = await this.userModel.findByIds([...new Set(query.map((s) => s.userId))]);
            for (let student of query) {
                student.user = users.find((user) => user.id === student.userId);
            }
        }

        // Full-text search local (avec l'opérator 'LIKE')
        if (localFts.length) {

            let tmpQuery = [];
            for (let elem of query) {
                for (let fts of localFts) {
                    // Cas où on cherche sur tous les attributs utilisables
                    if (fts.path == "global") {

                        //Recherche sur le nom et prénom dans les deux positions possibles
                        if (
                            tools.toLowerCaseNormalized(elem.user.firstname + " " + elem.user.lastname)
                                .includes(tools.toLowerCaseNormalized(fts.value))
                            ||
                            tools.toLowerCaseNormalized(elem.user.lastname + " " + elem.user.firstname)
                                .includes(tools.toLowerCaseNormalized(fts.value))
                            ||
                            tools.toLowerCaseNormalized(elem.user.email)
                                .includes(tools.toLowerCaseNormalized(fts.value))
                        ) {
                            tmpQuery.push(elem);
                        }
                        // Recherche sur les tags
                        else {
                            for (let tag of elem['tags']) {
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
        query.sort((a, b) => a.user.lastname.localeCompare(b.user.lastname));
        return query;
    }

    async findAllByOfferId(offerId) {
        let students = await db.collection(this.collection).where('orderedOffers', 'array-contains', offerId).get();

        students = modelUtils.arrayFromQuery(students);
        return (students) ? students : [];
    }
}
module.exports = StudentModel;
