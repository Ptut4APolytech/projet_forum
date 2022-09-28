<template>
  <v-snackbar
    top
    v-model="localPopup.visible"
    :timeout="4500"
    :color="localPopup.color"
  >
    <v-icon class="pr-3" dark large>
      {{
        localPopup.color == "error"
          ? "mdi-alert-circle-outline"
          : "mdi-checkbox-marked-circle-outline"
      }}</v-icon
    >
    {{ localPopup.text }}

    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="reset()"> Fermer </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "PopUpAlert",

  data: () => ({
    timer: null,
    localPopup: {
      visible: false,
      text: null,
      color: null,
    },
  }),

  watch: {
    popup(newValue) {
      if (Object.keys(newValue) != 0) {
        this.localPopup = { ...newValue };
        this.$store.commit("SET_POPUP", {});
      }
    },
  },

  computed: {
    ...mapGetters({
      popup: "GET_POPUP",
    }),
  },

  methods: {
    reset() {
      this.localPopup.visible = false;
      this.$store.commit("SET_POPUP", {});
      // Temps d'attente pour avoir l'animation de fermeture en faded avant suppression du popup
      setTimeout(() => {}, 100);
    },
  },
};
</script>

<style scoped>
</style>
