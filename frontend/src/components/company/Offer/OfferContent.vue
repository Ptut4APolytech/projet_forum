<template>
  <div>
    <v-card
    v-show="isOfferId"
    class="ml-1 mr-1"
    outlined
    :loading="loadingDatas"
  >
    <!-- Contenu vide en cas de chargement de données -->
    <div v-if="loadingDatas">
      <p></p>
    </div>

    <!-- Si la page est fini de charger les données -->
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
              <v-icon right> mdi-download </v-icon>
            </v-btn>
          </v-card-actions>
        </div>
      </div>
    </div>
  </v-card>
  </div>
</template>

<script>
import { getOffer, downloadFile } from "../../../services/api";
import { saveAs } from "file-saver";
import path from "path";

export default {
  name: "OfferContent",

  data: () => ({
    loadingDatas: true,
    offer: null,
    isOfferId: false,
  }),

  created() {
    this.hasQueryOfferId();
  },

  watch: {
    "$route.query.offerId": function () {
      this.hasQueryOfferId();
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

    // Retourne le nom d'un fichier selon un chemin
    getFilename(filePath) {
      return path.basename(filePath);
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

    close() {
      let query = Object.assign({}, this.$route.query);
      delete query.offerId;
      this.$router.replace({ query });
    },
  },
};
</script>

<style scoped>
.header {
  min-height: 100px;
  border-bottom: 1px solid rgb(170, 170, 170);
  box-shadow: 0 6px 6px -6px grey;
}
.content {
  max-height: calc(100vh - 250px);
  white-space: pre-wrap;
  overflow: auto;
  overflow-x: hidden;
}
</style>
