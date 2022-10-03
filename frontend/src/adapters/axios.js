import axios from "axios";
import router from "../router/index";
import store from "../store/index";

// Instance axios globale
const instance = axios.create({
    baseURL: (process.env.ENVIRONMENT === "dev") ? 'http://localhost:8080/v1/' : 'https://forum-polytech-appr-bkd.univ-lyon1.fr/v1/',
    withCredentials: true,
});

// Ajout du bearer si un token existe
instance.interceptors.request.use(request => {

    const token = window.localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

// Interception des requêtes
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        // On vérifie si la requête est un accès non-autorisé
        if (error.response && (error.response.status == 401 || error.response.status == 403)) {


            // Suppression d'éléments du store
            store.dispatch('logout');

            // Redirection vers la page de login
            if (router.currentRoute.path != '/login') {
                router.go("/");
            }
        }

        return Promise.reject(error);
    }
)

export default instance;
