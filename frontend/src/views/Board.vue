<template>
  <div style="width: 100vw" class="ma-auto">
    <student-board v-if="currentUser.role === 'student'"></student-board>
    <admin-board v-if="currentUser.role === 'admin'"></admin-board>
    <representative-board v-if="currentUser.role === 'representative'"></representative-board>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import StudentBoard from "./student/StudentBoard";
import AdminBoard from "./admin/AdminBoard";
import RepresentativeBoard from "./company/RepresentativeBoard";

export default {
  name: "Board",
  components: {RepresentativeBoard, AdminBoard, StudentBoard},
  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },
}
</script>

<style scoped>

</style>