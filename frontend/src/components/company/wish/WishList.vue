<template>
  <div v-if="loadingOffers" class="d-flex justify-center mt-5">
    <v-progress-circular
      indeterminate
      :size="60"
      color="primary"
    ></v-progress-circular>
  </div>
  <div v-else>
    <div v-if="offers.length == 0">
      <p>Aucun voeu trouvé, créez ou attendez la validation de vos offres pour continuer</p>
    </div>

    <div v-else>
      <v-select
        @change="getOfferStudents"
        v-model="offerId"
        :items="offers"
        item-text="title"
        item-value="id"
        label="Sélectionnez une offre"
        background-color="white"
        filled
        outlined
        dense
        single-line
      ></v-select>

      <div v-show="offerId">
        <div v-if="loadingStudents" class="d-flex justify-center mt-5">
          <v-progress-circular
            indeterminate
            :size="60"
            color="primary"
          ></v-progress-circular>
        </div>

        <v-card v-else class="px-0" outlined>
          <v-card-title
            v-if="originalOrder.length == 0 && tempOrder.length == 0"
          >
            Aucun étudiant trouvé
          </v-card-title>

          <div v-else class="d-flex justify-space-between align-center">
            <v-tooltip color="secondary" top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon> mdi-help-circle </v-icon>
                </v-btn>
              </template>

              <span
                >Ordonnez vos étudiants en utilisant la méthode du
                "glisser-déposer"</span
              >
            </v-tooltip>

            <v-card-actions>
              <v-btn v-if="loadingOrder" class="primary white--text">
                <v-progress-circular
                  class="mr-1"
                  indeterminate
                  :size="20"
                  color="white"
                ></v-progress-circular>
                Sauvegarde
              </v-btn>
              <v-btn
                v-else
                color="primary"
                @click="validateOrder"
                :disabled="!snackbarVisible"
              >
                Sauvegarder
              </v-btn>
              <v-btn
                outlined
                color="primary"
                @click="resetOrder"
                :disabled="loadingOrder"
              >
                Réinitialiser
              </v-btn>
            </v-card-actions>
          </div>

          <draggable
            v-model="tempOrder"
            group="students"
            v-bind="dragOptions"
            @start="drag = true"
            @end="drag = false"
            class="mx-2"
          >
            <transition-group type="transition">
              <v-card
                outlined
                class="my-2"
                v-for="(student, index) in tempOrder"
                :class="(index === 0 ? 'mt-0' : '') + ' ' + (studentId === student.id ? 'v-btn--active' : '')"
                :key="student.id"
                hover
                @click="selectStudent(student.id)"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon> mdi-drag </v-icon>
                    <div>
                      <v-card-title class="py-3"
                        >{{ student.user.firstname }}
                        {{ student.user.lastname }}</v-card-title
                      >
                    </div>
                  </div>
                  <div
                    class="px-2 mr-2 grey white--text rounded-circle order-chip"
                  >
                    {{ index + 1 }}
                  </div>
                </div>
              </v-card>
            </transition-group>
          </draggable>
        </v-card>
      </div>

      <v-snackbar
        v-model="snackbarVisible"
        timeout="-1"
        color="warning"
        top
        dense
      >
        <v-icon class="pr-1">mdi-alert-circle-outline</v-icon>
        Des modifications n'ont pas été sauvegardées
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import {
  getOfferByCompanyId,
  getOfferStudents,
  updateOffer,
} from "../../../services/api";
import { mapGetters } from "vuex";
import draggable from "vuedraggable";

