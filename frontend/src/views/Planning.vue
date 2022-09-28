<template>
  <div style="display: grid">
    <admin-planning v-if="user.role === 'admin'" />
    <student-planning v-if="user.role === 'student'" />
    <representative-planning v-if="user.role === 'representative'" />
  </div>
</template>

<script>
import AdminPlanning from "./admin/AdminPlanning.vue";
import { mapGetters } from "vuex";
import StudentPlanning from "./student/StudentPlanning.vue";
import RepresentativePlanning from "./company/RepresentativePlanning.vue";

export default {
  name: "Planning",
  components: { AdminPlanning, StudentPlanning, RepresentativePlanning },
  data: () => ({}),
  computed: {
    ...mapGetters({
      user: "GET_CURRENT_USER",
    }),
  },
  methods: {},
};
</script>
