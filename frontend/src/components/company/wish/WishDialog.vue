<template>
  <v-dialog
    v-if="student"
    v-model="dialog"
    max-width="400px"
    persistent
    scrollable
  >
    <v-card>
      <v-overlay v-if="loadingDatas" absolute>
        <v-progress-circular indeterminate></v-progress-circular>
      </v-overlay>
      <div class="d-flex justify-space-between align-top dialog-header">
        <div>
          <v-card-title> Ajouter à mes voeux </v-card-title>
          <v-card-subtitle class="accent--text">
            Etudiant concerné :
            {{ student.user.firstname }}
            {{ student.user.lastname }}
          </v-card-subtitle>
        </div>

        <v-btn class="mr-2 mt-3" plain x-small @click="onClose()">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>
      <v-divider />

      <v-card-text class="py-2">
        <v-col>
          <v-select
            v-if="offers.length > 0"
            v-model="selected"
            required
            :items="offers"
            label="Offre sur laquelle lier l'étudiant"
            item-text="title"
            item-value="id"
            outlined
          />
          <v-card-text v-else> Aucune offre disponible </v-card-text>
        </v-col>
      </v-card-text>

      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn color="error" outlined @click="onClose()"> Annuler </v-btn>
        <v-btn
          v-if="offers.length > 0"
          color="primary"
          @click="submit()"
          :disabled="this.loadingDatas"
        >
          Ajouter
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { getOfferByCompanyId, updateOffer } from "../../../services/api";
import { mapGetters } from "vuex";

export default {
  name: "StudentModal",

  model: {
    prop: "visible",
    event: "setVisible",
  },

  props: {
    visible: { type: Boolean, default: false },
    student: { type: Object, default: null },
  },

  data: () => ({
    dialog: false,
    offerId: 0,
    offers: [],
    selected: {},
    loadingDatas: true,
  }),

  watch: {
    dialog(value) {
      this.$emit("setVisible", value);
    },
    visible(value) {
      this.dialog = value;
      if (value) {
        this.getOfferByCompanyId();
      }
    },
    student() {
      this.getOfferByCompanyId();
    },
  },

  computed: {
    ...mapGetters({
      currentRepresentative: "GET_CURRENT_REPRESENTATIVE",
    }),
  },

  created() {
    if (this.student) {
      this.getOfferByCompanyId();
    }
  },

  methods: {
    onClose() {
      this.offerId = 0;
      this.offers = [];
      this.selected = {};
      this.dialog = false;
    },

    getOfferByCompanyId() {
      this.offers = [];
      this.selected = {};
      this.loadingDatas = true;
      getOfferByCompanyId(this.currentRepresentative.companyId, "validated")
        .then((res) => {
          let noFilterOffers = res.data;
          for (let offer of noFilterOffers) {
            if (!offer.orderedStudents.includes(this.student.id)) {
              this.offers.push(offer);
            }
          }
          if (this.offers.length === 1) {
            this.selected = this.offers[0].id;
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
          this.loadingDatas = false;
        });
    },

    submit() {
      this.loadingDatas = true;
      for (let i in this.offers) {
        
        if (this.offers[i].id == this.selected) {
          
          let studentIds = this.offers[i].orderedStudents;
          studentIds.push(this.student.id);
          updateOffer(this.offers[i].id, { orderedStudents: studentIds })
            .then(() => {
              this.dialog = false;

              this.$store.commit("SET_POPUP", {
                text: `La sélection à réussie !`,
                color: "success",
                visible: true,
              });

              this.$emit("reload");
            })
            .catch((err) => {
              this.$store.commit("SET_POPUP", {
                text: `La sélection à échouée : ${err.response.data.message}`,
                color: "error",
                visible: true,
              });
            })
            .finally(() => {
              this.onClose();
              this.loadingDatas = false;
            });
        }
      }
    },
  },
};
</script>

<style scoped>
</style>
