<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="600px">
    <v-card>
      <v-overlay v-if="loadingSubmit" absolute>
        <v-progress-circular indeterminate></v-progress-circular>
      </v-overlay>
      <div class="d-flex justify-space-between align-top dialog-header">
        <v-card-title> Ajouter un étudiant </v-card-title>

        <v-btn class="mr-2 mt-3" plain x-small @click="$emit('close')">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </div>
      <v-divider />
      <v-card-text class="py-5">
        <v-container>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="18" sm="9" md="6">
                <v-text-field
                  label="Prénom *"
                  :rules="[rules.required]"
                  v-model.trim="student.firstname"
                  required
                  outlined
                  autofocus
                ></v-text-field>
              </v-col>
              <v-col cols="18" sm="9" md="6">
                <v-text-field
                  label="Nom *"
                  :rules="[rules.required]"
                  v-model.trim="student.lastname"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-text-field
                  label="Email *"
                  :rules="[rules.required, email]"
                  v-model.trim="student.email"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="pt-0">
                <v-switch
                  label="Etudiant à distance"
                  v-model="student.isRemote"
                  required
                  outlined
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <small class="error--text">* Champs obligatoires</small>
      </v-card-text>

      <v-divider />
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
  name: "StudentFormModal",
  props: ["dialog"],
  data: () => ({
    loadingSubmit: false,

    student: {
      lastname: "",
      firstname: "",
      email: "",
      isRemote: false
    },
    errorMessage: "",
    shakeSumbit: false,
    formValid: false,
    rules: {
      required: (value) => !!value || "Obligatoire",
    },
  }),
  watch: {
    "student.lastname"(lastname) {
      this.student.lastname = lastname.toUpperCase();
    },
    "student.firstname"(firstname) {
      this.student.firstname =
        firstname.charAt(0).toUpperCase() + firstname.slice(1);
    },
    "student.email"(email) {
      // Supprime le message d'erreur concernant l'admin dès qu'on change l'email
      if(this.errorMessage) {
        this.errorMessage = "";
      }
      this.student.email = email.toLowerCase();
    }
  },
  computed: {
    email() {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const test = pattern.test(this.student.email);
      if (test) {
        return this.errorMessage ? this.errorMessage : true;
      } else return "E-mail invalide";
    },
  },
  methods: {
    submit() {
      //this.errorMessage = '';
      this.$refs.form.validate();
      if (this.formValid) {
        this.loadingSubmit = true;

        this.$store
          .dispatch("addStudent", this.student)
          .then(() => {
            this.$refs.form.reset();
            this.$emit("added");
          })
          .catch((err) => {
            this.shakeSumbit = true;
            setTimeout(() => {
              this.shakeSumbit = false;
            }, 1000);
            this.errorMessage = err.response.data.message;
          })
          .finally(() => {
            this.loadingSubmit = false;
          });
      }
    },
  },
};
</script>
