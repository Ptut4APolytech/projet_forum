<template>
  <v-container fluid>
    <h1 class="primary--text text-h4 mb-3">Gestion des utilisateurs</h1>
    <v-row class="justify-center mt-2">
      <v-col class="col col-lg-11">
        <v-card>
          <v-tabs
            color="primary"
            v-model="step"
            show-arrows
          >
            <v-tab v-for="i in 4" :key="i">{{ getNameWithAnS(i - 1) }}</v-tab>

            <v-col class="text-right py-0 d-flex align-center">
              <v-row class="ma-0 align-center justify-end pt-1">
                <v-text-field
                  class="mr-4 searchBar"
                  filled
                  dense
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Rechercher"
                  single-line
                  hide-details
                  outlined
                ></v-text-field>
                <v-btn
                  color="primary"
                  class="white--text"
                  @click="openDialog(step)"
                >
                  Ajouter {{ getNameWithUn(step) }}
                </v-btn>
              </v-row>
            </v-col>
            <v-tab-item>
              <v-container fluid class="pa-0">
                <student-table ref="studentTable" :search="search" />
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid class="pa-0">
                <representative-table
                  ref="representativeTable"
                  :search="search"
                />
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid class="pa-0">
                <company-table ref="companyTable" :search="search" />
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid class="pa-0">
                <admin-table ref="adminTable" :search="search" />
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card>
        <student-form-modal
          v-if="dialog === 0"
          :dialog="dialog === 0"
          @close="dialog = -1"
          @added="added(0)"
        />
        <representative-form-modal
          v-if="dialog === 1"
          :dialog="dialog === 1"
          @close="dialog = -1"
          @added="added(1)"
        />
        <company-form-modal
          v-if="dialog === 2"
          :dialog="dialog === 2"
          @close="dialog = -1"
          @added="added(2)"
        />
        <admin-form-modal
          v-if="dialog === 3"
          :dialog="dialog === 3"
          @close="dialog = -1"
          @added="added(3)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CompanyTable from "../../components/admin/CompanyTable";
import CompanyFormModal from "../../components/admin/CompanyFormModal";
import AdminTable from "../../components/admin/AdminTable";
import AdminFormModal from "../../components/admin/AdminFormModal";
import RepresentativeTable from "../../components/admin/RepresentativeTable";
import RepresentativeFormModal from "../../components/admin/RepresentativeFormModal";
import StudentTable from "../../components/admin/StudentTable";
import StudentFormModal from "../../components/admin/StudentFormModal";

export default {
  name: "Admin",
  components: {
    StudentTable,
    StudentFormModal,
    AdminFormModal,
    AdminTable,
    RepresentativeFormModal,
    RepresentativeTable,
    CompanyTable,
    CompanyFormModal,
  },
  data: () => ({
    step: 0,
    dialog: -1,
    search: "",
  }),
  watch: {
    step () {
      this.search = ''
    }
  },
  created () {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('tab')) {
      this.step = parseInt(urlParams.get('tab'))
    }
  },
  methods: {
    getName(index) {
      switch (index) {
        case 0:
          return "étudiant";
        case 1:
          return "salarié";
        case 2:
          return "entreprise";
        case 3:
          return "administrateur";
      }
      return "";
    },
    getNameWithAnS(index) {
      return this.getName(index) + "s";
    },
    getNameWithUn(index) {
      let name = this.getName(index);
      if (index === 2) {
        return "une " + name;
      } else {
        return "un " + name;
      }
    },
    openDialog(index) {
      this.dialog = index;
    },
    added(index) {
      this.dialog = -1;

      switch (index) {
        case 0:
          this.$refs.studentTable.updateStudentFromDB();
          break;
        case 1:
          this.$refs.representativeTable.updateRepresentativeFromDB();
          break;
        case 2:
          this.$refs.companyTable.updateCompanyFromDB();
          break;
        case 3:
          this.$refs.adminTable.updateAdminFromDB();
          break;
      }
      this.$store.commit("SET_POPUP", {
        text: `Création réussie !`,
        color: "success",
        visible: true,
      });
    },
  },
};
</script>
<style scoped>
.searchBar {
  max-width: 400px;
}
</style>
