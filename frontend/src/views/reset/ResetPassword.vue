<template>
  <v-container fluid class="pt-4">
    <h1 class="primary--text text-h4 mb-3">Réinitialisation de mot de passe</h1>
    <v-row class="justify-center">
      <v-col class="col col-sm-9 col-md-8 col-lg-6">
        <v-card class="pa-5">
          <change-password @updatePassword="changePassword"></change-password>
          <div style="text-align: end">
            <v-btn class="primary" :disabled="!password" @click="submit">
              Valider</v-btn
            >
          </div>
        </v-card>
        <v-overlay v-if="loading">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ChangePassword from "@/components/user/ChangePassword";

export default {
  name: "ResetPassword",
  components: { ChangePassword },
  data() {
    return {
      loading: false,
      password: "",
      token: this.$route.params.token,
    };
  },
  methods: {
    submit() {
      this.loading = true;
      this.$store
        .dispatch("updatePasswordByToken", {
          password: this.password,
          token: this.token,
        })
        .then(() => {
          this.$store.commit("SET_POPUP", {
            text: `Changement effectué`,
            color: "success",
            visible: true,
          });
          this.$router.push("/login");
        })
        .catch((err) => {
          this.$store.commit("SET_POPUP", {
            text: `Mise à jour échouée : ${err.response.data.message}`,
            color: "error",
            visible: true,
          });
          this.loading = false;
        });
    },
    changePassword(value) {
      this.password = value;
    },
  },
};
</script>

<style scoped>
</style>