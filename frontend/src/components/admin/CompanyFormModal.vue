<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="600px">
    <v-card>
      <v-overlay v-if="loadingSubmit" absolute>
        <v-progress-circular indeterminate></v-progress-circular>
      </v-overlay>
      <div class="d-flex justify-space-between align-top dialog-header">
        <v-card-title> Ajouter une entreprise </v-card-title>

        <v-btn class="mr-2 mt-3" plain x-small @click="$emit('close')">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="py-5">
        <v-container>
          <v-form ref="form" v-model="formValid" @submit.prevent="submit">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Nom *"
                  :rules="[rules.required, companyName]"
                  v-model.trim="company.name"
                  required
                  outlined
                  autofocus
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <small class="error--text">* Champs obligatoires</small>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" outlined @click="$emit('close')"> Annuler </v-btn>
        <v-btn
          color="primary"
          @click="submit"
          :class="shakeSumbit ? 'shake' : ''"
          :disabled="!formValid"
        >
          Ajouter
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CompanyFormModal",
  props: ["dialog"],
  data: () => ({
    loadingSubmit: false,

    company: {
      name: "",
    },
    errorMessage: "",
    shakeSumbit: false,
    formValid: false,
    rules: {
      required: (value) => !!value || "Obligatoire",
    },
  }),
  computed: {
    companyName() {
      return this.errorMessage ? this.errorMessage : true;
    },
  },
  methods: {
    submit() {
      this.errorMessage = "";
      this.$refs.form.validate();
      if (this.formValid) {

        this.loadingSubmit = true;

        this.$store
          .dispatch("addCompany", this.company)
          .then(() => {
            this.$refs.form.reset();
            this.$emit("added");
          })
          .catch((err) => {
            this.shakeSumbit = true;
            setTimeout(() => {
              this.shakeSumbit = false;
            }, 1000);
            this.errorMessage = err.response.data.message;
          })
          .finally(() => {
            this.loadingSubmit = false;
          });
      }
    },
  },
};
</script>
