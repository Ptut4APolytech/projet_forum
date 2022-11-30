<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1 class="primary--text text-h4">Mes offres</h1>
      </v-col>
      <v-col class="d-flex align-center justify-end">
        <v-form @submit.prevent="submit">
          <v-spacer />
          <v-btn color="primary" class="ml-4" @click="openDialogueNew()">
            Créer offre
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="6" id="offerList">
        <OfferList :reload="reload"/>
      </v-col>
      <v-col cols="6" id="offer">
        <OfferContent class="sticky-card"/>
      </v-col>
    </v-row>

    <CreateOfferDialog
        v-if="dialogNew"
        @close="dialogNew = false"
        @reload="reload = true"
    />
  </v-container>
</template>

<script>
import OfferContent from "../../components/company/Offer/OfferContent";
import OfferList from "../../components/company/Offer/OfferList";
import CreateOfferDialog from "../../components/company/Offer/CreateOfferDialog";

export default {
  name: "OfferTable",

  components: {
    CreateOfferDialog,
    OfferContent,
    OfferList,
  },

  data: () => ({
    dialogNew: false,
    windowWidth: window.innerWidth,
    reload: false,
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

  methods: {

    onResize() {
      this.windowWidth = window.innerWidth;
    },

    responsive() {

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
    },

    submit() {},

    openDialogueNew() {
      this.dialogNew = true;
    },
  },
};
</script>

<style scoped>
</style>
