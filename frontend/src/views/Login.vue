<template>
  <div>
    <v-container fluid class="pt-4">
      <v-row align="center" justify="center" no-gutters>
        <v-col cols="10" sm="8" md="4">
          <v-card class="pa-5">
            <v-img
              alt="Logo TeaMeet"
              contain
              height="200"
              src="../assets/logo-teameet-title-subtitle.svg"
            />
            <v-form @submit.prevent="submit" v-model="valid">
              <v-card-title class="primary--text text-h4 justify-center">
                Connexion
              </v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="email"
                  label="E-mail"
                  name="email"
                  prepend-inner-icon="mdi-mail"
                  :rules="emailRules"
                />
                <v-text-field
                  v-model="password"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show ? 'text' : 'password'"
                  label="Mot de passe"
                  prepend-inner-icon="mdi-lock"
                  @click:append="show = !show"
                  :rules="passwordRules"
                />
              </v-card-text>

              <v-divider light />

              <v-card-actions>
                <v-btn
                  color="primary"
                  x-large
                  block
                  class="signin-btn"
                  type="submit"
                  :disabled="!valid || loading"
                >
                  <v-progress-circular
                    v-if="loading"
                    indeterminate
                  ></v-progress-circular>
                  <template v-else> connexion </template>
                </v-btn>
              </v-card-actions>
              <v-card-text
                class="primary--text text-center text-decoration-underline"
                style="cursor: pointer"
                @click="forgottenPassword"
              >
                Mot de passe oublié?
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog
      v-if="showForgottenPassword"
      v-model="showForgottenPassword"
      persistent
      scrollable
      max-width="600px"
    >
      <forgotten-password @close="closeForgottenPassword"></forgotten-password>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ForgottenPassword from "./reset/ForgottenPassword";
export default {
  name: "Login",
  components: { ForgottenPassword },
  data: () => ({
    show: false,
    loading: false,
    valid: false,
    email: "",
    emailRules: [
      (v) =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "E-mail n'est pas valide",
    ],
    password: "",
    passwordRules: [
      (v) => !!v || "Champ obligatoire",
      (v) => (v && v.length >= 8) || "Longeur minimum de 8",
    ],
    showForgottenPassword: false,
  }),

  created: function () {
    window.addEventListener("enter", this.submit);
  },

  beforeDestroy() {
    window.removeEventListener("enter", this.submit);
  },

  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },

  methods: {
    async submit() {
      this.loading = true;

      this.$store
        .dispatch("login", {
          email: this.email,
          password: this.password,
        })
        .then(() => {
          let role = this.currentUser.role;
          switch (role) {
            case "admin":
              this.$router.push("/board");
              break;
            case "representative":
              this.$router.push("/companyOffer");
              break;
            case "student":
              this.$router.push("/offers");
              break;
          }
        })
        .catch(() => {
          this.loading = false;
          this.$store.commit("SET_POPUP", {
            text: "Mot de passe ou identifiant incorrect",
            color: "error",
            visible: true,
          });
        });
    },
    forgottenPassword() {
      this.showForgottenPassword = true;
    },
    closeForgottenPassword() {
      this.showForgottenPassword = false;
    },
  },
};
</script>
