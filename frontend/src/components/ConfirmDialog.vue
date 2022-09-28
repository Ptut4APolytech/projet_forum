<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <div :class="[`d-flex justify-space-between align-top ${color}`]">
        <v-card-title :class="[`${textColor}--text`]">
          {{ text }}
        </v-card-title>

        <v-btn class="mr-2 mt-3" plain x-small :color="textColor" @click="onCancel()">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="py-2">
        {{ subText }}
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <!-- Cancel button -->
        <v-btn outlined :color="color" @click="onCancel()">
          {{ textCancel }}
        </v-btn>
        <!-- Confirm button -->
        <v-btn :class="color" @click="onConfirm()">
          {{ textConfim }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",

  model: {
    prop: "visible",
    event: "setVisible",
  },

  props: {
    visible: { type: Boolean, default: false },
    text: { type: String, default: "Êtes-vous sûr ?" },
    subText: { type: String, default: "Cette action est irréversible" },
    textCancel: { type: String, default: "Annuler" },
    textConfim: { type: String, default: "Confirmer" },
    color: { type: String, default: "primary" },
    textColor: { type: String, default: "white" },
  },

  data: () => ({
    dialog: false,
  }),

  watch: {
    dialog(value) {
      this.$emit("setVisible", value);
    },
    visible(value) {
      this.dialog = value;
    },
  },

  methods: {
    onConfirm() {
      this.dialog = false;
      this.$emit("confirm");
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