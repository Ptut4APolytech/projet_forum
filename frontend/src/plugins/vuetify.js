import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import axios from 'axios'

// axios.defaults.baseURL = 'http://localhost:8080/v1/'
axios.defaults.baseURL = 'https://forum-polytech-appr-bkd.univ-lyon1.fr/v1/'

Vue.prototype.$axios = axios
Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: { customProperties: true },
    themes: {
      light: {
        primary: '#005672', //Dark blue
        secondary: '#0085a0', //Light blue
        tertiary: "#FFC43D", //Orange
        accent: '#FBFCF3', //Creamy white
        error: '#BB1117', //Red
        success: '#6CAE32' //Green
      }
    }
  }
});
