'use strict';

const { NB_SLOTS_BY_DAY, SLOTS } = require('../utils/constants');
const tools = require('../utils/tools');
const AppointmentModel = require('../models/AppointmentModel');
const CompanyModel = require('../models/CompanyModel');
const StudentModel = require('../models/StudentModel');
const OfferModel = require('../models/OfferModel');
const ConfigurationModel = require('../models/ConfigurationModel');

const appointmentModel = new AppointmentModel();
const companyModel = new CompanyModel();
const studentModel = new StudentModel();
const offerModel = new OfferModel();
const configurationModel = new ConfigurationModel();

/**
 * Retourne la liste des RDV
 *
 * @returns {Promise<Object[]>}
 */
exports.getAppointments = async function () {

	let response;
	try {
		response = await appointmentModel.findAll();
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Retourne la liste des RDV d'un utilisateur (étudiant ou représentant)
 *
 * @returns {Promise<Object[]>}
 */
exports.getStudentAppointments = async function (studentId) {

	let response;
	try {

		const config = await configurationModel.find();

		// On vérifie que l'accès au planning est autorisé dans la configuration
		if (!config.showPlanning) {
			response = tools.respondWithCode(400, "Planning bloqué par les administrateurs")
		}
		else {
			response = await appointmentModel.findAllByStudentId(studentId);
		}
	}
	catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Retourne la liste des RDV d'une entreprise
 *
 * @returns {Promise<Object[]>}
 */
exports.getCompanyAppointments = async function (companyId) {
	let response;
	try {

		const config = await configurationModel.find();

		// On vérifie que l'accès au planning est autorisé dans la configuration
		if (!config.showPlanning) {
			response = tools.respondWithCode(400, "Planning bloqué par les administrateurs")
		}
		else {
			response = await appointmentModel.findAllByCompanyId(companyId);
		}
	}
	catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};


/**
 * Retourne un RDV
 *
 * @param appointmentId : Identifiant du RDV
 *
 * @returns {Promise<Object>}
 */
exports.getAppointment = async function (appointmentId) {

	let response;
	try {

		const appointment = await appointmentModel.findOne(appointmentId);

		// Vérification de l'existence du RDV
		if (!appointment.id) {
			response = tools.respondWithCode(404, "RDV introuvable");
		} else {
			response = appointment;
		}
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Création d'un RDV
 *
 * @param appointment : RDV à créer
 *
 * @returns {Promise<Object>}
 */
exports.addAppointment = async function (appointment) {

	let response;
	try {

		// Vérification de l'existence de l'entreprise
		if (!(await companyModel.findOne(appointment.companyId)).id) {
			response = tools.respondWithCode(404, "Entreprise introuvable");
		}
		// Vérification de l'existence de l'étudiant
		else if (!(await studentModel.findOne(appointment.studentId)).id) {
			response = tools.respondWithCode(404, "Etudiant introuvable");
		}
		// Vérification de l'existence de l'offre
		else if (!(await offerModel.findOne(appointment.offerId)).id) {
			response = tools.respondWithCode(404, "Offre introuvable");
		} else {

			let appointmentItem = {
				companyId: appointment.companyId,
				studentId: appointment.studentId,
				offerId: appointment.offerId,
				slot: appointment.slot
			}

			response = await appointmentModel.create(appointmentItem);
		}
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Suppression d'un RDV
 *
 * @param appointmentId : Identifiant du RDV
 *
 * @returns {Promise<Object>}
 */
exports.delAppointment = async function (appointmentId) {

	let response;
	try {

		const deleteSuccess = await appointmentModel.delete(appointmentId);

		if (deleteSuccess) {
			response = { success: true };
		} else {
			response = tools.respondWithCode(404, "RDV introuvable");
		}
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Suppression de tous les rdv liés
 *
 * @param id : Identifiant de l'élément lié
 * @param type: Type de l'élément parmis ('student', 'offer', 'company')
 *
 * @returns {Promise<Object>}
 */
exports.delAppointmentByTypeId = async function (id, type) {

	let response;
	try {

		let apposToDelete = await appointmentModel.findByTypeId(id, type);
		for (let appoToDelete of apposToDelete) {
			await appointmentModel.delete(appoToDelete.id);
		}
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};
/**
 * Modification d'un RDV
 *
 * @param appointmentId : Identifiant du RDV
 * @param appointment : Objet RDV à modifier
 *
 * @returns {Promise<Object>}
 */
exports.setAppointment = async function (appointmentId, appointment) {

	let response;
	try {

		const appointmentInBase = await appointmentModel.findOne(appointmentId);

		// Vérification de l'existence de l'entreprise
		if (!appointmentInBase.id) {
			response = tools.respondWithCode(404, "RDV introuvable");
		} else {

			let newDatas = {};
			if (appointment.slot) {
				newDatas.slot = appointment.slot;
			}

			response = await appointmentModel.update(appointmentId, newDatas);
		}
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};


exports.createPlanning = async function () {
	let response;
	try {
		await appointmentModel.deleteAll(); // reset appointments

		// Get all
		const STUDENTS = await studentModel.findAll();
		const COMPANIES = await companyModel.findAll();
		const OFFERS = await offerModel.findAll();
		
		// Get validated
		const students_validated = STUDENTS.filter((stu) => stu.status === 'validated');
		const companies_valitated = COMPANIES.filter((com) => com.isValidated);
		const offers_validated = OFFERS.filter((off) => off.status === 'validated');

		// Set appointments
		students_validated.map(stu => ({...stu.appointments = []}));
		companies_valitated.map(com => ({...com.appointments = []}));
		offers_validated.map(off => ({...off.appointments = []}));

		// Init vars
		let allAppointments = [];
		
		// 1st loop : compagny AND student wants to meet
		allAppointments = allAppointments.concat(putAppointment(students_validated, companies_valitated, offers_validated, true));

		// 2nd loop : only compagny wants to meet (if there is still some available slots)
		allAppointments = allAppointments.concat(putAppointment(students_validated, companies_valitated, offers_validated, true));

		// last loop only the student wants to meet
		allAppointments = allAppointments.concat(putAppointment(students_validated, companies_valitated, offers_validated, false));
		
		for (let appo of allAppointments) {
			await appointmentModel.create(appo);
		}
		response = appointmentModel.findAll();
		// pour chaque entreprise, on choisi un horaire random, on choisi le premier étudiant qui l'a choisi aussi
		// ainsi de suite
		// c win
		// si plus de student l'ont choisi, on prend les premiers étudiants qui ne l'ont pas choisi
	} catch (error) {
		response = tools.respondWithCode(500, error);
	}

	return response;
};

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

/**
 * Put Appointments.
 * @param {Array} students_validated students already validated.
 * @param {Array} companies_valitated companies already validated.
 * @param {Array} offers_validated offers already validated.
 * @param {Boolean} loopingOnCompany flag.
 */
const putAppointment = (students_validated, companies_valitated, offers_validated, loopingOnCompany) => {
	// Init vars
	let allAppointments = [];

	// Shuffle
	let companies_shuffled = shuffle(companies_valitated.filter((com) => com.appointments.length < NB_SLOTS_BY_DAY));
	let offers_shuffled = shuffle(offers_validated.filter((off) => off.appointments.length < NB_SLOTS_BY_DAY));
	let students_shuffled = shuffle(students_validated.filter((stu) => stu.appointments.length < NB_SLOTS_BY_DAY));


	if (loopingOnCompany) {
		const appointments = companyPriority(companies_shuffled, students_shuffled, offers_shuffled);
		allAppointments = allAppointments.concat(appointments);
	} else { // Loop on students
		const appointments = studentPriority(companies_valitated, students_shuffled, offers_shuffled);
		allAppointments = allAppointments.concat(appointments);
	}

	return allAppointments;
}

/**
 * Get all appointments to add with company priority.
 * @param {Array} companies_shuffled companies shuffled.
 * @param {Array} students_validated students already validated.
 * @param {Array} offers_shuffled offers shuffled.
 */
const companyPriority = (companies_shuffled, students_validated, offers_shuffled) => {
	let appointmentToAdd = []
	// Loop on companies
	for (const company of companies_shuffled) { // loop company
		if (company.appointments.length < NB_SLOTS_BY_DAY) { // get if company not full
			const companyOffers = offers_shuffled.filter((o) => o.companyId === company.id);
			for (const offer of companyOffers) { // loop on company offers
				for (const studentId of offer.orderedStudents) { // loop ordered students
					const student = students_validated.find(s => s.id === studentId);
					if (student) {
						if (student.orderedOffers.includes(offer.id)) {
							const appointment = check_slot(company, student, companyOffers, offer)
							if (appointment !== null) appointmentToAdd.push(appointment);
						}
					} else {
						offers_shuffled.splice(offers_shuffled.indexOf(offer), 1);
					}
				}
			}
			if (companyOffers.length === 0) {
				companies_shuffled.splice(companies_shuffled.indexOf(company), 1);
			}
		} else {
			companies_shuffled.splice(companies_shuffled.indexOf(company), 1);
		}
	}
	return appointmentToAdd;
}

/**
 * Get all appointments to add with student priority.
 * @param {Array} companies_valitated companies already validated.
 * @param {Array} students_shuffled students shuffled.
 * @param {Array} offers_shuffled offers shuffled.
 */
const studentPriority = (companies_valitated, students_shuffled, offers_shuffled) => {
	let appointmentToAdd = []
	for (const student of students_shuffled) { // loop student
		if (student.appointments.length < NB_SLOTS_BY_DAY) { // get if student not full
			const studentOffers = offers_shuffled.filter((o) => o.orderedStudents.includes(student.id));
			for (const offer of studentOffers) { // loop on student offers
				const company = companies_valitated.find(c => c.id === offer.companyId);
				if (company) { // check useless but still
					if (company.appointments.length < NB_SLOTS_BY_DAY) {
						const appointment = check_slot(company, student, studentOffers, offer)
						if (appointment !== null) appointmentToAdd.push(appointment);
					}
				}				}
			if (studentOffers.length === 0) {
				students_shuffled.splice(students_shuffled.indexOf(student), 1);
			}
		} else {
			students_shuffled.splice(students_shuffled.indexOf(student), 1);
		}
	}
	return appointmentToAdd;
}

/**
 * Get if we can put appointment.
 * @param {Object} company a company.
 * @param {Object} student a student.
 * @param {Array} companyOffers offers of a company.
 * @param {Object} offer an offer.
 */
const check_slot = (company, student, companyOffers, offer) => {
	const common_slot = SLOTS.find(index => !company.appointments[index] && !student.appointments[index])
	if (common_slot !== null && common_slot !== undefined) {
		const appointment = createAppointment(company, student, companyOffers, offer, common_slot);
		return appointment
	}
	return null
}

/**
 * Create Appointment.
 * @param {Object} company a company.
 * @param {Object} student a student.
 * @param {Array} companyOffers offers of a company.
 * @param {Object} offer an offer.
 * @param {Number} slot a slot.
 */
const createAppointment = (company, student, companyOffers, offer, slot) => {
	companyOffers.forEach((offer) => {
		offer.orderedStudents.splice(offer.orderedStudents.indexOf(student.id), 1);
	});
	student.orderedOffers.splice(student.orderedOffers.indexOf(offer.id), 1);
	const appointment = {
		studentId: student.id,
		offerId: offer.id,
		slot: slot,
		companyId: company.id
	};
	student.appointments[slot] = appointment;
	company.appointments[slot] = appointment;
	offer.appointments[slot] = appointment;
	return appointment;
}
