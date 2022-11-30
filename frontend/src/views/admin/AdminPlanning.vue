import path from "path";
<template>
  <div>
    <v-row
      style="height: calc(100vh - 64px); flex-wrap: nowrap; max-width: 100vw"
      class="ma-0 pa-0"
      v-if="!loadingDatas && appointments.length > 0 || newAppointments.length !== 0 || deletedAppointments.length !== 0"
    >
      <v-col
        cols="2"
        style="
          background-color: #d1e8e8;
          max-height: calc(100vh - 64px);
          overflow-y: auto;
          overflow-x: hidden;
          min-width: 235px;
        "
        class="ma-0 pa-0"
      >
        <div class="primary--text text-h4 mt-5 ml-5">Filtres</div>
        <v-treeview
          v-model="companiesToShow"
          @input="changeFilter"
          class="text-subtitle-2 ml-1 treeview-primary mt-3"
          color="primary"
          selected-color="primary"
          selectable
          return-object
          item-disabled="locked"
          :items="companyFilter"
        >
        </v-treeview>
        <v-treeview
          v-model="studentsToShow"
          @input="changeFilter"
          class="text-subtitle-2 ml-1 mb-2 treeview-primary"
          color="primary"
          selected-color="primary"
          selectable
          return-object
          item-disabled="locked"
          :items="studentFilter"
        ></v-treeview>
        <div class="align-start flex-column" style="display: flex">
          <v-container class="ml-5 pa-0 font-weight-bold switch-primary" fluid>
            <v-switch
              v-model="selectRemoteStudentsCheckbox"
              @click="selectRemoteStudents"
              label="Etudiants à distance"
            ></v-switch>
          </v-container>
          <v-container class="ml-5 pa-0 font-weight-bold switch-primary" fluid>
            <v-switch
              v-model="selectEmptyListCheckbox"
              @click="selectEmptyList"
              label="Entités sans RDV"
            ></v-switch>
          </v-container>
          <!--v-checkbox
              color="primary"
              class=" ml-5"
              v-model="selectEmptyListCheckbox"
              @click="selectEmptyList"
              label="Etudiant / entreprise sans RDV"
          ></v-checkbox-->
        </div>
      </v-col>
      <v-col
        v-show="!loadingDatas"
        :style="
          'width: ' +
          ((companiesToShow.length + studentsToShow.length) * 207 + 200) +
          'px'
        "
        style="overflow-x: scroll"
        class="ma-0 pa-0"
      >
        <v-row
          :style="
            'width: ' +
            ((companiesToShow.length + studentsToShow.length) * 207 + 200) +
            'px'
          "
          style="
            flex-wrap: nowrap;
            position: relative;
            height: calc(68vh + 51px + 102px);
          "
          class="ma-0 pa-0"
        >
          <div align="right" style="margin-top: 51px; margin-right: 12px">
            <appointment-list-time></appointment-list-time>
          </div>
          <div
            align="center"
            :ref="refreshData"
            v-for="company in companiesToShowComputed"
            :key="company.id"
          >
            <div
              style="margin-top: 20px; margin-bottom: 10px; height: 32px"
              class="primary--text text-h6"
            >
              {{ company.name }}
            </div>
            <appointment-list
              :appointments="company.appointments"
              :students="students"
              :companies="companies"
              :offers="offers"
              mode="company"
              @delete="deleteAppointment"
              @addAppo="(slot) => addAppo(slot, undefined, company.id)"
            ></appointment-list>
          </div>
          <div
            align="center"
            :ref="refreshData"
            v-for="student in studentsToShowComputed"
            :key="student.id"
          >
            <div
              style="margin-top: 20px; margin-bottom: 10px; height: 32px"
              class="primary--text text-h6"
            >
              {{ student.name }}
            </div>
            <appointment-list
              :appointments="student.appointments"
              :students="students"
              :companies="companies"
              :offers="offers"
              mode="student"
              @delete="deleteAppointment"
              @addAppo="(slot) => addAppo(slot, student.id)"
            ></appointment-list>
          </div>
        </v-row>
        <v-row
          class="md-mb-0 mb-10 ma-0 justify-space-between"
          style=" position: sticky; left: 0px"
        >
          <div class="mt-5">
            <v-btn
              color="primary"
              large
              outlined
              elevation="0"
              class="ml-5"
              @click="dialog = true"
            >
              Regénérer le planning
            </v-btn>

            <ConfirmDialogText
              v-if="dialog"
              color="warning"
              text="Régénérer le planning"
              subText="Cette action a de fortes conséquences !"
              confirmText="REGENERER PLANNING"
              @cancel="dialog = false"
              @confirm="generatePlanningL"
            />

            <v-btn
                color="primary"
                large
                elevation="0"
                class="ml-5"
                @click="dialogPublish = true"
                :disabled="showPlanning"
            >
              {{ showPlanning ? "Planning publié" : "Publier le planning" }}
            </v-btn>

            <ConfirmDialogText
                v-if="dialogPublish"
                color="warning"
                text="Publier le planning"
                subText="Cette action est irréversible !"
                confirmText="PUBLIER PLANNING"
                @cancel="dialogPublish = false"
                @confirm="publishPlanning"
            />
          </div>
          <div class=" ml-5  mt-5">
            <v-btn
              color="error"
              large
              elevation="0"
              class="mr-5"
              @click="cancel"
              :disabled="
                newAppointments.length === 0 && deletedAppointments.length === 0
              "
            >
              Annuler
            </v-btn>
            <v-btn
              color="success"
              large
              elevation="0"
              class="mr-5"
              @click="save"
              :disabled="
                newAppointments.length === 0 && deletedAppointments.length === 0
              "
            >
              Sauvegarder
            </v-btn>
            <v-btn
              color="primary"
              large
              elevation="0"
              class="mr-5"
              @click="exportPlanning"
              :disabled="
                newAppointments.length > 0 || deletedAppointments.length > 0
              "
            >
              Exporter
            </v-btn>
          </div>
        </v-row>
      </v-col>
    </v-row>
    <v-col
      v-else
      class="justify-center align-center"
      style="height: calc(100vh - 64px); display: flex"
    >
      <v-progress-circular
        v-if="loadingDatas"
        indeterminate
        size="50"
        color="primary"
      ></v-progress-circular>
      <v-btn
          v-else
          color="primary"
          x-large
          elevation="0"
          class="ml-5"
          @click="generatePlanningL"
      >
        Générer le planning
      </v-btn>
    </v-col>
    <appointment-form-modal
      v-if="addAppointmentModal"
      :dialog="addAppointmentModal"
      :companies="localCompanies"
      :company-id="newAppointment.companyId"
      :students="localStudents"
      :student-id="newAppointment.studentId"
      :offers="localOffers"
      :slot-index="newAppointment.slot"
      @close="addAppointmentModal = false"
      @added="added"
    />
  </div>
