<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="600px">
    <v-card>
      <div class="d-flex justify-space-between align-top dialog-header">
        <v-card-title> Ajouter un entretien </v-card-title>

        <v-btn class="mr-2 mt-3" plain x-small @click="$emit('close')">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>
      <v-divider />
      <v-card-text class="py-5">
        <v-container>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-autocomplete
                ref="selectCompany"
                v-model="appointment.companyId"
                :disabled="companyId !== undefined"
                :rules="[rules.required]"
                :items="companiesAvailable"
                item-text="name"
                item-value="id"
                label="Entreprise*"
                :search-input.sync="searchCompanyName"
              >
                <template v-slot:no-data> Aucune entreprise trouvée </template>
              </v-autocomplete>
            </v-row>
            <v-row>
              <v-autocomplete
                ref="selectOffer"
                v-model="appointment.offerId"
                :rules="[rules.required]"
                :items="offersAvailable"
                item-text="title"
                item-value="id"
                label="Offre*"
                :search-input.sync="searchOfferName"
              >
                <template v-slot:no-data> Aucune offre trouvée </template>
              </v-autocomplete>
            </v-row>
            <v-row>
              <v-autocomplete
                ref="selectStudent"
                v-model="appointment.studentId"
                :disabled="studentId !== undefined"
                :rules="[rules.required]"
                :items="studentsAvailable"
                item-text="name"
                item-value="id"
                label="Etudiant*"
                :search-input.sync="searchStudentName"
              >
                <template v-slot:no-data> Aucun étudiant trouvé </template>
              </v-autocomplete>
            </v-row>
          </v-form>
        </v-container>
        <small>*champs obligatoires</small>
        <br />
        <small
          >Seules les entités n'ayant pas d'entretien à l'horaire selectionné
          sont disponible</small
        >
        <v-row v-if="errorMessage !== ''" justify="end" style="color: red">
          {{ errorMessage }}
        </v-row>
      </v-card-text>
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
  name: "AppointmentFormModal",
  props: [
    "dialog",
    "companyId",
    "studentId",
    "slotIndex",
    "companies",
    "offers",
    "students",
  ],
  data: () => ({
    appointment: {
      companyId: "",
      offerId: "",
      studentId: "",
      slot: "",
    },
    errorMessage: "",
    shakeSumbit: false,
    formValid: false,
    searchCompanyName: "",
    searchOfferName: "",
    searchStudentName: "",
    rules: {
      required: (value) => !!value || "Obligatoire",
    },
  }),
  created() {
    this.appointment.companyId = this.companyId;
    this.appointment.studentId = this.studentId;
    this.appointment.slot = this.slotIndex;
  },
  computed: {
    companiesAvailable() {
      return this.companies.filter(
        (c) =>
          !Object.prototype.hasOwnProperty.call(c, "appointments") ||
          !c.appointments[this.slotIndex]
      );
    },
    offersAvailable() {
      return this.offers.filter(
        (c) => c.companyId === this.appointment.companyId
      );
    },
    studentsAvailable() {
      return this.students.filter(
        (c) =>
          !Object.prototype.hasOwnProperty.call(c, "appointments") ||
          !c.appointments[this.slotIndex]
      );
    },
  },
  methods: {
    submit() {
      this.$refs.form.validate();
      if (this.formValid) {
        this.$emit("added", this.appointment);
      }
    },
  },
};
</script>
