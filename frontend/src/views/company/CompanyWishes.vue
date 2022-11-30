<template>
  <v-container fluid>
    <div class="d-flex align-center mb-3">

      <h1 class="primary--text text-h4 mr-2">Liste des voeux</h1>

      <v-tooltip color="secondary" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon> mdi-help-circle </v-icon>
          </v-btn>
        </template>

        <span>
          Fonctionnement des voeux : <br />
          Vos voeux sont définis selon vos offres. <br />
          Pour chaque offre, vous définissez de manière ordonnée les étudiants vous intéressant le plus.
        </span>
      </v-tooltip>
    </div>

    <v-row>
      <v-col id="offerList" cols="6">
        <WishList
          @tempWishOrder="sendWishOrder"
          :studentToAdd="studentToAdd"
          :studentToDelete="studentToDelete"
        />
      </v-col>
      <v-col id="wish" cols="6">
        <Wish
          class="sticky-card"
          :orderedStudentIds="studentIds"
          @selectedStudentId="addStudent"
          @unselectedStudentId="deleteStudent"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import WishList from "../../components/company/wish/WishList.vue";
import Wish from "../../components/company/wish/Wish.vue";

export default {
  name: "CompanyWishes",
  components: { WishList, Wish },

  data: () => ({
    windowWidth: window.innerWidth,

    studentIds: [],
    studentToAdd: null,
    studentToDelete: null,
  }),

  watch: {
    windowWidth() {
      this.responsive();
    },

    "$route.query.studentId": function () {
      this.responsive();
    },
  },

  mounted() {
    this.responsive();
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    responsive() {
      let domOfferList = document.getElementById("offerList");
      let domWish = document.getElementById("wish");

      if (this.windowWidth < 700) {
        // On supprime la limite de colonnes pour la version mobile
        domOfferList.classList.remove("col-6");
        domWish.classList.remove("col-6");

        const studentId = this.$route.query.studentId;

        if (studentId) {
          domOfferList.hidden = true;
          domWish.hidden = false;
        } else {
          domOfferList.hidden = false;
          domWish.hidden = true;
        }
      } else {
        // On remet la limite de colonnes pour la version mobile
        domOfferList.classList.add("col-6");
        domWish.classList.add("col-6");

        domOfferList.hidden = false;
        domWish.hidden = false;
      }
    },

    sendWishOrder(value) {
      this.studentIds = [...value];
      this.studentToAdd = null;
      this.studentToDelete = null;
    },

    addStudent(value) {
      this.studentToAdd = value;
      this.studentToDelete = null;
    },

    deleteStudent(value) {
      this.studentToDelete = value;
      this.studentToAdd = null;
    },
  },
};
</script>