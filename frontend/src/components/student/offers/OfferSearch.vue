<template>
  <v-form @submit.prevent="">
    <v-text-field
      v-model.trim="formSearch"
      label="Recherchez une offre, une entreprise, un mot-clé..."
      filled
      dense
      append-icon="mdi-magnify"
      single-line
      hide-details
      outlined
      clearable
    >
    </v-text-field>
  </v-form>
</template>

<script>
export default {
  name: "OfferSearch",
  data: () => ({
    formSearch: null,
    timer: null,
  }),

  watch: {
    formSearch(oldValue, newValue) {

      if (oldValue != newValue) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.submit(), 300);
      }
    },
  },

  methods: {
    submit() {
      let search = [];

      if (this.formSearch) {
        search.push({
          path: "global",
          value: this.formSearch,
          operator: "LIKE",
        });
      }

      this.$emit("submitted", search);
    },
  },
};
</script>