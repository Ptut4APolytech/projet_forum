<template>
  <v-container fluid class="pa-0 main-container">
    <!-- Header avec logo -->
    <div :class="['header primary d-flex justify-center', headerClass]">
      <div :class="['header-logo', logoClass]">
        <v-img contain src="../assets/logo-teameet-title-subtitle.svg"></v-img>
      </div>
    </div>

    <!-- Titre et bouton -->
    <div class="content">
      <div :class="['title', titleClass]">
        <div class="text-h4 text-sm-h3 text-md-h2 text-lg-h1">
          Forum des alternances
        </div>

        <div class="subtitle-1 text-md-h4 text-lg-h3">
          <p v-if="!date">La date sera bientôt definie...</p>
          <template v-else>{{ date }}</template>
        </div>

        <v-btn
          class="tertiary accent--text"
          :x-large="$vuetify.breakpoint.mdAndUp"
          :large="$vuetify.breakpoint.smAndDown"
          to="/login"
          >Accéder au forum</v-btn
        >
      </div>

      <!-- Icône et Maps -->
      <v-row class="where mx-7" justify="center" align="center">
        <v-col class="where-icon col-12 col-md-5 col-lg-4">
          <v-img src="../assets/homepage/where.svg"></v-img>
        </v-col>
        <v-col class="col-12 col-md-7 col-lg-8">
          <iframe
            class="maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5565.1601410605745!2d4.8664330647123!3d45.77960540751548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4ea98de9f04fb%3A0xa34cbe87f6c6b03b!2sPolytech%20Lyon!5e0!3m2!1sfr!2sfr!4v1642421038926!5m2!1sfr!2sfr"
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </v-col>
      </v-row>

      <!-- Horaires et liens -->
      <v-row class="mx-7">
        <v-col class="col-12 col-sm-6">
          <div class="text-h5 text-md-h4">Horaires</div>
          <div
            :class="['text-body-2 text-md-body-1 text-lg-h6', listSpacingClass]"
          >
            <ul>
              <li><div>Le 19/02/2022</div></li>
              <li><div>De 8h00 à 12h00</div></li>
            </ul>
          </div>
        </v-col>
        <v-col class="col-12 col-sm-6 my-2">
          <div class="text-h5 text-md-h4">Plus d'informations</div>

          <div
            :class="['text-body-2 text-md-body-1 text-lg-h6', listSpacingClass]"
          >
            <ul>
              <li>
                La formation en
                <a
                  class="tertiary--text"
                  href="https://polytech.univ-lyon1.fr/formation/alternance"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  alternance
                </a>
              </li>
              <li>
                La formation
                <a
                  class="tertiary--text"
                  href="https://polytech.univ-lyon1.fr/formation/cycle-ingenieur/informatique/informatique-par-cursus-classique"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  d'ingénieur informatique
                </a>
              </li>
              <li>
                Informations
                <a
                  class="tertiary--text"
                  href="https://polytech.univ-lyon1.fr/etudiant"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  supplémentaires
                </a>
              </li>
            </ul>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
// import { getConfiguration } from "../services/api";
import { mapGetters } from "vuex";

export default {
  name: "Home",

  data: () => ({
    date: null,
  }),

  created() {
    this.updateDate(this.forumDate);
  },

  methods: {

    // Met à jour la date sur le template
    updateDate(newDate) {

      if (newDate) {

        const forumDate = new Date(newDate);
        // Récupération du jour
        const day = forumDate.getDay();
        // Récupération du mois avec la première lettre en majuscule
        let month = forumDate.toLocaleString("default", { month: "long" });
        month = month.charAt(0).toUpperCase() + month.slice(1);
        // Récupération de l'année
        const year = forumDate.getFullYear();

        this.date = `${day} ${month} ${year}`;
      }
    },
  },

  watch: {
    // Surveille les changements de valeur de la propriété search
    forumDate(newValue) {
      this.updateDate(newValue);
    },
  },

  computed: {
    ...mapGetters({
      forumDate: "GET_FORUM_DATE",
    }),

    headerClass() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return "header-lgAndUp";
      } else return `header-${this.$vuetify.breakpoint.name}`;
    },

    logoClass() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return "logo-lgAndUp";
      } else return `logo-${this.$vuetify.breakpoint.name}`;
    },

    titleClass() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return "title-lgAndUp";
      } else return `title-${this.$vuetify.breakpoint.name}`;
    },

    listSpacingClass() {
      if (this.$vuetify.breakpoint.smAndDown) {
        return "list-spacing-smAndDown";
      } else if (this.$vuetify.breakpoint.lgAndUp) {
        return "list-spacing-lgAndUp";
      } else return `list-spacing-${this.$vuetify.breakpoint.name}`;
    },
  },
};
</script>

<style scoped>
:root {
  --main-font-size: 20px;
}

#main-container {
  font-size: var(--main-font-size);
}

.header-xs {
  height: calc(10em / 1.5);
  margin-bottom: calc(10em);
}
.header-sm {
  height: calc(12em / 1.5);
  margin-bottom: calc(12em);
}
.header-md {
  height: calc(15em / 1.5);
  margin-bottom: calc(15em);
}
.header-lgAndUp {
  height: calc(16em / 1.5);
  margin-bottom: calc(15em);
}

/* LOGO */
.header-logo {
  position: absolute;
  background-color: var(--v-accent-base); /* Accent color */
  border-radius: 30%;
  padding: 1em;
}

.logo-xs {
  width: 10em;
  transform: translateY(3em);
}

.logo-sm {
  width: 12em;
  transform: translateY(3.5em);
}

.logo-md {
  width: 15em;
  transform: translateY(4.5em);
}

.logo-lgAndUp {
  width: 16em;
  transform: translateY(4.7em);
}

/* END LOGO */

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin-top: 30px;
}

/* TITLE */
.title {
  font-size: var(--main-font-size);
}

.title-xs > * {
  margin-bottom: 5px;
}

.title-sm > * {
  margin-bottom: 10px;
}

.title-md > * {
  margin-bottom: 20px;
}

.title-lgAndUp > * {
  margin-bottom: 25px;
}
/* END TITLE */

/* WHERE SECTION */

.where-icon {
  min-width: 20em;
  max-width: 30em;
  margin-top: 30px;
  margin-bottom: 30px;
}

.maps {
  width: 100%;
  height: 60vh;
  border: 0;
}

/* END WHERE SECTION */

/* MORE INFO */

.list-spacing-smAndDown > ul {
  margin-top: 10px;
}

.list-spacing-md > ul {
  margin-top: 15px;
}

.list-spacing-lgAndUp > ul {
  margin-top: 25px;
}

.list-spacing-smAndDown > ul > li + li {
  margin-top: 10px;
}

.list-spacing-md > ul > li + li {
  margin-top: 12px;
}

.list-spacing-lgAndUp > ul > li + li {
  margin-top: 15px;
}

ul {
  list-style-type: none;
  padding-left: 0px !important;
}
</style>
