<template>
  <div>
    <v-card class="px-0" outlined :loading="loadingDatas">
      <div v-if="loadingDatas">
        <p></p>
      </div>

      <v-card-title
        v-else-if="orderedOffers.length == 0 && tempOrderedOffers.length == 0"
      >
        Aucun voeu trouvé, postulez à une offre pour continuer
      </v-card-title>

      <div v-else>
        <div class="d-flex justify-space-between align-center">
          <v-tooltip color="secondary" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon> mdi-help-circle </v-icon>
              </v-btn>
            </template>

            <span
              >Ordonnez vos voeux en utilisant la méthode du
              "glisser-déposer"</span
            >
          </v-tooltip>

          <v-card-actions>
            <v-btn v-if="loadingOrder" class="primary white--text">
              <v-progress-circular
                class="mr-1"
                indeterminate
                :size="20"
                color="white"
              ></v-progress-circular>
              Sauvegarde
            </v-btn>
            <v-btn
              v-else
              color="primary"
              @click="validateOrder()"
              :disabled="!snackbarVisible"
            >
              Sauvegarder
            </v-btn>
            <v-btn
              outlined
              color="primary"
              @click="resetOrder()"
              :disabled="loadingOrder"
            >
              Réinitialiser
            </v-btn>
          </v-card-actions>
        </div>

        <draggable
          v-model="tempOrderedOffers"
          group="offers"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false"
          class="mx-2"
        >
          <transition-group type="transition">
            <v-card
              outlined
              class="my-2"
              v-for="(offer, index) in tempOrderedOffers"
              :class="(index === 0 ? 'mt-0' : '') + ' ' + (offerId === offer.id ? 'v-btn--active' : '')"
              :key="offer.id"
              @click="selectOffer(offer.id)"
              hover
            >
              <div class="d-flex align-center justify-space-between grab">
                <div class="d-flex align-center">
                  <v-icon> mdi-drag </v-icon>
                  <div>
                    <v-card-title class="pt-1">{{ offer.title }}</v-card-title>

                    <v-card-subtitle class="pb-1">
                      {{ offer.company.name }}
                    </v-card-subtitle>
                  </div>
                </div>
                <div class="px-2 mr-2 grey white--text rounded-circle order-chip">
                  {{ index + 1 }}
                </div>
              </div>
            </v-card>
          </transition-group>
        </draggable>
      </div>
    </v-card>

    <v-snackbar
      v-model="snackbarVisible"
      timeout="-1"
      color="warning"
      top
      dense
    >
      <v-icon class="pr-1">mdi-alert-circle-outline</v-icon>
      Des modifications n'ont pas été sauvegardées
    </v-snackbar>
  </div>
</template>

<script>
import { searchOffers } from "../../../services/api";
import draggable from "vuedraggable";
import { mapGetters } from "vuex";

export default {
  name: "WishList",
  components: {
    draggable,
  },
  props: ["offerToAdd", "offerToDelete"],

  data: () => ({
    loadingDatas: true,
    loadingOrder: false,
    offerId: null,
    tempOrderedOffers: [],
    orderedOffers: [],
    offers: [],
    offerIds: [],

    snackbarVisible: false,
  }),
  watch: {
    // Conservation de offerId si contenu dans la route
    "$route.query.offerId": function () {
      this.offerId = this.$route.query.offerId
        ? this.$route.query.offerId
        : null;
    },

    offerToAdd(newOfferId) {
      if (newOfferId) {
        // Récupération de l'offre selon son identifiant
        let offerToAdd = null;
        for (let offer of this.offers) {
          if (offer.id == newOfferId) {
            offerToAdd = offer;
          }
        }

        // Ajout de l'offre dans la liste de voeux temporaire
        this.tempOrderedOffers.push(offerToAdd);
      }
    },

    offerToDelete(newOfferId) {
      if (newOfferId) {
        // Filtrage de tempOrder
        this.tempOrderedOffers = this.tempOrderedOffers.filter(function (
          offer
        ) {
          return offer.id != newOfferId;
        });
      }
    },

    tempOrderedOffers() {
      this.snackbarVisible = this.differentOrder();
    },
  },
  created() {
    if (this.currentStudent.orderedOffers.length > 0) {
      this.searchOffers();
    } else {
      this.loadingDatas = false;
    }
  },
  computed: {
    ...mapGetters({
      currentStudent: "GET_CURRENT_STUDENT",
    }),
    dragOptions() {
      return {
        animation: 200,
        delay: 100, // time in milliseconds to define when the sorting should start
        delayOnTouchOnly: true, // only delay if user is using touch
      };
    },
  },
  methods: {
    // Modification de la route lorsqu'une card est sélectionnée
    selectOffer(offerId) {
      this.$router.replace({ query: { offerId: offerId } });
    },
    // Appel à l'API
    searchOffers() {
      this.loadingDatas = true;

      let search = [
        {
          path: "id",
          operator: "in",
          value: this.currentStudent.orderedOffers,
        },
      ];

      searchOffers(search)
        .then((res) => {
          this.offers = res.data;

          // Offres mises dans l'ordre des voeux de l'étudiant
          this.orderedOffers = [];
          this.offerIds = [];
          for (let id of this.currentStudent.orderedOffers) {
            for (let offer of res.data) {
              if (offer.id == id) {
                this.orderedOffers.push(offer);

                this.offerIds.push(offer.id);
                break;
              }
            }
          }

          this.tempOrderedOffers = [...this.orderedOffers];
          this.loadingDatas = false;

          this.$emit("tempWishOrder", this.offerIds);
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
    resetOrder() {
      this.tempOrderedOffers = [...this.orderedOffers];
      this.$emit("tempWishOrder", this.offerIds);
    },
    validateOrder() {
      this.loadingOrder = true;
      this.snackbarVisible = false;

      // Récupération d'un tableau d'identifiant d'offres
      let newOrder = [];
      for (let offer of this.tempOrderedOffers) {
        newOrder.push(offer.id);
      }

      // Mise à jour de l'étudiant dans le store
      this.$store
        .dispatch("updateStudent", {
          id: this.currentStudent.id,
          orderedOffers: newOrder,
        })
        .then(() => {
          this.orderedOffers = [...this.tempOrderedOffers];
          this.loadingOrder = false;

          this.offerIds = newOrder;
          this.$emit("tempWishOrder", this.offerIds);

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
    },

    /**
     * Compare l'ordre de la liste temporaire et la liste originale
     */
    differentOrder() {
      if (this.tempOrderedOffers.length != this.orderedOffers.length) {
        return true;
      }

      for (let i = 0; i < this.tempOrderedOffers.length; i++) {
        if (this.orderedOffers[i].id != this.tempOrderedOffers[i].id) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>
<style scoped>
.v-btn--active,
.v-btn--active:before {
  background-color: rgba(0, 0, 0, 0.2) !important;
  opacity: none !important;
}

.v-card--hover:hover,
.v-card--hover:focus {
  box-shadow: none !important;
  background-color: rgba(0, 0, 0, 0.07);
  opacity: none !important;
  transition: background-color 100ms;
}

.order-chip {
  font-size: 1.2em;
  font-weight: bold;
}

.grab {
  cursor: grab !important;
}

.v-card__title {
  word-break: normal;
}
</style>