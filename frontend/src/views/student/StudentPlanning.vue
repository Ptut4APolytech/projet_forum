<template>
  <v-container fluid>
    <h1 class="primary--text text-h4">
      Planning du
      <v-progress-circular v-if="!date" indeterminate></v-progress-circular>
      <template v-else>{{ date }}</template>
    </h1>
    <v-card-title v-if="currentStudent.status != 'validated'">
      Vous n'avez pas accès au planning, votre statut n'est pas encore valide
    </v-card-title>
    <v-card-title v-else-if="showPlanning === false">
      Vous n'avez pas encore accès au planning, son affichage est caché par Polytech Lyon
    </v-card-title>
    <v-row
      v-else-if="!loadingDatas"
      style="flex-wrap: nowrap; max-width: 100vw; margin-left: -56px"
      class="pa-0 justify-center"
    >
      <div align="right" style="margin-top: 51px; margin-right: 12px">
        <appointment-list-time></appointment-list-time>
      </div>
      <div align="center" :ref="refreshData">
        <div
          style="margin-top: 20px; margin-bottom: 10px; height: 32px"
          class="primary--text text-h6"
        >
          {{ userFullName }}
        </div>
        <appointment-list
          :appointments="localStudent.appointments"
          :students="[localStudent]"
          :companies="localCompanies"
          :offers="localOffers"
          mode="student"
        ></appointment-list>
      </div>
    </v-row>
    <v-row
      v-else
      class="d-flex justify-center align-center"
      style="height: calc(100vh - 200px)"
    >
      <v-progress-circular
        indeterminate
        size="50"
        color="primary"
      ></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
import AppointmentListTime from "../../components/planning/AppointmentListTime.vue";
import AppointmentList from "../../components/planning/AppointmentList.vue";
import {
  getStudentAppointments,
  searchOffers,
  getConfiguration,
} from "../../services/api";
import { mapGetters } from "vuex";
import { getColorByIndex } from "../../utils/utils";

export default {
  name: "StudentPlanning",
  components: { AppointmentListTime, AppointmentList },

  data: () => ({
    loadingDatas: false,
    appointments: [],
    userFullName: "",
    localCompanies: [],
    localStudent: {},
    localOffers: [],
    refreshData: 0,
    date: null,
    showPlanning: null,
  }),

  created() {
    if (this.currentStudent.status == "validated") {
      this.canShowPlanning();

      this.userFullName =
        this.currentUser.firstname +
        " " +
        this.currentUser.lastname.toUpperCase();
    }

    this.updateDate(this.forumDate);
  },

  watch: {
    forumDate(newValue) {
      this.updateDate(newValue);
    },
  },

  computed: {
    ...mapGetters({
      currentStudent: "GET_CURRENT_STUDENT",
      currentUser: "GET_CURRENT_USER",
      companies: "GET_COMPANIES",
      forumDate: "GET_FORUM_DATE",
    }),
  },

  methods: {
    canShowPlanning() {
      this.loadingDatas = true;

      getConfiguration()
        .then((res) => {
          this.showPlanning = res.data.showPlanning;

          // Chargement du planning seulement si la config l'autorise
          if (this.showPlanning) {
            this.loadAppointments();
          } else {
            this.loadingDatas = false;
          }
        })
        .catch((err) => {
          this.loadingDatas = false;

          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    loadAppointments() {
      this.loadingDatas = true;

      getStudentAppointments(this.currentStudent.id)
        .then((res) => {
          this.appointments = res.data;
          let lastSearch = [
            { path: "status", operator: "==", value: "validated" },
          ];

          searchOffers(lastSearch)
            .then((res) => {
              this.offers = res.data;
              this.$store.dispatch("getAllCompanies").then(() => {
                this.handleAppointments();
                this.loadingDatas = false;
              });
            })
            .catch((err) => {
              this.$store.commit("SET_POPUP", {
                text: `Erreur : ${err.response.data.message}`,
                color: "error",
                visible: true,
              });
              this.loadingDatas = false;
              this.offers = [];
            });
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response ? err.response.data.message : err}`,
            color: "error",
            visible: true,
          });
        });
    },
    handleAppointments() {
      this.localCompanies = this.companies;
      this.localStudent = this.currentStudent;
      this.localOffers = this.offers;
      this.localCompanies.forEach((lc) => {
        lc.offers = this.localOffers.filter((o) => o.companyId === lc.id);
        lc.appointments = [];
      });
      this.localOffers.forEach((lo) => {
        lo.appointments = [];
      });
      this.localStudent.appointments = [];
      this.localCompanies = this.localCompanies.filter(
        (lc) => lc.offers.length > 0
      );
      this.appointments.forEach((appo) => {
        let currC = this.localCompanies.find((c) => c.id === appo.companyId);
        let currO = this.localOffers.find((o) => o.id === appo.offerId);
        currC.appointments[appo.slot] = appo;
        currO.appointments[appo.slot] = appo;
        this.localStudent.appointments[appo.slot] = appo;
      });
      this.localCompanies.forEach(async (lc, index) => {
        lc.color = getColorByIndex(index);
      });
      this.refreshData += 1;
    },

    updateDate(newDate) {
      if (newDate) {
        this.date = new Date(newDate).toLocaleDateString("fr");
      }
    },
  },
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
</style>
