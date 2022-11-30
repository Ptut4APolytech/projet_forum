<template>
  <div>
    <v-card
        v-show="studentId != null"
        class="ml-1 mr-1"
        outlined
        :loading="loadingDatas"
    >
      <!-- Contenu vide en cas de chargement de données -->
      <div v-if="loadingDatas">
        <p></p>
      </div>

      <div v-else>
        <!-- Header de l'offre -->
        <div class="header d-flex flex-column justify-space-between">
          <div class="d-flex justify-space-between align-top">
            <div class="d-flex align-center">
              <v-avatar size="55" :ref="renderImg" class="tertiary">
                <img v-if="imgs[student.id]" :src="imgs[student.id]" />
                <div v-else class="accent--text">
                  {{
                    (
                        student.user.firstname.charAt(0) +
                        student.user.lastname.charAt(0)
                    ).toUpperCase()
                  }}
                </div>
              </v-avatar>
              <div>
                <v-card-title>
                  {{ student.user.firstname }} {{ student.user.lastname }}
                </v-card-title>
                <v-card-subtitle> {{ student.user.email }}</v-card-subtitle>
              </div>
            </div>

            <v-btn class="pt-5 pr-3" plain x-small color="dark" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Valeur des boutons pour postuler -->
          <v-card-actions>
            <template v-if="isAlreadySelected">
              <v-btn disabled>
                <v-icon class="mr-2">mdi-check</v-icon>
                Ajouté
              </v-btn>

              <v-btn outlined color="error" @click="unselectStudent()">
                <v-icon class="mr-2">mdi-close</v-icon>
                Retirer
              </v-btn>
            </template>

            <template v-else>
              <v-btn color="primary" @click="selectStudent()">
                Ajouter à mes voeux
              </v-btn>
            </template>
          </v-card-actions>
        </div>

        <div class="content">
          <v-card-text>
            {{ student.description }}
          </v-card-text>

          <!-- Boutons de téléchargement des pièces jointes -->
          <div v-if="student.cvPath">
            <v-card-title class="pb-0">Pièce(s) jointe(s)</v-card-title>
            <v-divider class="mx-4" />
            <v-card-actions class="mx-2">
              <v-btn
                  :key="student.cvPath"
                  @click="downloadFile(student.cvPath)"
                  color="secondary"
                  outlined
              >
                Télécharger CV
                <v-icon right> mdi-download </v-icon>
              </v-btn>
            </v-card-actions>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { getStudent, downloadFile } from "../../../services/api";
import { saveAs } from "file-saver";

const path = require("path");

export default {
  name: "Wish",

  props: ["orderedStudentIds"],

  data: () => ({
    loadingDatas: true,
    student: null,
    studentId: null,

    imgs: {},
    renderImg: 0,
  }),

  created() {
    this.hasQueryStudentId();
  },

  watch: {
    "$route.query.studentId": function () {
      this.hasQueryStudentId();
    },
  },

  computed: {
    // Vérifie si le représentant courant a ajouté l'étudiant à ses voeux
    isAlreadySelected() {
      return this.orderedStudentIds.includes(this.studentId) ? true : false;
    },
  },
  methods: {
    // Récupère une offre dans l'API
    getStudent() {
      this.loadingDatas = true;

      getStudent(this.studentId)
        .then((res) => {
          this.student = res.data;
          this.getAvatarSrc(this.student);

          this.loadingDatas = false;
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    getAvatarSrc(student) {
      if (this.imgs[student.id]) {
        return this.imgs[student.id];
      }
      if (!student.user.avatarPath) {
        this.imgs[student.id] = undefined;
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

    // Téléchargement d'un fichier
    downloadFile(filePath) {
      downloadFile(filePath)
        .then((res) => {
          saveAs(res.data, path.basename(filePath));
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },

    // Vérifie si un query param est dans l'URL
    hasQueryStudentId() {
      if (this.$route.query.studentId) {
        this.studentId = this.$route.query.studentId;
        this.getStudent();
      } else {
        this.studentId = null;
      }
    },

    // Change les queryParam pour fermer la fenêtre
    close() {
      let query = Object.assign({}, this.$route.query);
      delete query.studentId;
      this.$router.replace({ query });
    },

    // Retourne le nom d'un fichier selon un chemin
    getFilename(filePath) {
      return path.basename(filePath);
    },

    selectStudent() {
      this.orderedStudentIds.push(this.studentId);
      this.$emit("selectedStudentId", this.studentId);
    },

    unselectStudent() {
      this.orderedStudentIds.splice(
        this.orderedStudentIds.indexOf(this.studentId),
        1
      );
      this.$emit("unselectedStudentId", this.studentId);
    },
  },
};
</script>

<style scoped>
.header {
  height: 150px;
  border-bottom: 1px solid rgb(170, 170, 170);
  box-shadow: 0 6px 6px -6px grey;
}
.content {
  max-height: calc(100vh - 250px);
  white-space: pre-wrap;
  overflow: auto;
  overflow-x: hidden;
}
.v-avatar {
  margin-top: 20px;
  margin-left: 10px;
}
</style>
