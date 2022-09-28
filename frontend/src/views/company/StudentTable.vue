<template>
  <v-container fluid>
    <h1 class="primary--text text-h4 mb-3">Liste des étudiants</h1>
    <template v-if="currentCompany.isValidated">
      <v-row>
        <v-col cols="6" id="studentList">
          <StudentSearch @submitted="submittedSearch" class="mb-2" />
          <StudentList :search="search" />
        </v-col>
        <v-col cols="6" id="student">
          <StudentContent class="sticky-card"/>
        </v-col>
      </v-row>
    </template>
    <v-card-title v-else>
      Vous n'avez pas encore accès à la liste des étudiants, votre entreprise n'est pas validée.
      Créer et attendez la validation de votre première offre pour continuer.
    </v-card-title>
  </v-container>
</template>

<script>
import StudentList from "../../components/company/StudentList/StudentList";
import StudentContent from "../../components/company/StudentList/StudentContent";
import StudentSearch from "../../components/company/StudentList/StudentSearch";
import { mapGetters } from "vuex";

export default {
  name: "StudentTable",

  components: {
    StudentSearch,
    StudentContent,
    StudentList,
  },

  data: () => ({
    search: [],
    windowWidth: window.innerWidth,
  }),

  watch: {
    windowWidth() {
      this.responsive();
    },

    "$route.query.studentId": function () {
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
      currentCompany: "GET_CURRENT_COMPANY",
    }),
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    responsive() {
      if (this.currentCompany.isValidated) {
        let domStudentList = document.getElementById("studentList");
        let domStudent = document.getElementById("student");
        if (this.windowWidth < 700) {
          // On supprime la limite de colonnes pour la version mobile
          domStudentList.classList.remove("col-6");
          domStudent.classList.remove("col-6");

          const studentId = this.$route.query.studentId;

          if (studentId) {
            domStudentList.hidden = true;
            domStudent.hidden = false;
          } else {
            domStudentList.hidden = false;
            domStudent.hidden = true;
          }
        } else {
          // On remet la limite de colonnes pour la version mobile
          domStudentList.classList.add("col-6");
          domStudent.classList.add("col-6");

          domStudentList.hidden = false;
          domStudent.hidden = false;
        }
      }
    },

    submittedSearch(value) {
      let query = Object.assign({}, this.$route.query);
      delete query.studentId;
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
