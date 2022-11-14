'use strict';

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
	const NB_SLOTS_BY_DAY = 8;
	const SLOTS = Array.from(Array(NB_SLOTS_BY_DAY).keys());
	let response;
	try {
		await appointmentModel.deleteAll(); // reset appointments

		// Get all
		const STUDENTS = await studentModel.findAll();
		const COMPANIES = await companyModel.findAll();
		const OFFERS = await offerModel.findAll();
		
		let allAppointments = [];
		
		// Get validated
		const students_validated = STUDENTS.filter((stu) => stu.status === 'validated');
		const companies_valitated = COMPANIES.filter((com) => com.isValidated);
		const offers_validated = OFFERS.filter((off) => off.status === 'validated');

		// Set appointments
		students_validated.map(stu => ({...stu.appointments = []}));
		companies_valitated.map(com => ({...com.appointments = []}));
		offers_validated.map(off => ({...off.appointments = []}));

		// Shuffle
		const companies_shuffled = shuffle(companies_valitated);
		const offers_shuffled = shuffle(offers_validated);

		for (const company of companies_shuffled) { // loop company
			if (company.appointments.length < NB_SLOTS_BY_DAY) { // get if company not full
				const companyOffers = offers_shuffled.filter((o) => o.companyId === company.id);
				for (const offer of companyOffers) {
					for (const studentId of offer.orderedStudents) { // loop ordered students
						const student = students_validated.find(s => s.id === studentId);
						if (student) {
							if (student.orderedOffers.includes(offer.id)) {
								const common_slot = SLOTS.find(index => !company.appointments[index] && !student.appointments[index])
								if (common_slot) {

									// CREATE APPOINTMENT
									companyOffers.forEach((currO) => {
										currO.orderedStudents.splice(currO.orderedStudents.indexOf(student.id), 1);
									});
									student.orderedOffers.splice(student.orderedOffers.indexOf(currentOffer.id), 1);
									let appointment = {
										studentId: student.id,
										offerId: currentOffer.id,
										slot: slotAvailable,
										companyId: companyToHandle.id
									};
									student.appointments[slotAvailable] = appointment;
									companyToHandle.appointments[slotAvailable] = appointment;
									currentOffer.appointments[slotAvailable] = appointment;
									allAppointments.push(appointment);
								}
							}
						}
					}
				}
			}
		}

		let i = 0;
		let flag = false;
		// first loop both wants to meet
		while (!flag) {
			if (companiesToHandle.length === 0) {
				flag = true;
				continue;
			}
			let companyToHandle = companiesToHandle[i % companiesToHandle.length];
			if (companyToHandle.appointments.length < NBSLOTS) {
				let currentOffers = offersToHandle.filter((o) => o.companyId === companyToHandle.id);
				for (let currentOffer of currentOffers) {
					let studentId = currentOffer.orderedStudents.find((stuId) => {
						let student = students.find(s => s.id === stuId);
						if (student) {
							if (student.orderedOffers.includes(currentOffer.id)) {
								let slotAvailable = slots.find((index) => {
									return !companyToHandle.appointments[index] && !student.appointments[index];
								});
								if (slotAvailable != null) {
									// CREATE APPOINTMENT
									currentOffers.forEach((currO) => {
										currO.orderedStudents.splice(currO.orderedStudents.indexOf(student.id), 1);
									});
									student.orderedOffers.splice(student.orderedOffers.indexOf(currentOffer.id), 1);
									let appointment = {
										studentId: student.id,
										offerId: currentOffer.id,
										slot: slotAvailable,
										companyId: companyToHandle.id
									};
									student.appointments[slotAvailable] = appointment;
									companyToHandle.appointments[slotAvailable] = appointment;
									currentOffer.appointments[slotAvailable] = appointment;
									allAppointments.push(appointment);
									return true;
								}
							}
						}
						return false;
					});
					if (!studentId) {
						offersToHandle.splice(offersToHandle.indexOf(currentOffer), 1);
					}
				}
				if (currentOffers.length === 0) {
					companiesToHandle.splice(companiesToHandle.indexOf(companyToHandle), 1);
				}
			} else {
				companiesToHandle.splice(companiesToHandle.indexOf(companyToHandle), 1);
			}
			i++;
		}
		// second loop only the company wants to meet
		companiesToHandle = shuffle(companies.filter((c) => c.appointments.length < NBSLOTS));

		offersToHandle = shuffle(offers.filter((o) => o.appointments.length < NBSLOTS));
		i = 0;
		flag = false;
		while (!flag) {
			if (companiesToHandle.length === 0) {
				flag = true;
				continue;
			}
			let companyToHandle = companiesToHandle[i % companiesToHandle.length];
			if (companyToHandle.appointments.length < NBSLOTS) {
				let currentOffers = offersToHandle.filter((o) => o.companyId === companyToHandle.id);
				for (let currentOffer of currentOffers) {
					let studentId = currentOffer.orderedStudents.find((stuId) => {
						let student = students.find(s => s.id === stuId);
						if (student) {
							// if (student.orderedOffers.includes(currentOffer.id)) {
							let slotAvailable = slots.find((index) => {
								return !companyToHandle.appointments[index] && !student.appointments[index]
							});
							if (slotAvailable != null) {
								// CREATE APPOINTMENT
								currentOffers.forEach((currO) => {
									currO.orderedStudents.splice(currO.orderedStudents.indexOf(student.id), 1);
								});
								student.orderedOffers.splice(student.orderedOffers.indexOf(currentOffer.id), 1);
								let appointment = {
									studentId: student.id,
									offerId: currentOffer.id,
									slot: slotAvailable,
									companyId: companyToHandle.id
								};
								student.appointments[slotAvailable] = appointment;
								companyToHandle.appointments[slotAvailable] = appointment;
								currentOffer.appointments[slotAvailable] = appointment;
								allAppointments.push(appointment);
								return true;
							}
							// }
						}
						return false;
					});
					if (!studentId) {
						offersToHandle.splice(offersToHandle.indexOf(currentOffer), 1);
					}
				}
				if (currentOffers.length === 0) {
					companiesToHandle.splice(companiesToHandle.indexOf(companyToHandle), 1);
				}
			} else {
				companiesToHandle.splice(companiesToHandle.indexOf(companyToHandle), 1);
			}
			i++;
		}
		// last loop only the student wants to meet
		let studentsToHandle = shuffle(students.filter((s) => s.appointments.length < NBSLOTS));

		i = 0;
		flag = false;
		while (!flag) {
			if (studentsToHandle.length === 0) {
				flag = true;
				continue;
			}
			let studentToHandle = studentsToHandle[i % studentsToHandle.length];
			if (studentToHandle.appointments.length < NBSLOTS) {
				let offerId = studentToHandle.orderedOffers.find((offId) => {
					let offer = offers.find(o => o.id === offId);
					if (offer) {
						let company = companies.find(c => c.id === offer.companyId);
						let slotAvailable = slots.find((index) => {
							return !studentToHandle.appointments[index] && !company.appointments[index] && !company.appointments.find((a) => a && a.studentId === studentToHandle.id);
						});
						if (slotAvailable != null) {
							// CREATE APPOINTMENT
							studentToHandle.orderedOffers.splice(studentToHandle.orderedOffers.indexOf(offer.id), 1);
							let appointment = {
								studentId: studentToHandle.id,
								offerId: offer.id,
								slot: slotAvailable,
								companyId: company.id
							};
							studentToHandle.appointments[slotAvailable] = appointment;
							company.appointments[slotAvailable] = appointment;
							offer.appointments[slotAvailable] = appointment;
							allAppointments.push(appointment);
							return true;
						}
					}
					return false;
				});
				if (!offerId) {
					studentsToHandle.splice(studentsToHandle.indexOf(studentToHandle), 1);
				}
			} else {
				studentsToHandle.splice(studentsToHandle.indexOf(studentToHandle), 1);
			}
			i++;
		}
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
