<template>
  <div v-if="loadingDatas" class="d-flex justify-center mt-5">
    <v-progress-circular
      indeterminate
      :size="60"
      color="primary"
    ></v-progress-circular>
  </div>
  <div v-else>
    <v-card-title v-if="offers.length == 0">
      Aucune offre trouvée
    </v-card-title>
    <v-card
      v-else
      outlined
      class="mb-3"
      v-for="offer in offers"
      :key="offer.id"
      @click="selectOffer(offer.id)"
      :class="{ 'v-btn--active': offerId == offer.id }"
      hover
    >
      <v-card-title>{{ offer.title }}</v-card-title>

      <v-card-subtitle> {{ offer.company.name }} </v-card-subtitle>

      <v-divider class="mx-4"></v-divider>

      <div class="d-flex justify-space-between align-center mr-2 ml-1">
        <v-card-text class="pa-2 mr-2 ml-1">
          <v-chip
            v-for="tag in offer.tags"
            :key="tag"
            class="ma-1"
            color="primary"
            outlined
          >
            {{ tag }}
          </v-chip>
        </v-card-text>

        <div v-if="hasApplied(offer.id)">
          <span class="pa-2 text-no-wrap">
            <v-chip class="primary"> Postulé </v-chip>
          </span>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { searchOffers } from "../../../services/api";
import { mapGetters } from "vuex";

export default {
  name: "OffersList",

  props: ["search"],

  data: () => ({
    loadingDatas: true,
    offers: [],
    offerId: null,
  }),

  watch: {
    // Surveille les changements de valeur de la propriété search
    search(newValue) {
      if (this.search.length) {
        this.searchOffers(newValue);
      } else {
        this.searchOffers();
      }
    },
    "$route.query.offerId": function () {
      this.offerId = this.getQueryOfferId();
    },
  },

  created() {
    this.searchOffers();
    this.offerId = this.getQueryOfferId();
  },

  computed: {
    ...mapGetters({
      currentStudent: "GET_CURRENT_STUDENT",
    }),
  },

  methods: {
    // Modification de la route lorsqu'une card est sélectionnée
    selectOffer(offerId) {
      this.$router.replace({ query: { offerId: offerId } });
    },

    // Appel à l'API
    searchOffers(search = []) {
      this.loadingDatas = true;

      let lastSearch = [
        ...search,
        { path: "status", operator: "==", value: "validated" },
      ];

      searchOffers(lastSearch)
        .then((res) => {
          this.offers = res.data;
          this.loadingDatas = false;

          if (this.offers[0] && window.innerWidth >= 700) {
            let query = Object.assign({}, this.$route.query);
            query.offerId = this.offers[0].id;
            this.$router.replace({ query });
          }
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
          this.loadingDatas = false;
          this.offers = [];
        });
    },

    getQueryOfferId() {
      return this.$route.query.offerId ? this.$route.query.offerId : null;
    },

    hasApplied(offerId) {
      return this.currentStudent.orderedOffers.includes(offerId);
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

.v-chip.v-chip--outlined.v-chip.v-chip {
  background-color: white !important;
}
</style>
