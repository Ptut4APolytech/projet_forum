
export function GET_STUDENTS(state) {
  return state.students
}
export function GET_REPRESENTATIVES(state) {
  return state.representatives
}
export function GET_COMPANIES(state) {
  return state.companies
}
export function GET_ADMINS(state) {
  return state.admins
}

export function GET_OFFERS(state) {
  return state.offers
}

export function GET_CURRENT_USER(state) {
  return state.currentUser
}

export function GET_CURRENT_STUDENT(state) {
  return state.currentStudent
}

export function GET_CURRENT_REPRESENTATIVE(state) {
  return state.currentRepresentative
}

export function GET_CURRENT_COMPANY(state)  {
  return state.currentCompany;
}

export function GET_AUTHENTICATED_STATUS(state) {
  return state.isAuthenticated
}

export function GET_TOKEN(state) {
  return state.token;
}

export function GET_POPUP(state) {
  return state.popup;
}

export function GET_FORUM_DATE(state) {
  return state.forumDate;
}

export function GET_FORUM_HEURE(state) {
	return state.forumHeure;
  }

export function GET_PLANNING_PUBLISHED(state) {
  return state.showPlanning;
}