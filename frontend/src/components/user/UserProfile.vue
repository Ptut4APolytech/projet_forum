<template>
  <div>
    <div class="d-flex justify-center mb-6">
      <v-avatar @click="clickChangeAvatar" style="cursor: pointer" size="168">
        <img :src="avatarB64" />
      </v-avatar>
    </div>

    <v-row class="mb-5">
      <v-col class="col-12 col-sm-6">
        <v-text-field
          outlined
          disabled
          label="Prénom"
          hide-details
          v-model="user.firstname"
        ></v-text-field>
      </v-col>
      <v-col class="col-12 col-sm-6">
        <v-text-field
          outlined
          disabled
          label="Nom"
          hide-details
          v-model="user.lastname"
        ></v-text-field>
      </v-col>
    </v-row>

    <change-password @updatePassword="changePassword"></change-password>
    <input
      ref="uploader"
      class="d-none"
      type="file"
      accept="image/*"
      @change="changeAvatar"
    />
  </div>
</template>

<script>
import ChangePassword from "@/components/user/ChangePassword";
export default {
  name: "UserProfile",
  props: ["user"],
  components: { ChangePassword },
  data() {
    return {
      avatarFile: null,
      avatarB64: "",
    };
  },
  async created() {
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
    changePassword(value) {
      this.user.password = value;
      this.emitData();
    },
    clickChangeAvatar() {
      this.$refs.uploader.click();
    },
    changeAvatar(file) {
      let img = file.target.files[0];
      this.avatarFile = img;
      let fr = new FileReader();
      fr.onload = () => {
        this.avatarB64 = fr.result;
      };
      fr.readAsDataURL(img);
      this.emitData();
    },
    emitData() {
      this.$emit("updateUser", this.user);
      this.$emit("updateAvatar", this.avatarFile);
    },
  },
};
</script>

<style scoped>
.v-text-field {
  min-width: 100px;
}

.v-avatar {
  border: 1px solid #cccbcb;
  transition-duration: 300ms;
}

.v-avatar:hover {
  transition-duration: 300ms;
  border-color: #969696;
  opacity: 0.7;
}
</style>