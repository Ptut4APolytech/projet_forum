<template>
  <div>
    <v-data-table
      :ref="tableRef"
      :headers="headers"
      :items="sortedAdmins"
      class="elevation-1"
      :items-per-page="15"
      :search="search"
      :loading="loadingDatas"
      loading-text="Chargement des données.."
      no-data-text="Aucun administrateur existant"
      no-results-text="Aucun administrateur trouvé"
      :footer-props="{
         'items-per-page-text':'Administrateurs par page'
      }"
    >
      <template v-slot:item.path="{ item }">
        <v-avatar size="30" :ref="renderImg" class="tertiary">
          <img v-if="imgs[item.id]" :src="imgs[item.id]"/>
          <div v-else class="accent--text">
            {{ (item.firstname.charAt(0) + item.lastname.charAt(0)).toUpperCase() }}
          </div>
        </v-avatar>
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
      text="Supprimer cet administrateur ?"
      color="error"
      @confirm="deleteAdmin(idToDelete)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ConfirmDialog from "../ConfirmDialog.vue";

export default {
  name: "AdminTable",
  props: ['search'],
  components: { ConfirmDialog },
  data: () => ({
    tableRef: 0,
    headers: [
      {
        text: "",
        align: "start",
        sortable: false,
        value: "path",
      },
      { text: "Nom", value: "lastname" },
      { text: "Prénom", value: "firstname" },
      { text: "Supprimer", value: "remove", align: "center", sortable: false },
    ],
    loadingDatas: true,
    imgs: {},
    renderImg: 0,
    dialogDelete: false,
    idToDelete: null,
  }),
  computed: {
    ...mapGetters({
      admins: "GET_ADMINS",
    }),

    sortedAdmins() {
      let admins = this.loadingDatas ? [] : this.admins;
      admins.forEach((adm) => {
        this.getAvatarSrc(adm);
      });
      return admins;
    },
  },
  created() {
    this.updateAdminFromDB();
  },
  methods: {
    getAvatarSrc(admin) {
      if (this.imgs[admin.id]) {
        return this.imgs[admin.id];
      }
      if (!admin.avatarPath) {
        this.imgs[
            admin.id
        ] = undefined
      } else {
        this.$store
            .dispatch("downloadFile", { path: admin.avatarPath })
            .then((result) => {
              let fr = new FileReader();
              fr.onload = () => {
                this.imgs[admin.id] = fr.result;
                this.renderImg += 1;
              };
              fr.readAsDataURL(result.data);
            });
      }
    },
    updateAdminFromDB() {
      this.loadingDatas = true;
      this.$store.dispatch("getAllAdmins").then(() => {
        this.loadingDatas = false;
      });
    },
    deleteAdmin(adminId) {
      if (adminId) {
        this.idToDelete = null;
        this.dialogDelete = false;

        this.loadingDatas = true;
        this.$store
          .dispatch("delAdmin", adminId)
          .then(() => {

            this.$store.commit("SET_POPUP", {
              text: `Suppression réussie !`,
              color: "success",
              visible: true,
            });

            this.updateAdminFromDB();
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
    updateAdmin(admin, payload) {
      this.loadingDatas = true;
      this.$store
        .dispatch("updateAdmin", { adminId: admin.id, payload })
        .then(() => {
          this.updateAdminFromDB();
        });
    },

    openDialogDelete(adminId) {
      this.idToDelete = adminId;
      this.dialogDelete = true;
    },
  },
};
</script>
