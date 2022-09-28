const modelUtils = require('../utils/model');
const admin = require('firebase-admin');
const db = admin.firestore();

const AbstractModel = require("./AbstractModel");

class AppointmentModel extends AbstractModel {

    constructor() {
        super();
        this.collection = 'appointment';
    }

    async findByTypeId(id, type) {

        let appointments = await db.collection(this.collection).where(type, '==', id).get();

        appointments = modelUtils.arrayFromQuery(appointments);

        return (appointments) ? appointments : [];
    }

    async findAllByStudentId(studentId) {

        // Récupération des appointments
        let appointments = db.collection(this.collection).where('studentId', '==', studentId);

        appointments = await appointments.get();
        appointments = modelUtils.arrayFromQuery(appointments);

        return appointments;
    }

    async findAllByCompanyId(companyId) {

        // Récupération des appointments
        let appointments = db.collection(this.collection).where('companyId', '==', companyId);

        appointments = await appointments.get();
        appointments = modelUtils.arrayFromQuery(appointments);

        return appointments;
    }

}
module.exports = AppointmentModel;
