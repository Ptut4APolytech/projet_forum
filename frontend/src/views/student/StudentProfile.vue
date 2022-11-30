<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mr-2 ml-1 mb-3">
      <h1 class="primary--text text-h4">Mon profil</h1>

      <v-chip
        v-if="student.status === 'validated'"
        class="pa-4"
        color="success"
        label
      >
        Profil validé
        <v-icon class="ml-2"> mdi-check-circle-outline </v-icon>
      </v-chip>
      <v-chip
        v-else-if="student.status === 'waiting'"
        class="pa-4"
        color="warning"
        label
      >
        En attente de validation
        <v-icon class="ml-2"> mdi-timer-sand </v-icon>
      </v-chip>
      <v-chip v-else class="pa-4" color="error" label>
        Profil incomplet
        <v-icon class="ml-2"> mdi-alert-circle-outline </v-icon>
      </v-chip>
    </div>

    <v-card class="pa-5">
      <user-profile
        @updateUser="updateUser"
        @updateAvatar="updateAvatar"
        :user="currentUser"
      ></user-profile>

      <v-subheader
        >Mots-clés *:
        <v-tooltip color="secondary" right>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon> mdi-help-circle </v-icon>
            </v-btn>
          </template>
          <span>Appuyer sur Entrée pour ajouter un tag</span>
        </v-tooltip>
      </v-subheader>

      <v-combobox
        v-model="student.tags"
        tags
        clearable
        multiple
        outlined
        hint="Maximum de 5 mots-clés définissant vos compétences ou technologies préférées"
      >
        <template v-slot:selection="{ attrs, item, select, selected }">
          <v-chip
            v-bind="attrs"
            :input-value="selected"
            close
            @click="select"
            @click:close="removeTag(item)"
          >
            <strong>{{ item }}</strong
            >&nbsp;
          </v-chip>
        </template>
      </v-combobox>

      <v-textarea
        outlined
        label="Description"
        hint="Présentation de votre parcours, vos expériences, etc. à l'attention des entreprises"
        v-model="student.description"
      >
      </v-textarea>
      <v-card class="mb-5 pa-3">
        <h1 class="ml-3 mb-3">CV</h1>
        <v-btn v-if="!student.cvPath" class="ml-3 mb-3" @click="toggleAddCV"
        color="secondary"
        outlined
          >
          <v-icon>mdi-paperclip</v-icon>
          Ajouter un CV
          </v-btn>
        <div v-else class="d-flex ml-3" style="gap: 10px">
          <v-icon large>mdi-file-pdf-box</v-icon>
          <div style="pointer-events: none" class="align-self-center">
            {{ student.cvPath.split("/")[1] }}
          </div>
          <v-btn @click="viewCV" icon><v-icon>mdi-eye</v-icon></v-btn>
          <v-btn @click="dialogDelete = true" icon
            ><v-icon>mdi-delete</v-icon></v-btn
          >
        </div>
      </v-card>
      <div style="display: flex; gap: 10px" class="bottom-button">
        <v-btn
          v-if="student.status === 'waiting' && !waitingValidation"
          disabled
        >
          <v-icon class="mr-2">mdi-check</v-icon>
          En attente de validation
        </v-btn>
        <div v-else-if="student.status !== 'validated'">
          <v-btn v-if="waitingValidation" color="secondary" outlined>
            <v-progress-circular
              class="mr-1"
              indeterminate
              :size="20"
            ></v-progress-circular>
            Envoi demande
          </v-btn>
          <v-btn v-else color="secondary" @click="askValidation" outlined>
            Demander validation
          </v-btn>
        </div>
        <v-btn color="primary" @click="submit"> Sauvegarder </v-btn>
      </div>
    </v-card>
    <v-dialog v-model="showAddCV" :persistent="!student.cvPath" width="70%">
      <div style="background-color: white" class="pa-5">
        <v-file-input
          v-if="!student.cvPath"
          outlined
          label="CV"
          v-model="cvFile"
          accept="application/pdf"
          @change="loadCV"
        ></v-file-input>
        <pdf
          style="height: 60vh; overflow-y: auto"
          :style="student.cvPath ? 'height: 75vh' : ''"
          v-if="cvViewer"
          :src="cvViewer"
        ></pdf>
        <div
          v-if="!student.cvPath"
          style="justify-content: right; display: flex; gap: 10px"
          class="mt-5"
        >
          <v-btn
            @click="
              toggleAddCV();
              cvViewer = null;
            "
            >Annuler</v-btn
          >
          <v-btn @click="uploadCV" :disabled="!cvFile || cvFile === {}">Valider</v-btn>
        </div>
      </div>
    </v-dialog>
    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer le CV ?"
      color="error"
      @confirm="deleteCV"
    />
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UserProfile from "@/components/user/UserProfile";
import pdf from "vue-pdf";
import ConfirmDialog from "@/components/ConfirmDialog";

