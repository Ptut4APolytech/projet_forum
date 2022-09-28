import instance from '../adapters/axios';

export function getOffers() {
    return instance.get(`/offer`);
}

export function searchOffers(search) {
    return instance.post(`/offer/search`, { search: search });
}

export function getOffer(offerId) {
    return instance.get(`/offer/${offerId}`);
}

export function getOfferStudents(offerId) {
    return instance.get(`/offer/${offerId}/offerStudents`);
}

export function updateOffer(offerId, data) {
    return instance.put(`/offer/${offerId}`, data);
}

export function downloadFile(filePath) {
    return instance.post(`/file/download/`, { path: filePath }, { responseType: 'blob' });
}

export function getOfferByCompanyId(companyId, status = null) {

    let params = null;
    if(status) {
        params = { status };
    }

    return instance.get(`/offer/companyOffer/${companyId}`, { params });
}

export function searchStudents(search) {
    return instance.post(`/student/search`, { search: search });
}

export function getStudentsAvailable() {
    return instance.get(`/student`);
}

export function getStudent(studentId) {
    return instance.get(`/student/${studentId}`);
}

export function generatePlanning() {
    return instance.get(`/planning/generate`);
}

export function getStudentAppointments(studentId) {
    return instance.get(`/appointment/studentAppointments/${studentId}`)
}

export function getCompanyAppointments(companyId) {
    return instance.get(`/appointment/companyAppointments/${companyId}`)
}

export function sendSurvey() {
    return instance.get('/admin/sendSurvey');
}

export function delOffer(offerId){
    return instance.delete(`/offer/${offerId}`)
}

export function getConfiguration() {
    return instance.get('/configuration');
}

export function updateConfiguration(configId, data) {
    return instance.put(`/configuration/${configId}`, data);
}