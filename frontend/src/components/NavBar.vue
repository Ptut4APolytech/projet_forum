<template>
  <div>
    <v-app-bar color="primary" flat fixed app class="hidden-sm-and-down pa-0">
      <v-toolbar-title
        style="width: 64px; display: flex; height: 100%"
        class="justify-center align-center"
      >
        <router-link to="/">
          <v-img
            alt="Vuetify Logo"
            src="../assets/logo-teameet.svg"
            height="auto"
            width="40"
          />
        </router-link>
      </v-toolbar-title>
      <v-toolbar-items v-if="user.role">
        <v-btn
          v-if="user.role === 'admin'"
          class="white--text"
          color="primary"
          to="/board"
          elevation="0"
        >
          Tableau de bord
        </v-btn>
        <v-btn
          v-if="user.role === 'admin'"
          class="white--text"
          color="primary"
          to="/admin"
          elevation="0"
        >
          Utilisateurs
        </v-btn>
        <v-btn
          v-if="user.role === 'admin'"
          class="white--text"
          color="primary"
          to="/adminOffers"
          elevation="0"
        >
          Offres
        </v-btn>
        <v-btn
          v-if="user.role === 'representative'"
          class="white--text"
          color="primary"
          to="/companyOffer"
          elevation="0"
        >
          Mes offres
        </v-btn>
        <v-btn
          v-if="user.role === 'representative'"
          class="white--text"
          color="primary"
          to="/companyStudent"
          elevation="0"
        >
          Les étudiants
        </v-btn>
        <v-btn
          v-if="user.role === 'representative'"
          class="white--text"
          color="primary"
          to="/companyWishes"
          elevation="0"
        >
          Mes voeux
        </v-btn>
        <v-btn
          v-if="user.role === 'student'"
          class="white--text"
          color="primary"
          to="/offers"
          elevation="0"
        >
          Offres
        </v-btn>
        <v-btn
          v-if="user.role === 'student'"
          class="white--text"
          color="primary"
          to="/studentWishes"
          elevation="0"
        >
          Voeux
        </v-btn>
        <v-btn
          v-if="user.role"
          class="white--text"
          color="primary"
          to="/planning"
          elevation="0"
        >
          planning
        </v-btn>
      </v-toolbar-items>

      <v-spacer />

      <v-toolbar-items v-if="user.role">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              color="primary"
              elevation="0"
              class="no-uppercase"
            >
              <div class="d-flex align-end justify-center flex-column">
                <div class="text--accent font-weight-bold text-h6">
                  {{ user.firstname + " " + user.lastname }}
                </div>
                <div
                  class="text-sm-body-1 text--accent"
                  style="font-size: 12px !important; margin-top: -9px"
                >
                  {{ user.email }}
                </div>
              </div>
              <div x-large icon color="white" class="ml-2">
                <v-avatar size="38" :key="renderImg" class="tertiary">
                  <img v-if="img" :src="img" />
                  <div v-else style="color: #005672">
                    {{ user.firstname.charAt(0) + user.lastname.charAt(0) }}
                  </div>
                </v-avatar>
              </div>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-icon class="mr-2">mdi-account</v-icon>
              <v-list-item-title> Mon profil </v-list-item-title>
            </v-list-item>

            <v-list-item @click="logout()">
              <v-icon class="mr-2 error--text">mdi-logout</v-icon>
              <v-list-item-title class="error--text">
                Déconnexion
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>

      <v-btn v-else to="/login" class="tertiary mr-3" depressed>
        <v-icon class="mr-2">mdi-login</v-icon>
        Connexion
      </v-btn>
    </v-app-bar>

    <v-app-bar color="primary" flat fixed app class="hidden-md-and-up pa-0">
      <v-toolbar-title
        style="width: 64px; display: flex; height: 100%"
        class="justify-center align-center"
      >
        <router-link to="/">
          <v-img
            alt="Vuetify Logo"
            src="../assets/logo-teameet.svg"
            height="auto"
            width="40"
          />
        </router-link>
      </v-toolbar-title>

      <v-spacer />

      <v-toolbar-items v-if="user.role">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              height="70px"
              color="primary"
              elevation="0"
              class="no-uppercase"
            >
              <div class="d-flex align-end justify-center flex-column">
                <div class="text--accent font-weight-bold text-h6">
                  {{ user.firstname + " " + user.lastname }}
                </div>
                <div
                  class="text-sm-body-1 text--accent"
                  style="font-size: 12px !important; margin-top: -9px"
                >
                  {{ user.email }}
                </div>
              </div>
              <v-btn x-large icon color="white" class="ml-1">
                <v-avatar size="38" :key="renderImg" class="tertiary">
                  <img v-if="img" :src="img" />
                  <div v-else style="color: #005672">
                    {{ user.firstname.charAt(0) + user.lastname.charAt(0) }}
                  </div>
                </v-avatar>
              </v-btn>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-icon class="mr-2">mdi-account</v-icon>
              <v-list-item-title> Mon profil </v-list-item-title>
            </v-list-item>

            <v-list-item @click="logout()">
              <v-icon class="mr-2 error--text">mdi-logout</v-icon>
              <v-list-item-title class="error--text">
                Déconnexion
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>

      <v-btn v-else to="/login" class="tertiary mr-3" depressed>
        <v-icon class="mr-2">mdi-login</v-icon>
        Connexion
      </v-btn>
    </v-app-bar>

    <v-bottom-navigation
      color="accent"
      background-color="primary"
      dark
      class="hidden-md-and-up rounded-t-xl justify-space-around footerCustom"
      fixed
      app
      v-if="user.role"
    >
      <v-btn v-if="user.role === 'admin'" to="/board">
        <span>Tableau de bord</span>

        <v-icon>mdi-developer-board</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'admin'" to="/admin">
        <span>Admin</span>

        <v-icon>mdi-account-box-multiple</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'admin'" to="/adminOffers">
        <span>Offres</span>

        <v-icon>mdi-account-box-multiple</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'representative'" to="/companyOffer">
        <span>Mes offres</span>

        <v-icon>mdi-briefcase</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'representative'" to="/companyStudent">
        <span>Les étudiants</span>

        <v-icon>mdi-account-supervisor</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'representative'" to="/companyWishes">
        <span>Mes voeux</span>

        <v-icon>mdi-heart-multiple</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'student'" to="/offers">
        <span>Offres</span>

        <v-icon>mdi-briefcase</v-icon>
      </v-btn>
      <v-btn v-if="user.role === 'student'" to="/studentWishes">
        <span>Voeux</span>

        <v-icon>mdi-heart-multiple</v-icon>
      </v-btn>
      <v-btn v-if="user.role" to="/planning">
        <span>Planning</span>

        <v-icon>mdi-calendar-range</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "NavBar",
  data: () => ({
    img: "",
    renderImg: 0,
  }),
  watch: {
    user(newValue) {
      if (newValue.role) {
        this.getAvatarSrc();
        this.getCompany();
      }
    },
  },
  computed: {
    ...mapGetters({
      user: "GET_CURRENT_USER",
      company: "GET_CURRENT_COMPANY",
      representative: "GET_CURRENT_REPRESENTATIVE",
      student: "GET_CURRENT_STUDENT",
    }),
  },
  created() {
    this.getAvatarSrc();
    this.getCompany();
  },
  methods: {
    getAvatarSrc() {
      if (!this.user || !this.user.avatarPath) {
        this.img = null;
      } else {
        this.$store
          .dispatch("downloadFile", { path: this.user.avatarPath })
          .then((result) => {
            let fr = new FileReader();
            fr.onload = () => {
              this.img = fr.result;
              this.renderImg += 1;
            };
            fr.readAsDataURL(result.data);
          });
      }
    },
    ...mapActions({
      sendLogout: "logout",
    }),
    logout() {
      this.sendLogout().then(() => {
        this.$router.push("/");
      });
    },
    getCompany() {
      if (this.user.role === "representative") {
        this.$store
          .dispatch("getCompany", this.representative.companyId)
          .then(() => {})
          .catch((error) => {
            this.$store.commit("SET_POPUP", {
              text: `Erreur : ${error.response.data.message}`,
              color: "error",
              visible: true,
            });
          });
      }
    },
  },
};
</script>
<style>
.pa-0 .v-toolbar__content {
  padding: 0;
}

.no-uppercase {
  text-transform: none !important;
}

.footerCustom .v-btn:not(.v-btn--round).v-size--default {
  height: unset !important;
  min-width: unset !important;
  padding: unset !important;
  background-color: transparent !important;
}

.sticky-card {
  position: sticky;
  top: 85px;
}
</style>
