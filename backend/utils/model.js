/**
 * Transforme une requête Firestore en tableau d'objets
 * 
 * @param queryRes          Réponse Firestore
 * @param deleteProperty    Tableau des propriétés à supprimer
 * 
 * @returns {Object[]}
 */
exports.arrayFromQuery = function (queryRes, deleteProperty = []) {

    let res = [];

    queryRes.forEach(item => {

        let data = item.data();
        deleteProperty.forEach((props) => {
           delete data[props];
        });

        let newItem = {
            id: item.id,
            ...data
        };
        res.push(newItem);
    });

    return res;
};

/**
 * Transforme une requête Firestore en objet
 * 
 * @param queryRes          Réponse Firestore
 * @param deleteProperty    Tableau des propriétés à supprimer
 * 
 * @returns {Object}
 */
exports.itemFromQuery = function (queryRes, deleteProperty = []) {

    let data = queryRes.data();
    
    deleteProperty.forEach((props) => {
        delete data[props];
    });

    return {
        id: queryRes.id,
        ...data
    };
};
