<template>
  <div class="d-flex justify-center text-center pa-10" style="gap: 5vw">
    <v-card width="40vw">
      <div class="d-flex flex-column justify-center" style="height: 100%">
        <RepresentativePlanning></RepresentativePlanning>
      </div>
    </v-card>
    <div class="d-flex flex-column" style="width: 40vw; gap: 4vh">
      <v-card height="46vh">1</v-card>
      <v-card height="46vh">2</v-card>
    </div>
  </div>
</template>

<script>
import RepresentativePlanning from "@/views/company/RepresentativePlanning";
export default {
  name: "RepresentativeBoard",
  components: {RepresentativePlanning}
}
</script>

<style scoped>

</style>