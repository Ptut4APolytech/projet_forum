import instance from '../adapters/axios';

export async function getAllStudents({ commit }) {
  await instance.get('/student').then((res) => {
    commit('SET_STUDENTS', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getStudent({ commit }, data) {
  await instance.get('/student/' + data).then((res) => {
    commit('SET_CURRENT_STUDENT', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function updateStudent({ commit }, data) {
  await instance.put('/student/' + data.id, data).then((res) => {
    commit('SET_CURRENT_STUDENT', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getUser({ commit }, data) {
  await instance.get('/user/' + data, data).then((res) => {
    commit('SET_CURRENT_USER', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function updateUser({ commit }, data) {
  await instance.put('/user/' + data.id, data).then((res) => {
    commit('SET_CURRENT_USER', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function addStudent({ }, data) {
  await instance.post('/student', data)
}

// eslint-disable-next-line
export async function delStudent({ commit }, data) {
  await instance.delete('/student/' + data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getAllRepresentatives({ commit }) {
  await instance.get('/representative').then((res) => {
    commit('SET_REPRESENTATIVE', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getRepresentative({ commit }, data) {
  await instance.get('/representative/' + data).then((res) => {
    commit('SET_CURRENT_REPRESENTATIVE', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function updateRepresentative({ commit }, data) {
  await instance.put('/representative/' + data.representativeId, data.payload).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function addRepresentative({ }, data) {
  await instance.post('/representative', data)
}

// eslint-disable-next-line
export async function delRepresentative({ commit }, data) {
  await instance.delete('/representative/' + data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getAllCompanies({ commit }) {
  await instance.get('/company').then((res) => {
    commit('SET_COMPANIES', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getAllOffers({ commit }) {
  await instance.get('/offer').then((res) => {
    commit('SET_OFFERS', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function getAllAppointments({ }) {
  return await instance.get('/appointment')
}

// eslint-disable-next-line
export async function deleteAppointment({ }, id) {
  return await instance.delete(`/appointment/${id}`)
}

// eslint-disable-next-line
export async function addAppointment({ }, appointment) {
  return await instance.post(`/appointment`, appointment)
}

// eslint-disable-next-line
export async function updateCompany({ commit }, data) {
  await instance.put('/company/' + data.studentId, data.payload).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function addCompany({ }, data) {
  await instance.post('/company', data)
}

// eslint-disable-next-line
export async function delCompany({ commit }, data) {
  await instance.delete('/company/' + data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function getCompany({ commit }, data) {
  await instance.get('/company/' + data)
    .then((res) => {
      commit('SET_CURRENT_COMPANY', res.data)
    }).catch((err) => {
      commit("SET_POPUP", {
        text: `Erreur : ${err.response.data.message}`,
        color: "error",
        visible: true,
      });
    })
}

export async function getAllAdmins({ commit }) {
  await instance.get('/admin').then((res) => {
    commit('SET_ADMINS', res.data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function updateAdmin({ commit }, data) {
  await instance.put('/user/' + data.id, data.payload).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line
export async function addAdmin({ }, data) {
  await instance.post('/user', data)
}

// eslint-disable-next-line
export async function delAdmin({ commit }, data) {
  await instance.delete('/user/' + data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line no-unused-vars
export async function uploadFile({ commit }, data) {
  await instance.post('/file/upload', data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line no-unused-vars
export async function downloadFile({ commit }, data) {
  return await instance.post('/file/download', data, { responseType: 'blob' }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

// eslint-disable-next-line no-unused-vars
export async function removeFile({ commit }, data) {
  await instance.post('/file/remove', data).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function login({ commit }, data) {
  await instance.post('/login', data)
    .then(response => {
      if (response.data.error) {
        throw response.data.error
      }

      commit('SET_CURRENT_USER', response.data.me.user)
      let entity
      switch (response.data.me.user.role) {
        case 'representative':
          entity = response.data.me
          delete entity.user
          commit('SET_CURRENT_REPRESENTATIVE', entity)
          break
        case 'student':
          entity = response.data.me
          delete entity.user
          commit('SET_CURRENT_STUDENT', entity)
          break
      }

      commit('SET_TOKEN', response.data.token)
      commit('SET_AUTHENTICATED_STATUS', true)
    })
}

export async function logout({ commit }) {
  commit('SET_CURRENT_USER', {})
  commit('SET_TOKEN', null)
  commit('SET_AUTHENTICATED_STATUS', false)
}

// eslint-disable-next-line
export async function registerOffer({ }, data) {
  await instance.post('/offer', data)
    .then(response => {
      if (response.data.error) {
        throw response.data.error
      }
    })
}

// eslint-disable-next-line
export async function delOffer({ }, data) {
  await instance.delete('/offer/' + data)
}

// eslint-disable-next-line
export async function updateOffer({ }, data) {
  await instance.put('/offer/' + data.id, data).then(response => {
    if (response.data.error) {
      throw response.data.error
    }
  })
}

// eslint-disable-next-line
export async function resetPassword({ }, data) {
  await instance.post('/reset', data)
}

// eslint-disable-next-line
export async function updatePasswordByToken({ }, data) {
  await instance.post('/reset/' + data.token, data)
}

export async function getForumDate({ commit }) {
  await instance.get('/configuration').then((res) => {
    commit('SET_FORUM_DATE', res.data.forumDate)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function getPlanningPublished({ commit }) {
  await instance.get('/configuration').then((res) => {
    commit('SET_PLANNING_PUBLISHED', res.data.showPlanning)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}

export async function setPlanningPublished({ commit }, data) {
  await instance.put('/configuration', data).then(() => {
    commit('SET_PLANNING_PUBLISHED', data)
  }).catch((err) => {
    commit("SET_POPUP", {
      text: `Erreur : ${err.response.data.message}`,
      color: "error",
      visible: true,
    });
  })
}