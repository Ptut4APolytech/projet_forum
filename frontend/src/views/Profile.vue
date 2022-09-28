<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col class="col-11 col-md-9 col-lg-8">
        <student-profile
          v-if="currentUser.role === 'student'"
        ></student-profile>
        <admin-profile v-if="currentUser.role === 'admin'"></admin-profile>
        <representative-profile
          v-if="currentUser.role === 'representative'"
        ></representative-profile>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import StudentProfile from "./student/StudentProfile";
import AdminProfile from "./admin/AdminProfile";
import RepresentativeProfile from "./company/RepresentativeProfile";

export default {
  name: "Profile",
  components: { RepresentativeProfile, AdminProfile, StudentProfile },
  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },
  async created() {
    switch (this.currentUser.role) {
      case "student":
        await this.$store.dispatch("getUser", this.currentUser.id);
        await this.$store.dispatch(
          "getStudent",
          this.$store.getters.GET_CURRENT_STUDENT.id
        );
        break;
      case "representative":
        await this.$store.dispatch("getUser", this.currentUser.id);
        await this.$store.dispatch(
          "getRepresentative",
          this.$store.getters.GET_CURRENT_REPRESENTATIVE.id
        );
        break;
      case "admin":
        await this.$store.dispatch("getUser", this.currentUser.id);
        break;
    }
  },
};
</script>

<style scoped>
</style>