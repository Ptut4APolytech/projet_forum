<template>
  <div
    style="
      height: calc(8vh);
      width: calc(195px);
      border-radius: 10px;
      position: relative;
      border: solid #d1e8e8 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    "
    v-bind:class="[
      currentUser.role == 'student' || currentUser.role == 'representative'
        ? 'no-clickable'
        : 'clickable',
    ]"
    @click="$emit('addAppo')"
  >
    <v-icon
      v-if="
        currentUser.role !== 'student' && currentUser.role !== 'representative'
      "
      color="#D1E8E8"
      large
      >mdi-plus</v-icon
    >
    <div
      v-if="
        currentUser.role == 'student' || currentUser.role == 'representative'
      "
      class="text-body-2 secondary--text"
    >
      Aucun rendez-vous
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "EmptyTile",
  data: () => ({}),
  created() {},
  computed: {
    ...mapGetters({
      currentUser: "GET_CURRENT_USER",
    }),
  },
};
</script>
<style>
.clickable {
  cursor: pointer;
}

.no-clickable {
  cursor: default;
}
</style>
