<template>
  <div>
    <h1 class="primary--text text-h4 mb-3">Mon profil</h1>
    <v-card class="pa-5">
      <user-profile @updateUser="updateUser" @updateAvatar="updateAvatar" :user="currentUser" ></user-profile>
      <div style="text-align: end">
        <v-btn @click="submit" color="primary"> Sauvegarder </v-btn>
      </div>
    </v-card>
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UserProfile from "@/components/user/UserProfile";

export default {
  name: "AdminProfile",
  components: {UserProfile},
  data: () => ({
    user: {
      id: "",
      firstname: "",
      lastname: "",
      password: "",
      avatarPath: "",
    },
    loading: false,
    avatarFile: null,
  }),

  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },

  async created() {
    this.user = this.currentUser;

    if (!this.user.avatarPath) {
      this.avatarB64 = require("../../assets/edit-profile-picture.png");
    } else {
      let result = await this.$store.dispatch("downloadFile", {
        path: this.user.avatarPath,
      });
      let fr = new FileReader();
      fr.onload = () => {
        this.avatarB64 = fr.result;
      };
      fr.readAsDataURL(result.data);
    }
  },
  methods: {
    updateUser (value) {
      this.user = value
    },
    updateAvatar (value) {
      this.avatarFile = value
    },
    async submit() {
      this.loading = true;

      if (this.avatarFile && this.avatarFile.name) {
        let reader = new FileReader();
        let filePath = this.user.id + "/" + this.avatarFile.name;
        this.user.avatarPath = filePath;
        reader.onload = () => {
          var data = new FormData();
          var blob = new Blob([reader.result]);
          data.append("path", filePath);
          data.append("file", blob);
          this.$store.dispatch("uploadFile", data).catch((err) => {
            this.$store.commit("SET_POPUP", {
              text: `Mise à jour échouée : ${err}`,
              color: "error",
              visible: true,
            });
          });
        };
        reader.readAsArrayBuffer(this.avatarFile);
      }

      await this.$store.dispatch("updateUser", this.user).then(() => {
        this.$store.commit("SET_POPUP", {
          text: "Mise à jour réussie !",
          color: "success",
          visible: true,
        });
      }).catch((err) => {
        this.$store.commit("SET_POPUP", {
          text: `Mise à jour échouée : ${err}`,
          color: "error",
          visible: true,
        });
      });

      let newUser = this.currentUser;
      this.$store.commit("SET_CURRENT_USER", newUser);
      this.loading = false;
    },
  },
};
</script>
