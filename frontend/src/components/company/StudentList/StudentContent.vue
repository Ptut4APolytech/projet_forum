<template>
  <div>
    <v-card
      v-show="isStudentId"
      class="ml-1 mr-1"
      outlined
      :loading="loadingDatas"
    >
      <!-- Contenu vide en cas de chargement de données -->
      <div v-if="loadingDatas">
        <p></p>
      </div>

      <!-- Si la page est fini de charger les données -->
      <div v-else>
        <!-- Header de l'offre -->
        <div class="header d-flex flex-column justify-space-between">
          <div class="d-flex justify-space-between align-top">
            <div class="d-flex">
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

          <v-card-actions v-if="user.role === 'representative'">
            <v-btn
              color="primary"
              @click="selectStudent()"
              :disabled="onAllOffer || loadingButton"
            >
              <v-progress-circular
                v-if="loadingButton"
                size="25"
                indeterminate
              ></v-progress-circular>
              <template v-else> Ajouter à mes voeux </template>
            </v-btn>
            <v-tooltip color="secondary" bottom v-if="onAllOffer">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon> mdi-help-circle </v-icon>
                </v-btn>
              </template>

              <span>
                Vous avez déjà ajouté cet étudiant à toutes vos offres valides
              </span>
            </v-tooltip>
          </v-card-actions>
          <v-card-actions v-if="user.role === 'admin'">
            <v-btn
              color="success"
              v-if="
                student.status === 'waiting' ||
                student.status === 'notValidated'
              "
              @click="validateStudent"
            >
              Valider
            </v-btn>
            <v-btn v-else disabled>
              <v-icon class="mr-2">mdi-check</v-icon>
              Validé
            </v-btn>
            <v-btn
              color="error"
              v-if="student.status === 'waiting'"
              @click="showReasonDialog = true"
            >
              Refuser
            </v-btn>
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

      <StudentWishDialog
        v-model="dialogWish"
        :student="student"
        @reload="getOfferByCompanyId"
      />
    </v-card>

    <v-dialog
      v-model="showReasonDialog"
      max-width="600px"
      persistent
      scrollable
    >
      <v-card>
        <div :class="[`d-flex justify-space-between align-top error`]">
          <v-card-title :class="[`white--text`]"> Motif du refus </v-card-title>

          <v-btn
            class="mr-2 mt-3"
            plain
            x-small
            color="white"
            @click="showReasonDialog = false"
          >
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-textarea outlined v-model="reason" class="ma-3" label="Motif">
        </v-textarea>

        <v-divider />
        <v-card-actions>
          <v-spacer />
          <!-- Cancel button -->
          <v-btn outlined color="error" @click="showReasonDialog = false">
            Annuler
          </v-btn>
          <!-- Confirm button -->
          <v-btn class="error" @click="invalidateStudent"> Envoyer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  downloadFile,
  getOfferByCompanyId,
  getStudent,
  //updateOffer,
} from "../../../services/api";
import { saveAs } from "file-saver";
import path from "path";
import StudentWishDialog from "../wish/WishDialog";
import { mapGetters } from "vuex";

export default {
  name: "StudentContent",

  components: {
    StudentWishDialog,
  },

  data: () => ({
    loadingDatas: true,
    loadingButton: true,
    isStudentId: false,
    student: null,
    imgs: {},
    renderImg: 0,
    showReasonDialog: false,
    dialogWish: false,
    offerByCompanyId: [],
    reason: "",

    onAllOffer: false,
  }),

  created() {
    this.hasQueryStudentId();
    this.getOfferByCompanyId();
  },
  computed: {
    ...mapGetters({
      user: "GET_CURRENT_USER",
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
    }),
  },
  watch: {
    "$route.query.studentId": function () {
      this.hasQueryStudentId();
    },
    student() {
      this.getOfferByCompanyId();
    },
  },

  methods: {
    // Vérifie si un query param est dans l'URL
    hasQueryStudentId() {
      if (this.$route.query.studentId) {
        this.isStudentId = true;
        this.getStudent();
      } else {
        this.isStudentId = false;
      }
    },

    // Récupère une offre dans l'API
    getStudent() {
      const studentId = this.$route.query.studentId;
      this.loadingDatas = true;
      getStudent(studentId)
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

    close() {
      let query = Object.assign({}, this.$route.query);
      delete query.studentId;
      this.$router.replace({ query });
      this.$emit("close");
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
    validateStudent() {
      let payload = {
        id: this.student.id,
        status: "validated",
      };
      this.$store
        .dispatch("updateStudent", payload)
        .then(() => {
          this.getStudent();
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
          this.$emit("update");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        });
    },
    invalidateStudent() {
      this.showReasonDialog = false;
      let payload = {
        id: this.student.id,
        status: "notValidated",
        reason: this.reason,
      };
      this.$store
        .dispatch("updateStudent", payload)
        .then(() => {
          this.getStudent();
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
          this.$emit("update");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
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

    selectStudent() {
      this.dialogWish = true;
    },

    getOfferByCompanyId() {

      // Réinitialisation d'éléments
      this.loadingButton = true;
      this.onAllOffer = false;

      this.offerByCompanyId = [];
      getOfferByCompanyId(this.currentRepresentative.companyId, "validated")
        .then((res) => {
          let noFilterOffers = res.data;
          for (let offer of noFilterOffers) {
            if (
              this.student &&
              !offer.orderedStudents.includes(this.student.id)
            ) {
              this.offerByCompanyId.push(offer);
            }
          }
          if (this.offerByCompanyId.length === 0) {
            this.onAllOffer = true;
          } else {
            this.onAllOffer = false;
          }
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Erreur : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        })
        .finally(() => {
          this.loadingButton = false;
        });
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
