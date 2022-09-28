<template>
  <div>
    <v-dialog v-model="dialog" max-width="1000px" persistent scrollable>
      <v-card>
        <v-overlay v-if="loadingDatas" absolute>
          <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>
        <div class="d-flex justify-space-between align-top dialog-header">
          <v-card-title> Modifier une offre </v-card-title>

          <v-btn class="mr-2 mt-3" plain x-small @click="onClose()">
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-divider />
        <v-card-text class="py-5">
          <v-text-field
            v-model.trim="editedOffer.title"
            label="Titre de l'offre *"
            outlined
            rows="8"
            :rules="[rules.required]"
          />

          <v-subheader>
            Mots-clés:
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
            v-model.trim="tags"
            tags
            clearable
            multiple
            outlined
            hint="Maximum de 5 mots-clés"
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
            auto-grow
            full-width
            v-model.trim="editedOffer.content"
            label="Description"
            hint="Présentation des missions, compétences requises, lieu..."
            rows="8"
          />

          <v-container>
            <v-subheader>Pièce(s) jointe(s)</v-subheader>
            <div v-if="editedOffer.files">
              <div v-for="file in editedOffer.files" :key="file">
                <div class="d-flex ml-3" style="gap: 10px">
                  <v-icon large>mdi-file-pdf-box</v-icon>
                  <div style="pointer-events: none" class="align-self-center">
                    {{ getFilename(file) }}
                  </div>
                  <v-btn @click="viewDocument(file)" icon
                    ><v-icon>mdi-eye</v-icon></v-btn
                  >
                  <v-btn
                    @click="
                      dialogDelete = true;
                      selected = file;
                    "
                    icon
                    ><v-icon>mdi-delete</v-icon></v-btn
                  >
                </div>
              </div>
            </div>

            <v-btn color="primary" outlined @click="toggleAdd">
              <v-icon> mdi-paperclip </v-icon>
              Ajouter une pièce jointe
            </v-btn>
          </v-container>
          <small class="error--text">* Champs obligatoires</small>
        </v-card-text>

        <v-divider />
        <v-card-actions
          :class="limitWidth && editedOffer.status !== 'validated' ? '' : 'flex-wrap justify-end'"
        >
          <v-btn
            v-if="editedOffer.status !== 'validated'"
            :class="[limitWidth ? 'mr-auto' : '']"
            color="secondary"
            @click="submit(true)"
            outlined
            :disabled="isDisableButton"
          >
            Demander validation
          </v-btn>

          <div :class="[limitWidth ? '' : 'flex-nowrap mt-2']">
            <v-btn class="px-2 mx-2" color="error" @click="onClose()" outlined> Annuler </v-btn>
            <v-btn
              class="px-2"
              color="primary"
              @click="submit()"
              :disabled="isDisableButton"
            >
              Modifier
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAdd" width="70%">
      <div style="background-color: white" class="pa-5">
        <v-file-input
          outlined
          label="Document"
          v-model="file"
          accept="application/pdf"
          @change="loadDocument"
        />
        <pdf
          v-if="viewer"
          style="height: 60vh; overflow-y: auto"
          :src="viewer"
        />
        <div
          v-if="blob"
          style="justify-content: right; display: flex; gap: 10px"
          class="mt-5"
        >
          <v-btn
            @click="
              toggleAdd();
              viewer = null;
              bolb = null;
            "
            color="error"
            outlined
            >Annuler</v-btn
          >
          <v-btn @click="uploadDocument" color="primary">Valider</v-btn>
        </div>
      </div>
    </v-dialog>

    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer la pièce jointe ?"
      subText="Cette action est réversible si vous ne pas modifier l'offre"
      color="warning"
      @confirm="deleteDocument"
    />
  </div>
</template>

<script>
import path from "path";
import pdf from "vue-pdf";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getOffer } from "../../../services/api";

