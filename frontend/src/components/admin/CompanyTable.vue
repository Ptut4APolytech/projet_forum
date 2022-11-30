<template>
  <div>
    <v-data-table
      :ref="tableRef"
      :headers="headers"
      :items="sortedCompanies"
      class="elevation-1"
      :items-per-page="15"
      :search="search"
      :loading="loadingDatas"
      loading-text="Chargement des données.."
      no-data-text="Aucune entreprise existante"
      no-results-text="Aucune entreprise trouvée"
      :footer-props="{
         'items-per-page-text':'Entreprises par page'
      }"
    >
      <template v-slot:item.isValidated="{ item }">
        <div class="d-flex align-center subtitle-1">
          <div class="statusPoint mr-4" :class="item.isValidated ? 'success' : 'error'"/>
          {{ item.isValidated ? 'Valide' : 'Invalide' }}
        </div>
      </template>
      <template v-slot:item.remove="{ item }">
        <v-icon color="error" @click="openDialogDelete(item.id)"
          >mdi-delete</v-icon
        >
      </template>
      <template v-slot:item.edit="{ item }">
        <v-icon @click="editCompany(item)">mdi-eye</v-icon>
      </template>
      <template v-slot:footer.page-text="data">
        {{data.pageStart}}-{{data.pageStop}} sur {{data.itemsLength}}
      </template>
    </v-data-table>

    <!-- Dialog part-->
    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer cette entreprise ?"
      color="error"
      @confirm="deleteCompany(idToDelete)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ConfirmDialog from "../ConfirmDialog.vue";

export default {
  name: "CompanyTable",
  props: ['search'],
  components: { ConfirmDialog },
  data: () => ({
    tableRef: 0,
    headers: [
      { text: "Nom", value: "name" },
      { text: "Statut", value: "isValidated" },
      { text: "Consulter les offres", value: "edit", align: "center", sortable: false },
      { text: "Supprimer", value: "remove", align: "center", sortable: false },
    ],
    loadingDatas: true,

    dialogDelete: false,
    idToDelete: null,
  }),
  computed: {
    ...mapGetters({
      companies: "GET_COMPANIES",
    }),

    sortedCompanies() {
      return this.loadingDatas ? [] : this.companies;
    },
  },
  created() {
    this.updateCompanyFromDB();
  },
  methods: {
    updateCompanyFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllCompanies").then(() => {
        this.loadingDatas = false;
      });
    },
    deleteCompany(companyId) {
      if (companyId) {
        this.idToDelete = null;
        this.dialogDelete = false;

        this.loadingDatas = true;
        this.$store
          .dispatch("delCompany", companyId)
          .then(() => {

            this.$store.commit("SET_POPUP", {
              text: `Suppression réussie !`,
              color: "success",
              visible: true,
            });

            this.updateCompanyFromDB();
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
    editCompany(company) {
      this.$router.push('/adminOffers?search=' + company.name)
    },
    updateCompany(company, payload) {
      this.loadingDatas = true;
      this.$store
        .dispatch("updateCompany", { companyId: company.id, payload })
        .then(() => {
          this.updateCompanyFromDB();
        });
    },

    openDialogDelete(companyId) {
      this.idToDelete = companyId;
      this.dialogDelete = true;
    },
  },
};
</script>
