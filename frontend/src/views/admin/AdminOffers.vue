<template>
  <v-container fluid>
    <div class="primary--text text-h4 mb-3">Gestion des offres</div>
      <v-card class="mx-9 mt-2 px-0">
        <v-row class="ma-0 d-flex justify-end py-1 pr-1">
          <v-text-field
              style="max-width: 40vw"
              filled
              dense
              v-model="search"
              append-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
              outlined
          ></v-text-field>
        </v-row>
        <v-card class="px-0 elevation-0">
        <div>
          <v-data-table
            :ref="tableRef"
            :headers="headers"
            :items="sortedOffers"
            class="elevation-1"
            :items-per-page="15"
            :loading="loadingDatas"
            :search="search"
            loading-text="Chargement des données.."
            no-data-text="Aucune offre existante"
            no-results-text="Aucune offre trouvée"
            :footer-props="{
               'items-per-page-text':'Offres par page'
            }"
          >
            <template v-slot:item.status="{ item }">
              <v-row justify="start" style="padding-left: 10px; width: 20vw">
                <StatusSelect
                    class=""
                    :status="item.status"
                    @change="(status) => updateOffer(item, { status })"
                    style="width: 15vw; padding-right: 15px"
                />
              </v-row>
            </template>
            <template v-slot:item.remove="{ item }">
              <v-icon color="error" @click="openDialogDelete(item.id)"
              >mdi-delete</v-icon
              >
            </template>
            <template v-slot:item.edit="{ item }">
              <v-icon @click="editOffer(item)">mdi-eye</v-icon>
            </template>
            <template v-slot:footer.page-text="data">
              {{data.pageStart}}-{{data.pageStop}} sur {{data.itemsLength}}
            </template>
          </v-data-table>

          <v-dialog
              v-model="showOfferContent"
              max-width="600px"
              content-class="pa-2 paddingDialog"
          >
            <offer class="pa-0" @close="showOfferContent = false" @update="updateOfferFromDB"></offer>
          </v-dialog>
          <!-- Dialog part-->
          <ConfirmDialog
              v-model="dialogDelete"
              text="Supprimer cette offre ?"
              color="error"
              @confirm="deleteOffer(idToDelete)"
          />
        </div>
      </v-card>
    </v-card>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import StatusSelect from '../../components/admin/StatusSelect'
import Offer from '../../components/student/offers/Offer'
import ConfirmDialog from '../../components/ConfirmDialog'

export default {
  name: 'Admin',
  components: { StatusSelect, ConfirmDialog, Offer },
  data: () => ({
    step: 0,
    search: '',
    tableRef: 0,
    renderImg: 0,
    headers: [
      { text: "Entreprise", value: "company.name" },
      { text: "Description", value: "title" },
      { text: "Statut", value: "status" },
      { text: "Voir", value: "edit", align: "center", sortable: false },
      { text: "Supprimer", value: "remove", align: "center", sortable: false },
    ],
    loadingDatas: true,
    imgs: {},
    nbDays: {},
    showOfferContent: false,
    dialogDelete: false,
    idToDelete: null,
  }),
  computed: {
    ...mapGetters({
      storeOffers: "GET_OFFERS",
    }),
    sortedOffers () {
      return this.loadingDatas ? [] : this.storeOffers;
    },
  },
  created() {
    this.updateOfferFromDB();
  },
  methods: {
    updateOfferFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllOffers").then(() => {
        if (this.$route.query.search) {
          this.search = this.$route.query.search
        }
        this.loadingDatas = false;
      });
    },
    deleteOffer(offerId) {
      if (offerId) {
        this.idToDelete = null;
        this.dialogDelete = false;

        this.loadingDatas = true;
        this.$store
            .dispatch("delOffer", offerId)
            .then(() => {

              this.$store.commit("SET_POPUP", {
                text: `Suppression réussie !`,
                color: "success",
                visible: true,
              });

              this.updateOfferFromDB();
            })
            .catch((error) => {
              this.$store.commit("SET_POPUP", {
                text: `Suppression échouée : ${error}`,
                color: "error",
                visible: true,
              });
            });
      }
    },
    editOffer(offer) {
      this.$router.replace({ query: { offerId: offer.id } })
      this.showOfferContent = true
    },
    updateOffer(offer, payload) {
      payload.id = offer.id;
      this.loadingDatas = true;
      this.$store.dispatch("updateOffer", payload).then(() => {
        this.updateOfferFromDB();
      });
    },

    openDialogDelete(offerId) {
      this.idToDelete = offerId;
      this.dialogDelete = true;
    },
  },
}
</script>
<style>
.paddingDialog {
  box-shadow: none;
}
</style>
