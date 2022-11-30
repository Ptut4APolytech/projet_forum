<template>
  <div v-if="loadingDatas" class="d-flex justify-center mt-5">
    <v-progress-circular
      indeterminate
      :size="60"
      color="primary"
    ></v-progress-circular>
  </div>
  <div v-else>
    <v-card-title v-if="students.length == 0">
      Aucun étudiant trouvé
    </v-card-title>

    <v-card
      v-else
      outlined
      class="mb-3"
      v-for="student in students"
      :key="student.id"
      @click="selectStudent(student.id)"
      :class="{ 'v-btn--active': studentId == student.id }"
      hover
    >
      <v-card-title>
        {{ student.user.firstname }} {{ student.user.lastname }}
      </v-card-title>

      <v-card-subtitle> {{ student.user.email }}</v-card-subtitle>

      <v-divider class="mx-4"></v-divider>

      <v-card-text class="pa-2 mr-2 ml-1">
        <v-chip
          v-for="tag in student.tags"
          :key="tag"
          class="ma-1"
          color="primary"
          outlined
        >
          {{ tag }}
        </v-chip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { searchStudents } from "../../../services/api";

export default {
  name: "StudentList",

  props: ["search"],

  data: () => ({
    loadingDatas: true,
    students: [],
    studentId: null,
  }),

  watch: {
    // Surveille les changements de valeur de la propriété search
    search(newValue) {
      if (this.search.length) {
        this.searchStudents(newValue);
      } else {
        this.searchStudents();
      }
    },
    "$route.query.studentId": function () {
      this.studentId = this.getQueryStudentId();
    },
  },

  created() {
    this.searchStudents();
    this.studentId = this.getQueryStudentId();
  },

  methods: {
    selectStudent(studentId) {
      this.$router.replace({ query: { studentId: studentId } });
    },

    searchStudents(search = []) {
      this.loadingDatas = true;

      let lastSearch = [
        ...search,
        { path: "status", operator: "==", value: "validated" },
      ];
      searchStudents(lastSearch)
        .then((res) => {
          this.students = res.data;
          this.loadingDatas = false;

          if (this.students[0] && window.innerWidth >= 700) {
            let query = Object.assign({}, this.$route.query);
            query.studentId = this.students[0].id;
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

    getQueryStudentId() {
      return this.$route.query.studentId ? this.$route.query.studentId : null;
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
