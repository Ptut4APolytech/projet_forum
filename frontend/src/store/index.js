import Vue from 'vue'
import Vuex from 'vuex'

import * as mutations from './mutations'
import * as actions from './actions'
import state from './state'
import * as getters from './getters'
import createPersistedState from 'vuex-persistedstate'
import VueSession from "vue-session";

Vue.use(Vuex)
Vue.use(VueSession)

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  plugins: [createPersistedState()]
})
