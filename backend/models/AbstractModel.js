const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

class AbstractModel {

    constructor() {
        // Nom de la collection Firestore
        this.collection = null;

        // Propriétés à supprimer dans l'objet
        this.deletedProperties = [];
    }

    /**
     * Liste de toutes les entités d'une collection
     * 
     * @returns {Promise<Object[]>} 
     */
    async findAll() {
        const entities = await db.collection(this.collection).get();
        return modelUtils.arrayFromQuery(entities, this.deletedProperties);
    }

    /**
     * Retourne une entité selon son identifiant
     * 
     * @param id Identifiant de l'entité
     * 
     * @returns {Promise<Object>}
     */
    async findOne(id) {
        const entity = await db.collection(this.collection).doc(id).get();

        return (entity.exists) ? modelUtils.itemFromQuery(entity, this.deletedProperties) : {};
    }

    /**
     * Création d'une entité
     * 
     * @param entity L'objet entité
     * 
     * @returns {Promise<Object>}
     */
    async create(entity) {

        let res = await db.collection(this.collection).add(entity);
        res = await res.get();

        return modelUtils.itemFromQuery(res, this.deletedProperties);
    }

    /**
     * Modifie une entité
     * 
     * @param id        Identifiant de l'entité
     * @param newData   Objet de nouvelles données
     * 
     * @returns {Promise<Object>}
     */
    async update(id, newData) {

        const res = await db.collection(this.collection).doc(id);
        await res.update(newData);

        return modelUtils.itemFromQuery(await res.get(), this.deletedProperties);
    }

    /**
     * Supprime une entité
     * 
     * @param id Identifiant de l'entité
     * 
     * @returns {Promise<boolean>} 
     */
    async delete(id) {

        try {
            const res = await db.collection(this.collection).doc(id).delete({ exists: true });

            return true;
        }
        catch (error) {

            // Cas où l'identifiant est inconnu
            if (error.code && error.code === 5) {
                return false;
            }
            else {
                throw error;
            }
        }
    }

    /**
     * Supprime toutes les entités
     *
     * @returns {Promise<boolean>}
     */
    async deleteAll() {

        try {
            const query = db.collection(this.collection).orderBy('__name__').limit(50);

            return new Promise((resolve, reject) => {
                this.deleteQueryBatch(db, query, resolve).catch(reject);
            });
        }
        catch (error) {

            // Cas où l'identifiant est inconnu
            if (error.code && error.code === 5) {
                return false;
            }
            else {
                throw error;
            }
        }
    }

    async deleteQueryBatch (db, query, resolve) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            this.deleteQueryBatch(db, query, resolve);
        });
    }
}
module.exports = AbstractModel;