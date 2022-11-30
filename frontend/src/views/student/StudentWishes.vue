<template>
  <v-container fluid>
    <h1 class="primary--text text-h4 mb-3">Liste des voeux</h1>
    <v-row>
      <v-col id="wishList" cols="6">
        <WishList
          @tempWishOrder="sendWishOrder"
          :offerToAdd="offerToAdd"
          :offerToDelete="offerToDelete"
        />
      </v-col>
      <v-col id="offer" cols="6">
        <Wish
          class="sticky-card"
          :orderedOfferIds="offerIds"
          @registeredOfferId="addOffer"
          @unregisteredOfferId="deleteOffer"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import WishList from "../../components/student/wish/WishList.vue";
import Wish from "../../components/student/wish/Wish.vue";

export default {
  name: "StudentWishes",
  components: { WishList, Wish },

  data: () => ({
    windowWidth: window.innerWidth,

    offerIds: [],
    offerToAdd: null,
    offerToDelete: null,
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
      let domWishList = document.getElementById("wishList");
      let domOffer = document.getElementById("offer");

      if (this.windowWidth < 700) {
        // On supprime la limite de colonnes pour la version mobile
        domWishList.classList.remove("col-6");
        domOffer.classList.remove("col-6");

        const offerId = this.$route.query.offerId;

        if (offerId) {
          domWishList.hidden = true;
          domOffer.hidden = false;
        } else {
          domWishList.hidden = false;
          domOffer.hidden = true;
        }
      } else {
        // On remet la limite de colonnes pour la version mobile
        domWishList.classList.add("col-6");
        domOffer.classList.add("col-6");

        domWishList.hidden = false;
        domOffer.hidden = false;
      }
    },

    sendWishOrder(value) {
      this.offerIds = [...value];
      this.offerToAdd = null;
      this.offerToDelete = null;
    },

    addOffer(value) {
      this.offerToAdd = value;
      this.offerToDelete = null;
    },

    deleteOffer(value) {
      this.offerToDelete = value;
      this.offerToAdd = null;
    },
  },
};
</script>