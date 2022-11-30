var tools = require('./tools');
var utils = require('./writer');
const StudentModel = require('../models/StudentModel');
const RepresentativeModel = require('../models/RepresentativeModel');
const OfferModel = require('../models/OfferModel');

const studentModel = new StudentModel();
const representativeModel = new RepresentativeModel();
const offerModel = new OfferModel();

/**
 * Fonction qui retourne true si l'utilisateur peut exécuter la route false sinon
 * @param role Rôle de l'utilisateur courant
 * @param authorized liste des rôles authorisés
 * @returns {ResponsePayload}
 */
module.exports.canExecuteRequest = async function (res, user, authorized, exceptionRoles = [], exceptionId) {
    if (!authorized.includes(user.role)) {
        for (let exceptionRole of exceptionRoles) {
            // check exceptionId
            let componentId = {};
            let componentIds = [];
            switch (exceptionRole) {
                case 'student':
                    if (user.role !== 'student') { break; }
                    componentId = (await studentModel.findByUserId(user.id)).id;
                    break;
                case 'representative':
                    if (user.role !== 'representative') { break; }
                    componentId = (await representativeModel.findByUserId(user.id)).id;
                    break;
                case 'company':
                    if (user.role !== 'representative') { break; }
                    componentId = (await representativeModel.findByUserId(user.id)).companyId;
                    break;
                case 'offer':
                    if (user.role !== 'representative') { break; }
                    let listeOffer = await offerModel.findAllByCompanyId((await representativeModel.findByUserId(user.id)).companyId);
                    componentIds = listeOffer.map((o) => o.id);
                    break;
                case 'admin':
                    if (user.role !== 'admin') { break; }
                    componentId = user.id;
                    break;
            }
            
            if (componentId === exceptionId || componentIds.includes(exceptionId)) {
                return true;
            }
        }
        utils.writeJson(res, tools.respondWithCode(401, 'Vous n\'êtes pas autorisé à appeler cette route'));
        return false;
    }
    return true;
};

