<template>
  <v-container fluid>
    <h1 class="primary--text text-h4">
      Planning du
      <v-progress-circular v-if="!date" indeterminate></v-progress-circular>
      <template v-else>{{ date }}</template>
    </h1>
    <v-card-title v-if="!company.isValidated">
      Vous n'avez pas accès au planning, le statut de votre entreprise n'est pas
      encore valide
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
          {{ localCompany.name }}
        </div>
        <appointment-list
          :appointments="localCompany.appointments"
          :students="localStudents"
          :companies="[localCompany]"
          :offers="localOffers"
          mode="company"
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
  getCompanyAppointments,
  getOfferByCompanyId,
  searchStudents,
  getConfiguration,
} from "../../services/api";
import { mapGetters } from "vuex";
import { getColorByIndex } from "../../utils/utils";

export default {
  name: "RepresentativePlanning",
  components: { AppointmentListTime, AppointmentList },

  data: () => ({
    loadingDatas: true,
    appointments: [],
    companies: [],
    localCompany: {},
    localStudents: [],
    localOffers: [],
    refreshData: 0,
    date: null,
    showPlanning: null,
  }),

  created() {
    if (this.company.isValidated) {
      this.canShowPlanning();
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
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
      currentUser: "GET_CURRENT_USER",
      company: "GET_CURRENT_COMPANY",
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

      getCompanyAppointments(this.currentRepresentative.companyId)
        .then((res) => {
          this.appointments = res.data;
          getOfferByCompanyId(this.currentRepresentative.companyId)
            .then((res) => {
              this.offers = res.data;
              let lastSearch = [
                { path: "status", operator: "==", value: "validated" },
              ];
              searchStudents(lastSearch)
                .then((res) => {
                  this.students = res.data;
                  this.handleAppointments();
                  this.loadingDatas = false;
                })
                .catch((err) => {
                  this.loadingDatas = false;

                  this.$store.commit("SET_POPUP", {
                    text: `Erreur : ${err.response.data.message}`,
                    color: "error",
                    visible: true,
                  });
                });
            })
            .catch((err) => {
              this.loadingDatas = false;

              this.$store.commit("SET_POPUP", {
                text: `Erreur : ${err.response.data.message}`,
                color: "error",
                visible: true,
              });
            });
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
    handleAppointments() {
      this.localCompany = this.company;
      this.localStudents = this.students;
      this.localOffers = this.offers;
      this.localCompany.offers = this.localOffers;
      this.localCompany.appointments = [];

      this.localOffers.forEach((lo) => {
        lo.appointments = [];
      });
      this.localStudents.forEach((lo) => {
        lo.appointments = [];
      });
      this.appointments.forEach((appo) => {
        let currO = this.localOffers.find((o) => o.id === appo.offerId);
        let currS = this.localStudents.find((s) => s.id === appo.studentId);
        this.localCompany.appointments[appo.slot] = appo;
        currO.appointments[appo.slot] = appo;
        currS.appointments[appo.slot] = appo;
      });
      this.localStudents.forEach(async (ls, index) => {
        ls.color = getColorByIndex(index);
        ls.name = ls.user.lastname + " " + ls.user.firstname;
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