export default {
  name: "WishList",

  components: { draggable },

  props: ["studentToAdd", "studentToDelete"],

  data: () => ({
    loadingOffers: true,
    loadingStudents: true,
    loadingOrder: false,
    offers: [],
    offerId: null,

    selectedOffer: null,
    students: [],
    studentIds: [],
    studentId: null,
    tempOrder: [],
    originalOrder: [],
    snackbarVisible: false,

    dragOptions: {
      animation: 200,
      delay: 100, // time in milliseconds to define when the sorting should start
      delayOnTouchOnly: true, // only delay if user is using touch
    },
  }),

  watch: {
    // Conservation de studentId si contenu dans la route
    "$route.query.studentId": function () {
      this.studentId = this.$route.query.studentId
        ? this.$route.query.studentId
        : null;
    },

    studentToAdd(newStudentId) {
      if (newStudentId) {
        // Récupération de l'offre selon son identifiant
        let studentToAdd = null;
        for (let student of this.students) {
          if (student.id == newStudentId) {
            studentToAdd = student;
          }
        }

        // Ajout de l'offre dans la liste de voeux temporaire
        this.tempOrder.push(studentToAdd);
      }
    },

    studentToDelete(newStudentId) {
      if (newStudentId) {
        // Filtrage de tempOrder
        this.tempOrder = this.tempOrder.filter(function (student) {
          return student.id != newStudentId;
        });
      }
    },

    tempOrder() {
      this.snackbarVisible = this.differentOrder();
    },
  },

  created() {
    this.getOfferByCompanyId();

    // Suppression de queryparams
    let query = Object.assign({}, this.$route.query);
    if (Object.keys(query).length > 0) {
      this.$router.replace({ query: {} });
    }
  },

  computed: {
    ...mapGetters({
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
    }),
  },

  methods: {
    getOfferByCompanyId() {
      this.loadingOffers = true;
      getOfferByCompanyId(this.currentRepresentative.companyId, 'validated')
        .then((res) => {
          this.offers = res.data;
          if (this.offers.length === 1) {
            this.offerId = this.offers[0].id
            this.getOfferStudents()
          }
          this.loadingOffers = false;
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    // Récupère une offre dans l'API
    getOfferStudents() {
      this.loadingStudents = true;

      getOfferStudents(this.offerId)
        .then((res) => {
          this.students = res.data;
          this.tempOrder = [...res.data];
          this.originalOrder = [...res.data];

          this.studentIds = [];
          for (let student of this.students) {
            this.studentIds.push(student.id);
          }
          this.$emit("tempWishOrder", this.studentIds);

          this.loadingStudents = false;
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    selectStudent(studentId) {
      this.$router.replace({ query: { studentId: studentId } });
    },

    resetOrder() {
      this.tempOrder = [...this.originalOrder];
      this.$emit("tempWishOrder", this.studentIds);
    },

    validateOrder() {
      this.loadingOrder = true;
      this.snackbarVisible = false;

      // Création d'un tableau d'ids étudiant pour envoi API
      let studentIds = [];
      for (let student of this.tempOrder) {
        studentIds.push(student.id);
      }

      // Mise à jour de l'étudiant dans le store
      updateOffer(this.offerId, { orderedStudents: studentIds })
        .then(() => {
          this.originalOrder = [...this.tempOrder];
          this.loadingOrder = false;

          this.studentIds = studentIds;

          this.$emit("tempWishOrder", this.studentIds);

          this.$store.commit("SET_POPUP", {
            text: `Mise à jour réussie !`,
            color: "success",
            visible: true,
          });
        })
        .catch((error) => {

          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${error.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    /**
     * Compare l'ordre de la liste temporaire et la liste originale
     */
    differentOrder() {
      if (this.tempOrder.length != this.originalOrder.length) {
        return true;
      }

      for (let i = 0; i < this.tempOrder.length; i++) {
        if (this.originalOrder[i].id != this.tempOrder[i].id) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>

<style scoped>
.v-btn--active,
.v-btn--active:before {
  background-color: rgba(0, 0, 0, 0.2) !important;
  opacity: none !important;
}

.v-card--hover:hover,
.v-card--hover:focus {
  box-shadow: none !important;
  background-color: rgba(0, 0, 0, 0.07);
  opacity: none !important;
  transition: background-color 100ms;
}
</style>
