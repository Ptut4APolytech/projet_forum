<template>
  <div>
    <v-dialog v-model="dialog" max-width="1000px" persistent scrollable>
      <v-card>
        <v-overlay v-if="loadingDatas" absolute>
          <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>
        <div class="d-flex justify-space-between align-top dialog-header">
          <v-card-title> Créer une offre </v-card-title>

          <v-btn class="mr-2 mt-3" plain x-small @click="onClose()">
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>
        <v-divider />

        <v-card-text class="py-5">
          <v-text-field
            v-model.trim="title"
            label="Titre de l'offre *"
            outlined
            :rules="[rules.required]"
            autofocus
          />

          <v-subheader>
            Mots-clés :
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
            v-model.trim="content"
            label="Description"
            hint="Présentation des missions, compétences requises, lieu..."
            rows="8"
          />

          <v-container>
            <v-subheader>Pièce(s) jointe(s)</v-subheader>
            <div v-if="path.length">
              <div v-for="file in path" :key="file">
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
        <v-card-actions :class="[limitWidth ? '': 'flex-wrap justify-end']">
          <v-btn
            :class="[limitWidth ? 'mr-auto': '']"
            color="secondary"
            @click="submit(true)"
            outlined
            :disabled="isDisableButton"
          >
            Créer et demander validation
          </v-btn>
          <div :class="[limitWidth ? '': 'flex-nowrap mt-2']">
            <v-btn class="mx-2 px-2" color="error" @click="onClose()" outlined> Annuler </v-btn>
            <v-btn
              clas="px-2"
              color="primary"
              @click="submit()"
              :disabled="isDisableButton"
            >
              Créer
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
              blob = null;
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
      color="error"
      @confirm="deleteDocument"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import pdf from "vue-pdf";
import path from "path";
import ConfirmDialog from "@/components/ConfirmDialog";

export default {
  name: "CreateOfferDialog",

  components: {
    pdf,
    ConfirmDialog,
  },

  data: () => ({
    dialog: true,
    loadingDatas: false,

    title: "",
    content: "",
    tags: ["Frontend", "Backend"],

    showAdd: false,
    file: null,
    blob: null,
    viewer: null,
    path: [],

    dialogDelete: false,
    selected: null,

    newData: [],

    rules: {
      required: (value) => !!value || "Obligatoire",
    },

    windowWidth: window.innerWidth
  }),

  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  watch: {
    tags(value) {
      if (value.length > 5) {
        this.$nextTick(() => this.tags.pop());
      }
    },
  },

  computed: {
    ...mapGetters({
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
    }),
    isDisableButton() {
      return !this.title;
    },

    limitWidth() {
      return this.windowWidth > 549;
    }
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    onClose() {
      this.dialog = false;
      this.$emit("close");
    },

    async submit(askValidation = false) {
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

      let payload = {
        title: this.title,
        content: this.content,
        companyId: this.currentRepresentative.companyId,
        tags: this.tags,
        files: this.path,
      };

      if (askValidation) {
        payload.status = "waiting";
      }

      this.$store
        .dispatch("registerOffer", payload)
        .then(() => {
          this.onClose();

          this.$store.commit("SET_POPUP", {
            text: `Création réussie !`,
            color: "success",
            visible: true,
          });

          this.$emit("reload");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Création échouée : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
        })
        .finally(() => {
          this.loadingDatas = false;
        });
    },

    removeTag(key) {
      this.tags.splice(this.tags.indexOf(key), 1);
    },

    toggleAdd() {
      this.file = null;
      this.showAdd = !this.showAdd;
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
      let filePath = this.currentRepresentative.companyId + "/" + this.file.name;
      this.path.push(filePath);

      data.append("path", filePath);
      data.append("file", this.blob);

      this.newData.push(data);
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

    deleteDocument() {
      let pos = this.path.indexOf(this.selected);
      this.path.splice(pos, 1);
    },
  },
};
</script>

<style scoped>
</style>
