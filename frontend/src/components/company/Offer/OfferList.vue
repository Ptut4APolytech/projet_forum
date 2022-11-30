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
      <div class="header d-flex flex-column justify-space-between">
        <div class="d-flex justify-space-between align-top">
          <div>
            <v-card-title>{{ offer.title }}</v-card-title>

            <v-card-subtitle> {{ offer.company.name }}</v-card-subtitle>
          </div>

          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click.stop="openDialogEdit(offer.id)">
                <v-list-item-title>
                  <v-icon> mdi-pencil </v-icon>
                  Editer
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click.stop="openDialogDelete(offer.id)">
                <v-list-item-title class="error--text">
                  <v-icon color="error"> mdi-delete </v-icon>
                  Supprimer
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <v-divider class="mx-4" />

      <div class="d-flex justify-space-between align-center mr-2 ml-1">
        <v-card-text class="pa-2">
          <v-chip
            class="ma-1"
            v-for="tag in offer.tags"
            :key="tag"
            color="primary"
            outlined
          >
            {{ tag }}
          </v-chip>
        </v-card-text>
        <div>
          <span class="pa-2 text-no-wrap">
            <v-chip
              :class="{
                success: offer.status == 'validated',
                error: offer.status == 'notValidated',
                tertiary: offer.status == 'waiting',
              }"
            >
              <template v-if="offer.status == 'validated'">
                Offre validée
              </template>
              <template v-else-if="offer.status == 'notValidated'">
                Offre invalide
              </template>
              <template v-else> En attente </template>
            </v-chip>
          </span>
        </div>
      </div>
    </v-card>

    <!-- Dialog part-->
    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer cette offre ?"
      color="error"
      @confirm="deleteOffer()"
    />

    <EditOfferDialog
      v-if="dialogEdit"
      :id="editedId"
      @close="closeEditDialog"
    />
  </div>
</template>

<script>
import { delOffer, getOfferByCompanyId } from "../../../services/api";
import ConfirmDialog from "../../ConfirmDialog";
import EditOfferDialog from "./EditOfferDialog";
import { mapGetters } from "vuex";

export default {
  name: "OfferList",

  components: {
    EditOfferDialog,
    ConfirmDialog,
  },

  props: ["reload"],

  watch: {
    reload(newValue) {
      if (newValue) {
        this.getOfferByCompanyId();
        this.reload = false;
      }
    },

    "$route.query.offerId": function () {
      this.offerId = this.$route.query.offerId
        ? this.$route.query.offerId
        : null;
    },
  },

  data: () => ({
    loadingDatas: true,
    offers: [],
    offerId: null,
    form: {
      search: "",
    },

    dialogDelete: false,
    dialogEdit: false,
    editedId: 0,
    editedItem: {},
  }),

  created() {
    this.getOfferByCompanyId();
    this.offerId = this.$route.query.offerId ? this.$route.query.offerId : null;
  },

  computed: {
    ...mapGetters({
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
    }),
  },

  methods: {
    selectOffer(offerId) {
      this.$router.replace({ query: { offerId: offerId } });
    },

    getOfferByCompanyId() {
      this.loadingDatas = true;
      getOfferByCompanyId(this.currentRepresentative.companyId)
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
        });
    },

    deleteOffer() {
      delOffer(this.editedId)
        .then(() => {
          this.getOfferByCompanyId();

          this.$store.commit("SET_POPUP", {
            text: `Suppression réussie !`,
            color: "success",
            visible: true,
          });

          let query = Object.assign({}, this.$route.query);
          delete query.offerId;
          this.$router.replace({ query });
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    openDialogDelete(id) {
      this.editedId = id;
      this.dialogDelete = true;
    },

    openDialogEdit(id) {
      this.editedId = id;
      this.dialogEdit = true;
    },

    closeEditDialog(reloadEvent) {
      this.reload = reloadEvent;
      this.dialogEdit = false;
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