export default {
  name: "EditOfferDialog",

  components: {
    pdf,
    ConfirmDialog,
  },

  props: {
    id: { type: String, default: "0" },
  },

  data: () => ({
    dialog: true,
    loadingDatas: true,
    editedOffer: {},
    tags: {},

    showAdd: false,
    file: null,
    viewer: null,
    blob: null,
    selected: null,
    dialogDelete: false,

    newData: [],
    removeData: [],

    rules: {
      required: (value) => !!value || "Obligatoire",
    },

    windowWidth: window.innerWidth,
  }),

  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  created() {
    this.findOfferById(this.id);
  },
  watch: {
    id(value) {
      this.findOfferById(value);
    },
    tags(val) {
      if (val.length > 5) {
        this.$nextTick(() => this.tags.pop());
      }
    },
  },

  computed: {
    isDisableButton() {
      return !this.editedOffer.title || this.editedOffer.status === 'waiting';
    },

    limitWidth() {
      return this.windowWidth > 480;
    }
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    submit(askValidation = false) {
      this.loadingDatas = true;

      for (let i in this.newData){
        this.$store
          .dispatch("uploadFile", this.newData[i])
          .catch((err) => {
            this.$store.commit("SET_POPUP", {
              text: `Echec de l'import : ${err}`,
              color: "error",
              visible: true,
            });
          })
      }

      for (let i in this.removeData){
        this.$store
          .dispatch("removeFile", {
            path: this.removeData[i],
          })
          .catch((err) => {
            this.$store.commit("SET_POPUP", {
              text: `Echec de la suppression : ${err}`,
              color: "error",
              visible: true,
            });
          });
      }

      let payload = {
        id: this.editedOffer.id,
        title: this.editedOffer.title,
        content: this.editedOffer.content,
        files: this.editedOffer.files,
        tags: this.tags,
      };

      if (askValidation) {
        payload.status = "waiting";
      }

      this.$store
        .dispatch("updateOffer", payload)
        .then(() => {
          this.dialog = false;
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour réussie !`,
            color: "success",
            visible: true,
          });

          let query = Object.assign({}, this.$route.query);
          delete query.offerId;
          this.$router.replace({ query });
          this.$emit("close", true);
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        })
        .finally(() => {
          this.loadingDatas = false;
        });
    },

    findOfferById(id) {
      getOffer(id)
        .then((res) => {
          this.editedOffer = res.data;
          this.tags = this.editedOffer.tags;
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

    onClose() {
      this.dialog = false;
      this.$emit("close", false);
    },

    removeTag(key) {
      this.editedOffer.tags.splice(this.editedOffer.tags.indexOf(key), 1);
    },

    toggleAdd() {
      this.file = null;
      this.showAdd = !this.showAdd;
    },

    // Retourne le nom d'un fichier selon un chemin
    getFilename(filePath) {
      return path.basename(filePath);
    },

    async viewDocument(file) {
      if (!this.viewer) {
        let result = await this.$store.dispatch("downloadFile", {
          path: file,
        });
        let fr = new FileReader();
        fr.onload = () => {
          this.viewer = Uint8Array.from(atob(fr.result.split(",")[1]), (c) =>
            c.charCodeAt(0)
          );
          this.toggleAdd();
        };
        fr.readAsDataURL(result.data);
      } else {
        this.toggleAdd();
      }
    },

    loadDocument(value) {
      let reader = new FileReader();
      reader.onload = () => {
        this.blob = new Blob([reader.result]);
        this.viewer = new Uint8Array(reader.result);
      };
      reader.readAsArrayBuffer(value);
    },

    uploadDocument() {
      this.showAdd = false;

      let data = new FormData();
      let filePath = this.editedOffer.companyId + "/" + this.file.name;
      this.editedOffer.files.push(filePath);

      data.append("path", filePath);
      data.append("file", this.blob);

      this.newData.push(data);
    },

    deleteDocument() {
      let pos = this.editedOffer.files.indexOf(this.selected);
      this.removeData.push(this.selected);
      this.editedOffer.files.splice(pos, 1);
    },
  },
};
</script>

<style scoped>
</style>
