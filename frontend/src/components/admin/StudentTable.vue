<template>
  <div>
    <v-data-table
      :ref="tableRef"
      :headers="headers"
      :items="sortedStudents"
      class="elevation-1"
      :items-per-page="15"
      :loading="loadingDatas"
      :search="search"
      loading-text="Chargement des données.."
      no-data-text="Aucun étudiant existant"
      no-results-text="Aucun étudiant trouvé"
      :footer-props="{
         'items-per-page-text':'Étudiants par page'
      }"
    >
      <template v-slot:item.status="{ item }">
        <v-row justify="start" style="padding-left: 10px; width: 20vw">
          <StatusSelect
            class=""
            :status="item.status"
            @change="(status) => updateStudent(item, { status })"
            style="width: 15vw; padding-right: 15px"
          />
        </v-row>
      </template>
      <template v-slot:item.cvPath="{ item }">
        <v-icon :color="item.cvPath ? 'success' : 'error'">
          {{
            item.cvPath
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
      </template>
      <template v-slot:item.path="{ item }">
        <v-avatar size="30" :ref="renderImg" class="tertiary">
          <img v-if="imgs[item.id]" :src="imgs[item.id]"/>
          <div v-else class="accent--text">
            {{ (item.user.firstname.charAt(0) + item.user.lastname.charAt(0)).toUpperCase() }}
          </div>
        </v-avatar>
      </template>
      <template v-slot:item.lastLogin="{ item }">
        <v-chip class="ma-2 ml-0" :color="getConnectionColor(nbDays[item.id])">
          {{ getLastConnectionText(nbDays[item.id]) }}
        </v-chip>
      </template>
      <template v-slot:item.description="{ item }">
        <v-icon :color="item.description ? 'success' : 'error'">
          {{
            item.description
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
      </template>
      <template v-slot:item.isRemote="{ item }">
        <div class="d-flex justify-center">
          <v-switch
              v-model="item.isRemote"
              @change="(newVal) => updateStudent(item, { isRemote: newVal })"
          ></v-switch>
        </div>
      </template>
      <template v-slot:item.remove="{ item }">
        <v-icon color="error" @click="openDialogDelete(item.id)"
          >mdi-delete</v-icon
        >
      </template>
      <template v-slot:item.edit="{ item }">
        <v-icon @click="editStudent(item)">mdi-eye</v-icon>
      </template>
      <template v-slot:footer.page-text="data">
        {{data.pageStart}}-{{data.pageStop}} sur {{data.itemsLength}}
      </template>
    </v-data-table>

    <v-dialog
        v-model="showStudentContent"
        max-width="600px"
        content-class="pa-2 paddingDialog"
    >
      <student-content class="pa-0" @close="showStudentContent = false" @update="updateStudentFromDB"></student-content>
    </v-dialog>
    <!-- Dialog part-->
    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer cet étudiant ?"
      color="error"
      @confirm="deleteStudent(idToDelete)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import StatusSelect from "./StatusSelect";
import StudentContent from "../company/StudentList/StudentContent";
import ConfirmDialog from "../ConfirmDialog.vue";

export default {
  name: "StudentTable",
  props: ['search'],
  components: { StatusSelect, ConfirmDialog, StudentContent },
  data: () => ({
    tableRef: 0,
    renderImg: 0,
    headers: [
      {
        text: "",
        align: "start",
        sortable: false,
        value: "path",
      },
      { text: "Nom", value: "user.lastname" },
      { text: "Prénom", value: "user.firstname" },
      { text: "CV", value: "cvPath", align: "center", sortable: false },
      { text: "Description", value: "description", align: "center", sortable: false },
      { text: "Dernière connexion", value: "lastLogin", sortable: false },
      { text: "Distanciel", value: "isRemote", align: "center", sortable: true },
      { text: "Statut", value: "status" },
      { text: "Voir", value: "edit", align: "center", sortable: false },
      { text: "Supprimer", value: "remove", align: "center", sortable: false },
    ],
    loadingDatas: true,
    imgs: {},
    nbDays: {},
    showStudentContent: false,
    dialogDelete: false,
    idToDelete: null,
  }),
  computed: {
    ...mapGetters({
      storeStudents: "GET_STUDENTS",
    }),
    sortedStudents() {
      let students = this.loadingDatas ? [] : this.storeStudents;
      students.forEach((stu) => {
        this.getAvatarSrc(stu);
        if (this.nbDays[stu.id] === undefined) {
          this.nbDays[stu.id] = this.getTime(stu.user.lastLogin);
        }
      });
      return students;
    },
  },
  created() {
    this.updateStudentFromDB();
  },
  methods: {
    getAvatarSrc(student) {
      if (this.imgs[student.id]) {
        return this.imgs[student.id];
      }
      if (!student.user.avatarPath) {
        this.imgs[
          student.id
        ] = undefined
      } else {
        this.$store
          .dispatch("downloadFile", { path: student.user.avatarPath })
          .then((result) => {
            let fr = new FileReader();
            fr.onload = () => {
              this.imgs[student.id] = fr.result;
              this.renderImg += 1;
            };
            fr.readAsDataURL(result.data);
          });
      }
    },
    getTime(time) {
      if (time) {
        let date = new Date(time);
        let diff = (new Date() - date) / (60 * 60 * 1000 * 24);
        return Math.floor(diff);
      }
      return -1;
    },
    getLastConnectionText(nbDays) {
      if (nbDays === -1) {
        return "Jamais connecté";
      }
      if (nbDays === 0) {
        return "Il y a moins d'un jour";
      }
      return "Il y a " + nbDays + " jour(s)";
    },
    getConnectionColor(nbDays) {
      if (nbDays === -1) {
        return "error";
      }
      if (nbDays < 14) {
        return "success";
      }
      return "tertiary";
    },
    updateStudentFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllStudents").then(() => {
        this.loadingDatas = false;
      });
    },
    deleteStudent(studentId) {
      if (studentId) {
        this.idToDelete = null;
        this.dialogDelete = false;

        this.loadingDatas = true;
        this.$store
          .dispatch("delStudent", studentId)
          .then(() => {

            this.$store.commit("SET_POPUP", {
              text: `Suppression réussie !`,
              color: "success",
              visible: true,
            });

            this.updateStudentFromDB();
          })
          .catch((error) => {
            this.$store.commit("SET_POPUP", {
              text: `Suppression échouée : ${error}`,
              color: "error",
              visible: true,
            });
          });
      }
    },
    editStudent(student) {
      this.$router.replace({ query: { studentId: student.id } })
      this.showStudentContent = true
    },
    updateStudent(student, payload) {
      payload.id = student.id;
      this.loadingDatas = true;
      this.$store.dispatch("updateStudent", payload).then(() => {
        this.updateStudentFromDB();
      });
    },

    openDialogDelete(studentId) {
      this.idToDelete = studentId;
      this.dialogDelete = true;
    },
  },
};
</script>
<style>
.paddingDialog {
  box-shadow: none;
}
</style>

<style scoped>
.connectionPoint {
  width: 14px;
  height: 14px;
  border-radius: 14px;
  margin: 6px;
}
</style>
