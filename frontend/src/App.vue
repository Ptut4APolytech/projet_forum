<template>
  <v-app>
    <nav-bar />

    <pop-up-alert />

    <v-main class="accent">
      <router-view style="height: 100%" />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "./components/NavBar";
import PopUpAlert from "./components/PopUpAlert.vue";
import { mapGetters } from "vuex";

export default {
  name: "App",

  components: {
    NavBar,
    PopUpAlert,
  },

  data: () => ({
    multiLine: true,
  }),

  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER"
    }),
  },
  async created() {

    await this.$store.dispatch('getForumDate');
    
    if (this.currentUser && this.currentUser.id) {

      const newUser = { id: this.currentUser.id, lastLogin: Date() }
      await this.$store.dispatch('updateUser', newUser)

      switch (this.currentUser.role) {
        case 'student':
          await this.$store.dispatch('getUser', this.currentUser.id)
          await this.$store.dispatch('getStudent', this.$store.getters.GET_CURRENT_STUDENT.id)
          break
        case 'representative':
          await this.$store.dispatch('getUser', this.currentUser.id)
          await this.$store.dispatch('getRepresentative', this.$store.getters.GET_CURRENT_REPRESENTATIVE.id)
          await this.$store.dispatch('getCompany', this.$store.getters.GET_CURRENT_REPRESENTATIVE.companyId)
          break
        case 'admin':
          await this.$store.dispatch('getUser', this.currentUser.id)
          break
      }
    }
  }
};
</script>

<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.dialog-header {
  background-color: var(--v-primary-base);
}

.dialog-header .v-card__title, .dialog-header .v-btn .v-icon  {
  color: white;
}

.accent {
	padding: 56px 0px 0px !important;
}

</style>

