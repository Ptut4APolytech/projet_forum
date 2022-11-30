const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");

class UserModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'user';
        this.deletedProperties = ['password', 'token'];
    }

    async findByEmail(email) {

        let user = await db.collection(this.collection)
            .where('email', '==', email)
            .limit(1).get();

        user = modelUtils.arrayFromQuery(user)[0];

        return (user) ? user : {};
    }

    async findByResetToken(token) {

        let user = await db.collection(this.collection)
            .where('resetToken', '==', token)
            .limit(1).get();

        user = modelUtils.arrayFromQuery(user)[0];

        return (user) ? user : {};
    }

    async findAllByRole(role) {

        let users = await db.collection(this.collection)
            .where('role', '==', role).get();

        users = modelUtils.arrayFromQuery(users, this.deletedProperties);
        users.sort((a, b) => a.lastname.localeCompare(b.lastname));

        return users;
    }

    /**
     * Retourne des utilisateurs selon une liste d'identifiants
     *
     * @param ids Tableau d'identifiants utilisateurs
     *
     * @returns {Promise<Object[]>}
     */
     async findByIds(ids) {
        let idsByTen = [];
        while (ids.length > 0) {
            idsByTen.push(ids.splice(0, ids.length > 10 ? 10 : ids.length));
        }

        let usersToReturn = [];
        for (let idbt of idsByTen) {
            const users = await db.collection(this.collection)
              .where(admin.firestore.FieldPath.documentId(), 'in', idbt)
              .get();

            usersToReturn.push(...modelUtils.arrayFromQuery(users, this.deletedProperties));
        }
        return usersToReturn;
    }

    /**
     * Retourne un utilisateur selon son token
     *
     * @param token Token d'accès
     *
     * @returns {Promise<Object>}
     */
    async findByToken(token) {

        let user = await db.collection(this.collection)
            .where('token', '==', token)
            .limit(1).get();

        user = modelUtils.arrayFromQuery(user)[0];

        return (user) ? user : {};
    }
}
module.exports = UserModel;