</template>

<script>
import { generatePlanning } from "../../services/api";
import { getColorByIndex } from "../../utils/utils";
import AppointmentList from "../../components/planning/AppointmentList";
import AppointmentListTime from "../../components/planning/AppointmentListTime";
import AppointmentFormModal from "../../components/planning/AppointmentFormModal";
import ConfirmDialogText from "../../components/ConfirmDialogText.vue";
import { mapGetters } from "vuex";
import { saveAs } from "file-saver";
import XLSX from "xlsx";

export default {
  name: "AdminPlanning",
  components: { AppointmentFormModal, AppointmentList, AppointmentListTime, ConfirmDialogText },
  data: () => ({
    loadingDatas: false,
    appointments: [],
    localCompanies: [],
    localOffers: [],
    localStudents: [],
    companyFilter: [],
    companiesToShow: [],
    studentFilter: [],
    studentsToShow: [],
    refreshData: 0,
    addAppointmentModal: false,
    dialogPublish: false,
    newAppointment: {
      companyId: "",
      studentId: "",
      slot: "",
    },
    newAppointments: [],
    deletedAppointments: [],
    selectRemoteStudentsCheckbox: false,
    selectEmptyListCheckbox: false,
    times: [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18],
    dialog: false
  }),
  created() {
    this.updateDatasFromDB();
    this.$store.dispatch('getPlanningPublished')
    // todo: planning vide etu remote
  },
  computed: {
    ...mapGetters({
      students: "GET_STUDENTS",
      offers: "GET_OFFERS",
      companies: "GET_COMPANIES",
      showPlanning: "GET_PLANNING_PUBLISHED"
    }),
    studentsToShowComputed () {
      let res = [];
      this.studentsToShow.forEach((s) => {
        res.push(s)
      })
      res.sort((a, b) => a.name.localeCompare(b.name))
      return res
    },
    companiesToShowComputed () {
      let res = [];
      this.companiesToShow.forEach((s) => {
        res.push(s)
      })
      res.sort((a, b) => a.name.localeCompare(b.name))
      return res
    }
  },
  methods: {
    addAppo(slot, studentId, companyId) {
      this.newAppointment = {
        companyId: companyId,
        studentId: studentId,
        slot: slot,
      };
      this.addAppointmentModal = true;
    },
    selectRemoteStudents() {
      if (this.selectRemoteStudentsCheckbox) {
        this.studentsToShow = [];
        this.studentsToShow.push(
          ...this.localStudents.filter(
            (ls) =>
              ls.isRemote && !this.studentsToShow.find((st) => st.id === ls.id)
          )
        );
      } else {
        //this.studentsToShow = []
        let students = this.localStudents.filter((ls) => ls.isRemote);
        this.studentsToShow = this.studentsToShow.filter(
          (s) => !students.find((a) => a.id === s.id)
        );
      }
    },
    selectEmptyList() {
      if (this.selectEmptyListCheckbox) {
        this.studentsToShow = [];
        this.companiesToShow = [];
        this.studentsToShow.push(
          ...this.localStudents.filter(
            (ls) =>
              !ls.appointments.find((a) => a !== undefined) &&
              !this.studentsToShow.find((st) => st.id === ls.id)
          )
        );
        this.companiesToShow.push(
          ...this.localCompanies.filter(
            (lc) =>
              !lc.appointments.find((a) => a !== undefined) &&
              !this.companiesToShow.find((co) => co.id === lc.id)
          )
        );
      } else {
        //this.studentsToShow = []
        //this.companiesToShow = []
        let students = this.localStudents.filter(
          (ls) => !ls.appointments.find((a) => a !== undefined)
        );
        let companies = this.localCompanies.filter(
          (lc) => !lc.appointments.find((a) => a !== undefined)
        );
        this.studentsToShow = this.studentsToShow.filter(
          (s) => !students.find((a) => a.id === s.id)
        );
        this.companiesToShow = this.companiesToShow.filter(
          (c) => !companies.find((a) => a.id === c.id)
        );
      }
    },
    updateDatasFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllCompanies").then(() => {
        this.$store.dispatch("getAllOffers").then(() => {
          this.$store.dispatch("getAllStudents").then(() => {
            this.$store.dispatch("getAllAppointments").then((res) => {
              this.loadingDatas = false;
              this.appointments = res.data;
              this.handleAppointments();
            });
          });
        });
      });
    },
    handleAppointments() {
      this.localCompanies = this.companies.filter((c) => c.isValidated);
      this.localStudents = this.students.filter(
        (s) => s.status === "validated"
      );
      this.localOffers = this.offers.filter((s) => s.status === "validated");
      this.localCompanies.forEach((lc) => {
        lc.offers = this.localOffers.filter((o) => o.companyId === lc.id);
        lc.appointments = [];
      });
      this.localOffers.forEach((lo) => {
        lo.appointments = [];
      });
      this.localStudents.forEach((lo) => {
        lo.appointments = [];
      });
      this.localCompanies = this.localCompanies.filter(
        (lc) => lc.offers.length > 0
      );
      this.appointments.forEach((appo) => {
        let currC = this.localCompanies.find((c) => c.id === appo.companyId);
        let currO = this.localOffers.find((o) => o.id === appo.offerId);
        let currS = this.localStudents.find((s) => s.id === appo.studentId);
        currC.appointments[appo.slot] = appo;
        currO.appointments[appo.slot] = appo;
        currS.appointments[appo.slot] = appo;
      });
      this.localStudents.forEach(async (ls, index) => {
        ls.color = getColorByIndex(index);
        ls.name = ls.user.lastname + " " + ls.user.firstname;
      });
      this.localCompanies.forEach(async (lc, index) => {
        lc.color = getColorByIndex(index + this.localStudents.length);
      });
      this.localCompanies.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      this.companyFilter = [
        {
          id: 1,
          name: "Entreprises",
          children: this.localCompanies,
        },
      ];
      this.localStudents.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      this.studentFilter = [
        {
          id: 2,
          name: "Etudiants",
          children: this.localStudents,
        },
      ];
      this.companiesToShow = this.companiesToShow.map((cts) =>
        this.localCompanies.find((obj) => obj.id === cts.id)
      );
      this.studentsToShow = this.studentsToShow.map((sts) =>
        this.localStudents.find((obj) => obj.id === sts.id)
      );
      this.refreshData += 1;
    },
    generatePlanningL() {
      this.dialog = false;
      this.loadingDatas = true;
      generatePlanning().then(() => {
        this.appointments = [];
        this.localCompanies = [];
        this.localOffers = [];
        this.localStudents = [];
        this.updateDatasFromDB();
      });
    },
    publishPlanning () {
      this.dialogPublish = false
      this.loadingDatas = true
      this.$store.dispatch('setPlanningPublished', {showPlanning: true}).then(() => {
        this.loadingDatas = false
        this.$store.commit("SET_POPUP", {
          text: `Planning publié !`,
          color: "success",
          visible: true,
        });
      })
    },
    async save() {
      this.loadingDatas = true;
      for (let da of this.deletedAppointments) {
        await this.$store.dispatch("deleteAppointment", da);
      }
      for (let na of this.newAppointments) {
        await this.$store.dispatch("addAppointment", na);
      }
      this.deletedAppointments = [];
      this.newAppointments = [];
      this.loadingDatas = false;
    },
    exportPlanning() {
      var wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "Planning TeaMeeT 2022",
        Subject: "",
        Author: "TeaMeeT",
        CreatedDate: new Date(),
      };
      wb.SheetNames.push("Planning Entreprise");
      var ws_data = [[]];
      var wscols = [];
      var wsrows = [];
      let colInfo = {
        wch: 20,
      };
      let rowInfo = {
        hpt: 32,
      };
      ws_data[0].push('');
      wscols.push({
        wch: 10,
      });
      wsrows.push(rowInfo);
      for (let company of this.localCompanies) {
        ws_data[0].push(company.name);
        wscols.push(colInfo);
      }
      for (let i = 0; i < 8; i++) {
        ws_data.push([]);
        wsrows.push(rowInfo);
        ws_data[i + 1].push(this.getFormatTime(this.times[i]));
        for (let company of this.localCompanies) {
          let appo = company.appointments.find((a) => a && a.slot === i);
          if (appo) {
            let student = this.localStudents.find(
              (s) => s.id === appo.studentId
            );
            ws_data[i + 1].push(student.name);
          } else {
            ws_data[i + 1].push("");
          }
        }
      }
      let ws = XLSX.utils.aoa_to_sheet(ws_data);

      ws["!cols"] = wscols;
      ws["!rows"] = wsrows;
      wb.Sheets["Planning Entreprise"] = ws;

      wb.SheetNames.push("Planning Etudiant");
      ws_data = [[]];
      wscols = [];
      wsrows = [];
      ws_data[0].push('');
      wsrows.push(rowInfo);
      wscols.push({
        wch: 10,
      });
      for (let student of this.localStudents) {
        ws_data[0].push(student.name);
        wscols.push(colInfo);
      }
      for (let i = 0; i < 8; i++) {
        wsrows.push(rowInfo);
        ws_data.push([]);
        ws_data[i + 1].push(this.getFormatTime(this.times[i]));
        for (let student of this.localStudents) {
          let appo = student.appointments.find((a) => a && a.slot === i);
          if (appo) {
            let company = this.localCompanies.find(
              (c) => c.id === appo.companyId
            );
            ws_data[i + 1].push(company.name);
          } else {
            ws_data[i + 1].push("");
          }
        }
      }
      ws = XLSX.utils.aoa_to_sheet(ws_data);

      ws["!cols"] = wscols;
      ws["!rows"] = wsrows;
      wb.Sheets["Planning Etudiant"] = ws;

      var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      saveAs(
        new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }),
        "planning.xlsx"
      );
    },
    getFormatTime (time) {
      return Math.trunc(time) + 'h' + ('' + ((time - Math.trunc(time)) * 60)).padStart(2, '0')
    },
    s2ab(s) {
      var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
      var view = new Uint8Array(buf); //create uint8array as viewer
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
      return buf;
    },
    cancel() {
      this.loadingDatas = true;
      this.newAppointments = [];
      this.deletedAppointments = [];
      this.$store.dispatch("getAllAppointments").then((res) => {
        this.loadingDatas = false;
        this.appointments = res.data;
        this.handleAppointments();
      });
    },
    deleteAppointment(appo) {
      this.deletedAppointments.push(appo.id);
      this.appointments.splice(this.appointments.indexOf(appo), 1);
      this.handleAppointments();
      // this.$store.dispatch('deleteAppointment', appo.id).then(() => {
      //   this.$store.dispatch('getAllAppointments').then((res) => {
      //     this.appointments = res.data
      //     this.handleAppointments()
      //   })
      // })
    },
    added(appo) {
      this.newAppointments.push(appo);
      this.appointments.push(appo);
      this.addAppointmentModal = false;
      this.handleAppointments();
    },
    getStudentInfo(id) {
      let stu = this.localStudents.find((s) => s.id === id);
      return stu.user.firstname + " " + stu.user.lastname;
    },
    getOfferInfo(id) {
      let off = this.localOffers.find((o) => o.id === id);
      return off.title;
    },
    changeFilter() {
      if (
        this.selectEmptyListCheckbox &&
        this.studentsToShow.length !==
          this.localStudents.filter(
            (ls) => !ls.appointments.find((a) => a !== undefined)
          ).length
      ) {
        this.selectEmptyListCheckbox = false;
      }
      if (
        this.selectEmptyListCheckbox &&
        this.companiesToShow.length !==
          this.localCompanies.filter(
            (lc) => !lc.appointments.find((a) => a !== undefined)
          ).length
      ) {
        this.selectEmptyListCheckbox = false;
      }
      if (
        this.selectRemoteStudentsCheckbox &&
        this.studentsToShow.length !==
          this.localStudents.filter((ls) => ls.isRemote).length
      ) {
        this.selectRemoteStudentsCheckbox = false;
      }
    },
  },
};
</script>
<style>
.switch-primary .v-label {
  color: #005672;
}

.treeview-primary .v-treeview-node__label {
  color: #005672;
}
.treeview-primary .v-icon {
  color: #005672;
}
</style>
