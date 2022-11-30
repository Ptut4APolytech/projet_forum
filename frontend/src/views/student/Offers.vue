<template>
  <v-container fluid>
    <h1 class="primary--text text-h4 mb-3">Liste des offres</h1>
    <template v-if="student.status == 'validated'">
      <v-row>
        <v-col id="offerList" cols="6">
          <OfferSearch @submitted="submittedSearch" class="mb-2" />
          <OffersList :search="search" />
        </v-col>
        <v-col id="offer" cols="6">
          <Offer class="sticky-card" />
        </v-col>
      </v-row>
    </template>
    <v-card-title v-else>
      Vous n'avez pas encore accès aux offres, votre statut n'est pas validé
    </v-card-title>
  </v-container>
</template>

<script>
import OffersList from "../../components/student/offers/OffersList.vue";
import Offer from "../../components/student/offers/Offer.vue";
import OfferSearch from "../../components/student/offers/OfferSearch.vue";
import { mapGetters } from "vuex";

export default {
  name: "Offers",
  components: { OffersList, Offer, OfferSearch },

  data: () => ({
    search: [],
    windowWidth: window.innerWidth,
  }),

  watch: {
    windowWidth() {
      this.responsive();
    },

    "$route.query.offerId": function () {
      this.responsive();
    },
  },

  mounted() {
    this.responsive();
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  computed: {
    ...mapGetters({
      student: "GET_CURRENT_STUDENT"
    }),
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    responsive() {

      // Ajout du responsive seulement si l'affichage des offres est possible
      if (this.student.status == "validated") {
        let domOfferList = document.getElementById("offerList");
        let domOffer = document.getElementById("offer");

        if (this.windowWidth < 700) {
          // On supprime la limite de colonnes pour la version mobile
          domOfferList.classList.remove("col-6");
          domOffer.classList.remove("col-6");

          const offerId = this.$route.query.offerId;

          if (offerId) {
            domOfferList.hidden = true;
            domOffer.hidden = false;
          } else {
            domOfferList.hidden = false;
            domOffer.hidden = true;
          }
        } else {
          // On remet la limite de colonnes pour la version mobile
          domOfferList.classList.add("col-6");
          domOffer.classList.add("col-6");

          domOfferList.hidden = false;
          domOffer.hidden = false;
        }
      }
    },

    submittedSearch(value) {
      let query = Object.assign({}, this.$route.query);
      delete query.offerId;
      this.$router.replace({ query });
      this.search = value;
    },
  },
};
</script>

<style scoped>

.v-card__title {
  word-break: normal;
}

</style>