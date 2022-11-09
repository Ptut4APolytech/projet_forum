export function SET_STUDENTS (state, data) {
  state.students = data
}

export function SET_REPRESENTATIVE (state, data) {
  state.representatives = data
}

export function SET_COMPANIES (state, data) {
  state.companies = data
}

export function SET_ADMINS (state, data) {
  state.admins = data
}

export function SET_OFFERS (state, data) {
  state.offers = data
}

export function SET_CURRENT_USER (state, data) {
  state.currentUser = data
}

export function SET_CURRENT_STUDENT (state, data) {
  state.currentStudent = data
}

export function SET_CURRENT_REPRESENTATIVE (state, data) {
  state.currentRepresentative = data
}

export function SET_CURRENT_COMPANY (state, data) {
  state.currentCompany = data
}

export function SET_AUTHENTICATED_STATUS (state, data) {
  state.isAuthenticated = data
}

export function SET_TOKEN (state, data) {
  window.localStorage.setItem('token', data)
  state.token = data
}

export function SET_POPUP (state, data) {
  state.popup = data
}

export function SET_FORUM_DATE (state, data) {
  state.forumDate = data
}

export function SET_FORUM_HEURE (state, data) {
	state.forumHeure = data
} 

export function SET_PLANNING_PUBLISHED (state, data) {
  state.showPlanning = data
}