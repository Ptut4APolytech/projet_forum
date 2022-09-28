<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <div :class="[`d-flex justify-space-between align-top ${color}`]">
        <v-card-title :class="[`${textColor}--text`]">
          {{ text }}
        </v-card-title>

        <v-btn
          class="mr-2 mt-3"
          plain
          x-small
          :color="textColor"
          @click="onCancel()"
        >
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="py-2">
        {{ subText }}
      </v-card-text>

      <v-card-text class="py-2" @copy.prevent>
        Merci de saisir le texte suivant pour confirmer:
        <span class="font-weight-bold">{{ confirmText }}</span>
        <v-col sm="9" md="6">
          <v-text-field v-model="confirm" required outlined @paste.prevent />
        </v-col>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <!-- Cancel button -->
        <v-btn outlined :color="color" @click="onCancel()">
          {{ textCancel }}
        </v-btn>
        <!-- Confirm button -->
        <v-btn :class="color" @click="onConfirm()" :disabled="disabledButton">
          {{ textConfim }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialogText",

  props: {
    visible: { type: Boolean, default: false },
    color: { type: String, default: "primary" },
    textColor: { type: String, default: "white" },
    text: { type: String, default: "Êtes-vous sûr ?" },
    subText: { type: String, default: "Cette action est irréversible" },
    confirmText: { type: String, default: "CONFIRMER" },
    textCancel: { type: String, default: "Annuler" },
    textConfim: { type: String, default: "Confirmer" },
  },

  data: () => ({
    dialog: true,
    confirm: "",
    shakeSumbit: false,

    disabledButton: true
  }),

  watch: {

    confirm(newText) {
      if(newText == this.confirmText) {
        this.disabledButton = false;
      }
      else {
        this.disabledButton = true;
      }
    }
  },

  methods: {
    onConfirm() {
      if (this.confirm == this.confirmText) {
        this.shakeSumbit = false;
        this.dialog = false;
        this.$emit("confirm");
      } else {
        this.shakeSumbit = true;
      }
    },
    onCancel() {
      this.dialog = false;
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped>
.v-card__text {
  color: black !important;
}
</style>