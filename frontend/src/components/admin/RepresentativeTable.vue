<template>
  <div>
    <v-data-table
      :ref="tableRef"
      :headers="headers"
      :items="sortedRepresentatives"
      class="elevation-1"
      :items-per-page="15"
      :search="search"
      :loading="loadingDatas"
      loading-text="Chargement des données.."
      no-data-text="Aucun salarié existant"
      no-results-text="Aucun salarié trouvé"
      :footer-props="{
         'items-per-page-text':'Salariés par page'
      }"
    >
      <template v-slot:item.path="{ item }">
        <v-avatar size="30" :ref="renderImg" class="tertiary">
          <img v-if="imgs[item.id]" :src="imgs[item.id]"/>
          <div v-else class="accent--text">
            {{ (item.user.firstname.charAt(0) + item.user.lastname.charAt(0)).toUpperCase() }}
          </div>
        </v-avatar>
      </template>
      <template v-slot:item.lastLogin="{ item }">
        <v-chip class="ma-2 ml-0" :color="getConnectionColor(nbDays[item.id])">
          {{ getLastConnectionText(nbDays[item.id]) }}
        </v-chip>
      </template>
      <template v-slot:item.remove="{ item }">
        <v-icon color="error" @click="openDialogDelete(item.id)"
          >mdi-delete</v-icon
        >
      </template>
      <template v-slot:footer.page-text="data">
        {{data.pageStart}}-{{data.pageStop}} sur {{data.itemsLength}}
      </template>
    </v-data-table>

    <!-- Dialog part-->
    <ConfirmDialog
      v-model="dialogDelete"
      text="Supprimer ce salarié ?"
      color="error"
      @confirm="deleteRepresentative(idToDelete)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ConfirmDialog from "../ConfirmDialog.vue";

export default {
  name: "RepresentativeTable",
  props: ['search'],
  components: { ConfirmDialog },
  data: () => ({
    tableRef: 0,
    renderImg: 0,
    headers: [
      {
        text: "",
        align: "start",
        sortable: false,
        value: "path",
      },
      { text: "Nom", value: "user.lastname" },
      { text: "Prénom", value: "user.firstname" },
      { text: "Email", value: "user.email" },
      { text: "Entreprise", value: "company.name" },
      { text: "Dernière connexion", value: "lastLogin", sortable: false },
      { text: "Supprimer", value: "remove", align: "center", sortable: false },
    ],
    loadingDatas: true,
    imgs: {},
    nbDays: {},

    dialogDelete: false,
    idToDelete: null,
  }),
  computed: {
    ...mapGetters({
      storeRepresentatives: "GET_REPRESENTATIVES",
    }),

    sortedRepresentatives() {
      let representatives = this.loadingDatas ? [] : this.storeRepresentatives;
      representatives.forEach((rep) => {
        this.getAvatarSrc(rep);
        if (this.nbDays[rep.id] === undefined) {
          this.nbDays[rep.id] = this.getTime(rep.user.lastLogin);
        }
      });
      return representatives;
    },
  },
  created() {
    this.updateRepresentativeFromDB();
  },
  methods: {
    getAvatarSrc(representative) {
      if (this.imgs[representative.id]) {
        return this.imgs[representative.id];
      }
      if (!representative.user.avatarPath) {
        this.imgs[
          representative.id
        ] = undefined
      } else {
        this.$store
          .dispatch("downloadFile", { path: representative.user.avatarPath })
          .then((result) => {
            let fr = new FileReader();
            fr.onload = () => {
              this.imgs[representative.id] = fr.result;
              this.renderImg += 1;
            };
            fr.readAsDataURL(result.data);
          });
      }
    },
    getTime(time) {
      if (time) {
        let date = new Date(time);
        let diff = (new Date() - date) / (60 * 60 * 1000 * 24);
        return Math.floor(diff);
      }
      return -1;
    },
    getLastConnectionText(nbDays) {
      if (nbDays === -1) {
        return "Jamais connecté";
      }
      if (nbDays === 0) {
        return "Il y a moins d'un jour";
      }
      return "Il y a " + nbDays + " jour(s)";
    },
    updateRepresentativeFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllRepresentatives").then(() => {
        this.loadingDatas = false;
      });
    },
    getConnectionColor(nbDays) {
      if (nbDays === -1) {
        return "error";
      }
      if (nbDays < 14) {
        return "success";
      }
      return "tertiary";
    },
    deleteRepresentative(representativeId) {
      if (representativeId) {
        this.idToDelete = null;
        this.dialogDelete = false;

        this.loadingDatas = true;
        this.$store
          .dispatch("delRepresentative", representativeId)
          .then(() => {

            this.$store.commit("SET_POPUP", {
              text: `Suppression réussie !`,
              color: "success",
              visible: true,
            });

            this.updateRepresentativeFromDB();
          })
          .catch((error) => {
            this.$store.commit("SET_POPUP", {
              text: `Suppression échouée : ${error}`,
              color: "error",
              visible: true,
            });
          });
      }
    },
    openDialogDelete(representativeId) {
      this.idToDelete = representativeId;
      this.dialogDelete = true;
    },
  },
};
</script>
