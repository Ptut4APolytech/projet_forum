<template>
  <div
    style="
      height: 8vh;
      width: 195px;
      border-radius: 10px;
      position: relative;
      opacity: 0.9;
    "
    :style="'background-color: ' + color"
    class="accent--text"
  >
    <!--    display: flex; justify-content: space-between;-->
    <div
      style="
        position: absolute;
        top: 0px;
        right: 2px;
        cursor: pointer;
        padding: 2px;
      "
      @click="$emit('delete')"
    >
      <v-icon
        v-if="
          currentUser.role !== 'student' &&
          currentUser.role !== 'representative'
        "
        color="accent"
        dense
        >mdi-close-circle-outline</v-icon
      >
    </div>
    <div style="display: flex; flex-direction: column">
      <div style="margin-top: 0.8vh">
        {{ mode === "company" ? student.name : company.name }}
      </div>
      <!-- align-self: start; -->
      <div style="margin-left: 1vh; margin-top: 0vh" class="text-body-2">
        {{ offer.title }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AppointmentTile",
  props: ["appointment", "students", "companies", "offers", "mode"],
  data: () => ({
    student: {},
    offer: {},
    company: {},
    color: "",
  }),
  created() {
    this.student = this.students.find(
      (s) => s.id === this.appointment.studentId
    );
    this.offer = this.offers.find((o) => o.id === this.appointment.offerId);
    this.company = this.companies.find(
      (c) => c.id === this.appointment.companyId
    );
    this.color =
      this.mode === "company" ? this.student.color : this.company.color;
  },
  methods: {},
  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },
};
</script>
