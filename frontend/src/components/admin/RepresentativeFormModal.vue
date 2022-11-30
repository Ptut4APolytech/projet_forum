<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="600px">
    <v-card>
      <v-overlay v-if="loadingSubmit" absolute>
        <v-progress-circular indeterminate></v-progress-circular>
      </v-overlay>
      <div class="d-flex justify-space-between align-top dialog-header">
        <v-card-title> Ajouter un salarié d'entreprise </v-card-title>

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
                  v-model.trim="representative.firstname"
                  required
                  outlined
                  autofocus
                ></v-text-field>
              </v-col>
              <v-col cols="18" sm="9" md="6">
                <v-text-field
                  label="Nom *"
                  :rules="[rules.required]"
                  v-model.trim="representative.lastname"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Email *"
                  :rules="[rules.required, email]"
                  v-model.trim="representative.email"
                  required
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  ref="selectCompany"
                  v-model="representative.companyId"
                  :rules="[rules.required]"
                  :items="companies"
                  item-text="name"
                  item-value="id"
                  label="Entreprise *"
                  :search-input.sync="searchCompanyName"
                  outlined
                >
                  <template v-slot:no-data>
                    <div style="height: 55px">
                      <v-row
                        justify="center"
                        align-content="center"
                        style="height: 100%"
                      >
                        <v-btn
                          color="secondary"
                          @click="createCompany"
                          :loading="addingCompany"
                        >
                          Créer l'entreprise "{{ searchCompanyName }}"
                        </v-btn>
                      </v-row>
                    </div>
                  </template></v-autocomplete
                >
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
import { mapGetters } from "vuex";

export default {
  name: "RepresentativeFormModal",
  props: ["dialog"],
  data: () => ({
    loadingSubmit: false,

    representative: {
      lastname: "",
      firstname: "",
      email: "",
      companyId: "",
    },
    loadingCompanies: false,
    addingCompany: false,
    searchCompanyName: "",
    companies: [],
    errorMessage: "",
    shakeSumbit: false,
    formValid: false,
    rules: {
      required: (value) => !!value || "Obligatoire",
    },
  }),
  created() {
    this.updateCompaniesFromDB();
  },
  computed: {
    ...mapGetters({
      storeCompanies: "GET_COMPANIES",
    }),
    email() {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const test = pattern.test(this.representative.email);
      if (test) {
        return this.errorMessage ? this.errorMessage : true;
      } else return "E-mail invalide";
    },
  },
  watch: {
    "representative.lastname"(lastname) {
      this.representative.lastname = lastname.toUpperCase();
    },
    "representative.firstname"(firstname) {
      this.representative.firstname =
        firstname.charAt(0).toUpperCase() + firstname.slice(1);
    },
    "representative.email"(email) {
      // Supprime le message d'erreur concernant l'admin dès qu'on change l'email
      if(this.errorMessage) {
        this.errorMessage = "";
      }
      this.representative.email = email.toLowerCase();
    }
  },
  methods: {
    createCompany() {
      this.addingCompany = true;
      this.searchCompanyName = this.searchCompanyName.trim();
      this.$store
        .dispatch("addCompany", { name: this.searchCompanyName })
        .then(() => {
          this.updateCompaniesFromDB(() => {
            let newCompany = this.companies.find(
              (c) => c.name === this.searchCompanyName
            );
            if (newCompany) {
              this.representative.companyId = newCompany.id;
            }
            this.addingCompany = false;
            this.searchCompanyName = "";
            this.$refs.selectCompany.blur();
          });
        })
        .catch((error) => {
          this.$store.commit("SET_POPUP", {
            text: `Création d'entreprise impossible : ${error.response.data.message}`,
            color: "error",
            visible: true,
          });
        });
    },
    updateCompaniesFromDB(callback) {
      this.loadingCompanies = true;
      this.$store.dispatch("getAllCompanies").then(() => {
        this.loadingCompanies = false;
        this.companies = this.storeCompanies;
        if (callback) {
          callback();
        }
      });
    },
    submit() {
      
      this.$refs.form.validate();
      if (this.formValid) {
        this.loadingSubmit = true;

        this.$store
          .dispatch("addRepresentative", this.representative)
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
