<template>
  <div>
    <v-card v-show="isOfferId" class="mx-1" outlined :loading="loadingDatas">
      <!-- Contenu vide en cas de chargement de données -->
      <div v-if="loadingDatas">
        <p></p>
      </div>

      <div v-else>
        <!-- Header de l'offre -->
        <div class="header d-flex flex-column justify-space-between">
          <div class="d-flex justify-space-between align-top">
            <div>
              <v-card-title>
                {{ offer.title }}
              </v-card-title>
              <v-card-subtitle> {{ offer.company.name }}</v-card-subtitle>
            </div>

            <v-btn class="pt-5 pr-3" plain x-small color="dark" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Valeur des boutons pour postuler -->
          <v-card-actions v-if="user.role === 'student'">
            <template v-if="hasAlreadyApplied">
              <v-btn disabled>
                <v-icon class="mr-2">mdi-check</v-icon>
                Postulé
              </v-btn>

              <v-btn v-if="loadingRegister" color="error" outlined>
                <v-progress-circular
                  class="mr-1"
                  indeterminate
                  :size="20"
                ></v-progress-circular>
                Annulation
              </v-btn>
              <v-btn
                v-else
                outlined
                color="error"
                @click="unregisterOffer(offer.id)"
              >
                <v-icon class="mr-2">mdi-close</v-icon>
                Annuler
              </v-btn>
            </template>
            <template v-else>
              <v-btn v-if="loadingRegister" color="primary">
                <v-progress-circular
                  class="mr-1"
                  indeterminate
                  :size="20"
                ></v-progress-circular>
                Postulation
              </v-btn>
              <v-btn v-else color="primary" @click="registerOffer(offer.id)">
                Postuler
              </v-btn>
            </template>
          </v-card-actions>
          <v-card-actions v-if="user.role === 'admin'">
            <v-btn
              color="success"
              v-if="
                offer.status === 'waiting' || offer.status === 'notValidated'
              "
              @click="validateOffer"
            >
              Valider
            </v-btn>
            <v-btn v-else disabled>
              <v-icon class="mr-2">mdi-check</v-icon>
              Validé
            </v-btn>
            <v-btn
              color="error"
              v-if="offer.status === 'waiting'"
              @click="showReasonDialog = true"
            >
              Refuser
            </v-btn>
          </v-card-actions>
        </div>

        <div class="content">
          <v-card-text>
            {{ offer.content }}
          </v-card-text>

          <!-- Boutons de téléchargement des pièces jointes -->
          <div v-if="offer.files.length">
            <v-card-title class="pb-0">Pièce(s) jointe(s)</v-card-title>
            <v-divider class="mx-4" />
            <v-card-actions class="mx-2">
              <v-btn
                v-for="file of offer.files"
                :key="file"
                @click="downloadFile(file)"
                color="secondary"
                outlined
              >
                {{ getFilename(file) }}
                <v-icon right> mdi-download</v-icon>
              </v-btn>
            </v-card-actions>
          </div>
        </div>
      </div>
    </v-card>
    <v-dialog
      v-model="showReasonDialog"
      max-width="600px"
      persistent
      scrollable
    >
      <v-card>
        <div :class="[`d-flex justify-space-between align-top error`]">
          <v-card-title :class="[`white--text`]"> Motif du refus </v-card-title>

          <v-btn
            class="mr-2 mt-3"
            plain
            x-small
            color="white"
            @click="showReasonDialog = false"
          >
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-textarea outlined v-model="reason" class="ma-3" label="Motif">
        </v-textarea>

        <v-divider />
        <v-card-actions>
          <v-spacer />
          <!-- Cancel button -->
          <v-btn outlined color="error" @click="showReasonDialog = false">
            Annuler
          </v-btn>
          <!-- Confirm button -->
          <v-btn class="error" @click="invalidateOffer"> Envoyer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { getOffer, downloadFile } from "../../../services/api";
import { saveAs } from "file-saver";
import { mapGetters } from "vuex";

const path = require("path");

export default {
  name: "Offer",
  data: () => ({
    loadingDatas: true,
    loadingRegister: false,
    offer: null,
    isOfferId: false,
    showReasonDialog: false,
    reason: "",
  }),
  created() {
    this.hasQueryOfferId();
  },
  watch: {
    "$route.query.offerId": function () {
      this.hasQueryOfferId();
    },
  },
  computed: {
    ...mapGetters({
      currentStudent: "GET_CURRENT_STUDENT",
      currentUser: "GET_CURRENT_USER",
      user: "GET_CURRENT_USER",
    }),
    // Vérifie si l'étudiant courant a postulé à l'offre
    hasAlreadyApplied() {
      return this.currentUser &&
        this.currentUser.role === "student" &&
        this.currentStudent.orderedOffers.includes(this.offer.id)
        ? true
        : false;
    },
  },
  methods: {
    // Récupère une offre dans l'API
    getOffer() {
      const offerId = this.$route.query.offerId;
      this.loadingDatas = true;

      getOffer(offerId)
        .then((res) => {
          this.offer = res.data;
          this.loadingDatas = false;
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },
    // Téléchargement d'un fichier
    downloadFile(filePath) {
      downloadFile(filePath)
        .then((res) => {
          saveAs(res.data, path.basename(filePath));
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },
    // Vérifie si un query param est dans l'URL
    hasQueryOfferId() {
      if (this.$route.query.offerId) {
        this.isOfferId = true;
        this.getOffer();
      } else {
        this.isOfferId = false;
      }
    },
    // Change les queryParam pour fermer la fenêtre
    close() {
      let query = Object.assign({}, this.$route.query);
      delete query.offerId;
      this.$emit("close");
      this.$router.replace({ query });
    },
    // Retourne le nom d'un fichier selon un chemin
    getFilename(filePath) {
      return path.basename(filePath);
    },
    registerOffer(offerId) {
      this.loadingRegister = true;

      let studentOffers = [...this.currentStudent.orderedOffers];
      studentOffers.push(offerId);

      this.$store
        .dispatch("updateStudent", {
          id: this.currentStudent.id,
          orderedOffers: studentOffers,
        })
        .then(() => {
          this.loadingRegister = false;
        });
    },
    validateOffer() {
      let payload = {
        id: this.offer.id,
        status: "validated",
      };
      this.$store
        .dispatch("updateOffer", payload)
        .then(() => {
          this.getOffer();
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
          this.$emit("update");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        });
    },
    invalidateOffer() {
      this.showReasonDialog = false;
      let payload = {
        id: this.offer.id,
        status: "notValidated",
        reason: this.reason,
      };
      this.$store
        .dispatch("updateOffer", payload)
        .then(() => {
          this.getOffer();
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
          this.$emit("update");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        });
    },
    unregisterOffer(offerId) {
      this.loadingRegister = true;

      let studentOffers = [...this.currentStudent.orderedOffers];
      studentOffers.splice(studentOffers.indexOf(offerId), 1);

      this.$store
        .dispatch("updateStudent", {
          id: this.currentStudent.id,
          orderedOffers: studentOffers,
        })
        .then(() => {
          this.loadingRegister = false;
        });
    },
  },
};
</script>

<style scoped>
.header {
  min-height: 150px;
  border-bottom: 1px solid rgb(170, 170, 170);
  box-shadow: 0 6px 6px -6px grey;
}

.content {
  max-height: calc(100vh - 250px);
  white-space: pre-line;
  overflow: auto;
  overflow-x: hidden;
}
</style>