export default {
  name: "StudentProfile",
  components: { UserProfile, pdf, ConfirmDialog },
  data: () => ({
    user: {
      id: "",
      firstname: "",
      lastname: "",
      password: "",
      avatarPath: "",
    },
    student: {
      id: "",
      description: "",
      cvPath: "",
      tags: [],
    },

    loading: false,
    showAddCV: false,
    cvFile: null,
    avatarFile: null,
    cvBlob: null,
    cvViewer: null,
    dialogDelete: false,
    waitingValidation: false,
  }),

  watch: {
    "student.tags": (newValue) => {
      if (newValue.length > 5) {
        newValue.pop();
      }
    },
  },

  computed: {
    ...mapGetters({
      currentStudent: "GET_CURRENT_STUDENT",
      currentUser: "GET_CURRENT_USER",
    }),
  },

  async created() {
    this.user = this.currentUser;
    this.student = this.currentStudent;
    if (this.student.cvPath) this.cvFile = {};
  },
  methods: {
    updateUser(value) {
      this.user = value;
    },
    updateAvatar(value) {
      this.avatarFile = value;
    },
    removeTag(key) {
      this.student.tags.splice(this.student.tags.indexOf(key), 1);
    },
    async submit() {
      this.loading = true;

      if (this.cvFile && this.cvFile.name) {
        let reader = new FileReader();
        let filePath = this.student.id + "/" + this.cvFile.name;
        this.student.cvPath = filePath;
        reader.onload = () => {
          var data = new FormData();
          var blob = new Blob([reader.result]);
          data.append("path", filePath);
          data.append("file", blob);
          this.$store.dispatch("uploadFile", data).catch((err) => {
            this.$store.commit("SET_POPUP", {
              text: `Mise à jour échouée : ${err}`,
              color: "error",
              visible: true,
            });
          });
        };
        reader.readAsArrayBuffer(this.cvFile);
      }

      if (this.avatarFile && this.avatarFile.name) {
        let reader = new FileReader();
        let filePath = this.user.id + "/" + this.avatarFile.name;
        this.user.avatarPath = filePath;
        reader.onload = () => {
          var data = new FormData();
          var blob = new Blob([reader.result]);
          data.append("path", filePath);
          data.append("file", blob);
          this.$store.dispatch("uploadFile", data).catch((err) => {
            this.$store.commit("SET_POPUP", {
              text: `Mise à jour échouée : ${err}`,
              color: "error",
              visible: true,
            });
          });
        };
        reader.readAsArrayBuffer(this.avatarFile);
      }

      await this.$store.dispatch("updateUser", this.user).catch((err) => {
        this.$store.commit("SET_POPUP", {
          text: `Mise à jour échouée : ${err}`,
          color: "error",
          visible: true,
        });
      });

      await this.$store
        .dispatch("updateStudent", this.student)
        .then(() => {
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        });

      let newStudent = this.currentStudent;
      let newUser = this.currentUser;
      this.$store.commit("SET_CURRENT_USER", newUser);
      this.$store.commit("SET_CURRENT_STUDENT", newStudent);
      this.loading = false;
    },
    toggleAddCV() {
      this.cvFile = null;
      this.cvBlob = null;
      this.showAddCV = !this.showAddCV;
    },
    loadCV(value) {
      if (!value || value.type !== 'application/pdf') {
        this.$nextTick(() => {
          this.cvFile = null
        })
        this.$store.commit("SET_POPUP", {
          text: "Veuillez sélectionner un fichier PDF",
          color: "error",
          visible: true,
        });
        return
      }
      let reader = new FileReader();
      reader.onload = () => {
        this.cvBlob = new Blob([reader.result]);
        this.cvViewer = new Uint8Array(reader.result);
      };
      reader.readAsArrayBuffer(value);
    },
    uploadCV() {
      this.loading = true;
      this.showAddCV = !this.showAddCV;

      var data = new FormData();
      let filePath = this.student.id + "/" + this.cvFile.name;
      this.student.cvPath = filePath;

      data.append("path", filePath);
      data.append("file", this.cvBlob);
      this.$store
        .dispatch("uploadFile", data)
        .then(() => {
          this.$store
            .dispatch("updateStudent", this.student)
            .then(() => {
              this.$store.commit("SET_POPUP", {
                text: "Mise à jour réussie !",
                color: "success",
                visible: true,
              });
            })
            .catch((err) => {
              this.$store.commit("SET_POPUP", {
                text: `Mise à jour échouée : ${err}`,
                color: "error",
                visible: true,
              });
            });
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        })
        .finally(() => {
          this.loading = false;
          this.cvViewer = null;
          this.cvBlob = null;
        });
    },
    async viewCV() {
      if (!this.cvViewer) {
        this.loading = true;
        let result = await this.$store.dispatch("downloadFile", {
          path: this.student.cvPath,
        });
        this.loading = false;
        let fr = new FileReader();
        fr.onload = () => {
          this.cvViewer = Uint8Array.from(atob(fr.result.split(",")[1]), (c) =>
            c.charCodeAt(0)
          );
          this.toggleAddCV();
        };
        fr.readAsDataURL(result.data);
      } else {
        this.toggleAddCV();
      }
    },
    deleteCV() {
      this.loading = true;
      this.student.cvPath = null;
      this.cvViewer = null;
      this.$store
        .dispatch("updateStudent", this.student)
        .then(() => {
          this.$store.commit("SET_POPUP", {
            text: "Mise à jour réussie !",
            color: "success",
            visible: true,
          });
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err}`,
            color: "error",
            visible: true,
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    async askValidation() {
      await this.submit()
      this.waitingValidation = true;
      this.student.status = "waiting";
      this.$store
        .dispatch("updateStudent", this.student)
        .then(() => {
          this.waitingValidation = false;
          this.$store.commit("SET_POPUP", {
            text: "Demande envoyée !",
            color: "success",
            visible: true,
          });
        })
        .catch((err) => {
          this.waitingValidation = false;
          this.$store.commit("SET_POPUP", {
            text: `Echec de la demande : ${err}`,
            color: "error",
            visible: true,
          });
        });
    },
  },
};
</script>

<style>
.bottom-button {
  justify-content: end;
}
@media (max-width: 960px) {
  .bottom-button {
    justify-content: center;
    flex-direction: column;
  }
}
</style>
