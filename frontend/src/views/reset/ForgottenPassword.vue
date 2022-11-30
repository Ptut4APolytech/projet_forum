<template>
  <v-card>
    <div class="d-flex justify-space-between align-top dialog-header">
      <v-card-title> Réinitialisation du mot de passe </v-card-title>

      <v-btn class="mr-2 mt-3" plain x-small @click="$emit('close')">
        <v-icon> mdi-close </v-icon>
      </v-btn>
    </div>

    <v-divider />

    <v-card-text class="py-5">
      <v-text-field
        outlined
        label="E-mail"
        v-model="email"
        :rules="[rules.email]"
      ></v-text-field>
    </v-card-text>

    <v-divider />

    <v-card-actions class="justify-end">
      <v-btn color="error" @click="$emit('close')" outlined> Annuler </v-btn>
      <v-btn color="primary" @click="submit" :disabled="disableButton">
        Valider
      </v-btn>
    </v-card-actions>

    <v-overlay v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script>
export default {
  name: "ForgottenPassword",
  data() {
    return {
      email: "",
      loading: false,
      rules: {
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "E-mail invalide";
        },
      },
    };
  },

  computed: {
    disableButton() {
      return this.rules.email(this.email) == true ? false : true;
    }
  },

  methods: {
    submit() {
      this.loading = true;
      this.$store.dispatch("resetPassword", { email: this.email }).then(() => {
        this.$store.commit("SET_POPUP", {
          text: `Vous recevrez un mail si celui-ci est lié à un compte`,
          color: "success",
          visible: true,
        });
        this.loading = false;
        this.email = "";
        this.$emit("close");
      });
    },
  },
};
</script>

<style scoped>
</style>