<template>
    <v-container fluid>
        <v-row class="mb-4">
            <v-col class="d-flex align-center justify-end">
                <v-btn color="primary mr-2" class="white--text" @click="openDateTimePicker()"
                    :disabled="loadDatePickerButton">
                    <v-progress-circular v-if="loadDatePickerButton" size="25" class="mr-2" indeterminate>
                    </v-progress-circular>
                    <v-icon v-else class="mr-2">mdi-calendar-plus-outline</v-icon>
                    <span v-if="date && heure">
                        Modifier la date et l'horaire du forum
                    </span>
                    <span v-else>
                        Ajouter une date et un horaire au forum
                    </span>
                </v-btn>
                <v-btn color="primary mr-2" class="white--text" @click="openConfirmDialogText()"
                    :disabled="loadSurveyButton">
                    <v-progress-circular v-if="loadSurveyButton" size="25" class="mr-2" indeterminate>
                    </v-progress-circular>
                    <v-icon v-else class="mr-2">mdi-email-fast-outline</v-icon>
                    Envoyer le questionnaire
                </v-btn>
            </v-col>
        </v-row>

        <v-row v-if="!loading" class="text-center">
            <v-col>
                <div class="d-flex justify-center mb-10 flex-wrap" style="gap: 3rem">
                    <v-card width="20vw" class="pa-3 d-flex align-center" :class="[
                      countStudentsWithFewAppointments > 0
                        ? 'card-warning'
                        : 'card-success',
                    ]">
                        <v-icon class="card-icon rounded-circle mr-2" x-large>mdi-account-search</v-icon>
                        <div class="text-left">
                            <div class="font-weight-bold text-h4">
                                {{ countStudentsWithFewAppointments }}
                            </div>
                            <div class="subtitle">??tudiants avec peu de rendez-vous</div>
                        </div>
                    </v-card>

                    <v-card width="20vw" class="pa-3 d-flex align-center" :class="[
                      countElementsWaitingStatus > 0 ? 'card-warning' : 'card-success',
                    ]">
                        <v-icon class="card-icon rounded-circle mr-2" x-large>mdi-clock-alert-outline</v-icon>
                        <div class="text-left">
                            <div class="font-weight-bold text-h4">
                                {{ countElementsWaitingStatus }}
                            </div>
                            <div class="subtitle">??l??ments en attente de validation</div>
                        </div>
                    </v-card>

                    <v-card width="20vw" class="pa-3 d-flex align-center" :class="[
                      countElementsInvalidStatus > 0 ? 'card-error' : 'card-success',
                    ]">
                        <v-icon class="card-icon rounded-circle mr-2" x-large>mdi-account-multiple-remove</v-icon>
                        <div class="text-left">
                            <div class="font-weight-bold text-h4">
                                {{ countElementsInvalidStatus }}
                            </div>
                            <div class="subtitle">??l??ments invalides</div>
                        </div>
                    </v-card>

                    <v-card width="20vw" class="pa-3 d-flex align-center"
                        :class="[countStudentsInactive > 0 ? 'card-error' : 'card-success']">
                        <v-icon class="card-icon rounded-circle mr-2" x-large>mdi-account-question</v-icon>
                        <div class="text-left">
                            <div class="font-weight-bold text-h4">
                                {{ countStudentsInactive }}
                            </div>
                            <div class="subtitle">??tudiants inactifs</div>
                        </div>
                    </v-card>
                </div>

                <div class="d-flex flex-wrap justify-center" style="gap: 4vh">
                    <v-card class="chart-card pa-3" style="cursor: pointer" @click="$router.push('/admin')" outlined>
                        <div class="d-flex align-center">
                            <v-icon class="card-icon rounded-circle mr-2 primary" color="white" x-large>mdi-account
                            </v-icon>
                            <div class="text-left">
                                <div class="font-weight-bold text-h4 primary--text">
                                    {{ this.students.length }}
                                </div>
                                <div class="subtitle">??tudiants</div>
                            </div>
                        </div>
                        <div>
                            <pie-chart class="pie-chart" :chart-data="studentsData" :options="pieChartOptions">
                            </pie-chart>
                        </div>
                    </v-card>

                    <v-card class="chart-card pa-3" style="cursor: pointer" @click="$router.push('/admin?tab=2')"
                        outlined>
                        <div class="d-flex align-center">
                            <v-icon class="card-icon rounded-circle mr-2 success" color="white" x-large>mdi-domain
                            </v-icon>
                            <div class="text-left">
                                <div class="font-weight-bold text-h4 success--text">
                                    {{ this.companies.length }}
                                </div>
                                <div class="subtitle">Entreprises</div>
                            </div>
                        </div>
                        <pie-chart class="pie-chart" :chart-data="companiesData" :options="pieChartOptions"></pie-chart>
                    </v-card>

                    <v-card class="chart-card pa-3" style="cursor: pointer" @click="$router.push('/adminOffers')"
                        outlined>
                        <div class="d-flex align-center">
                            <v-icon class="card-icon rounded-circle mr-2 tertiary" color="white" x-large>mdi-offer
                            </v-icon>
                            <div class="text-left">
                                <div class="font-weight-bold text-h4 tertiary--text">
                                    {{ this.offers.length }}
                                </div>
                                <div class="subtitle">Offres</div>
                            </div>
                        </div>
                        <pie-chart class="pie-chart" :chart-data="offersData" :options="pieChartOptions"></pie-chart>
                    </v-card>
                </div>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col class="d-flex justify-center align-center" style="height: calc(100vh - 264px)">
                <v-progress-circular indeterminate size="50" color="primary"></v-progress-circular>
            </v-col>
        </v-row>

        <ConfirmDialogText v-if="dialogDateTimePicker" ref="refDialogDatePicker" color="warning"
            text="Mettre ?? jour la date du forum"
            subText="Cette action a de fortes cons??quences. Une fois valid??e, la date du forum sera mis ?? jour pour l'ensemble des repr??sentants et des ??tudiants."
            confirmText="VALIDE DATE ET HORAIRE" @cancel="dialogDateTimePicker = false" @confirm="publishDateHeure()"
            :isDateTimePicker="true" />

        <ConfirmDialogText v-if="dialogSurvey" color="warning" text="Envoyer le questionnaire de satisfaction" subText="Cette action a de fortes cons??quences. Une fois valid??e, l'enqu??te de satisfaction 
      sera automatiquement envoy??e ?? l'ensemble des repr??sentants et des ??tudiants."
            confirmText="ENVOYER QUESTIONNAIRE" @cancel="dialogSurvey = false" @confirm="sendSurvey()" />
    </v-container>
</template>

<script>
import PieChart from "./PieChart";
import { mapGetters } from "vuex";
import ConfirmDialogText from "../../components/ConfirmDialogText.vue";
import { sendSurvey } from "../../services/api";

export default {
    name: "AdminBoard",

    components: {
        ConfirmDialogText,
        PieChart,
    },

    data() {
        return {
            loading: true,
            studentsData: null,
            companiesData: null,
            offersData: null,
            pieChartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: "right",
                },
                borderWidth: 0,
            },
            studentsWithAppointment: 0,
            dialogSurvey: false,
            dialogDateTimePicker: false,
            date: null,
			heure: null,
            loadDatePickerButton: false,
            loadSurveyButton: false,
        };
    },

    computed: {
        ...mapGetters({
            students: "GET_STUDENTS",
            companies: "GET_COMPANIES",
            offers: "GET_OFFERS",
			dateForum: "GET_FORUM_DATE",
			heureForum: "GET_FORUM_HEURE",
        }),
        innerWidth() {
            return window.innerWidth;
        },

        countStudentsWithFewAppointments() {
            return this.students.length - this.studentsWithAppointment.length;
        },

        countElementsWaitingStatus() {
            return (
                this.students.filter((s) => s.status === "waiting").length +
                this.offers.filter((o) => o.status === "waiting").length
            );
        },

        countElementsInvalidStatus() {
            return (
                this.students.filter((s) => s.status === "notValidated").length +
                this.companies.filter((c) => !c.isValidated).length +
                this.offers.filter((o) => o.status === "notValidated").length
            );
        },

        countStudentsInactive() {
            return this.students.filter(
                (s) =>
                    !s.user.lastLogin ||
                    Math.floor(
                        (new Date() - new Date(s.user.lastLogin)) / (60 * 60 * 1000 * 24)
                    ) > 14
            ).length;
        },
    },

    methods: {
        openConfirmDialogText() {
            this.dialogSurvey = true;
        },

        openDateTimePicker() {
            this.dialogDateTimePicker = true;
        },

        publishDateHeure() {
            this.loadDatePickerButton = true;
			this.dialogDateTimePicker = false;
            this.$store.dispatch('setForumDateHeure', { 
				forumDate: this.$refs.refDialogDatePicker.$data.datePicker,
				forumHeure: `${this.$refs.refDialogDatePicker.$data.startTimePicker} - ${this.$refs.refDialogDatePicker.$data.endTimePicker}`
			}).then(() => {
				this.$store.commit("SET_POPUP", {
					text: `Date et horaire mis ?? jour !`,
					color: "success",
					visible: true,
				});
			})
			.catch((err) => {
				this.$store.commit("SET_POPUP", {
					text: `Echec de modification de la date du forum : ${err}`,
					color: "error",
					visible: true,
				});
			})
			.finally(() => {
				this.loadDatePickerButton = false;
			});
        },

        sendSurvey() {
            this.loadSurveyButton = true;
            this.dialogSurvey = false;
            sendSurvey()
                .then(() => {
                    this.$store.commit("SET_POPUP", {
                        text: `Envoi de l'enqu??te effectu??e`,
                        color: "success",
                        visible: true,
                    });
                })
                .catch((err) => {
                    this.$store.commit("SET_POPUP", {
                        text: `Echec de l'envoi de l'enqu??te : ${err}`,
                        color: "error",
                        visible: true,
                    });
                })
                .finally(() => {
                    this.loadSurveyButton = false;
                });
        },
    },

    async created() {
		this.date = this.dateForum; 
		this.heure = this.heureForum; 
        await this.$store.dispatch("getAllStudents");
        this.studentsData = {
            labels: ["Valid??s", "En attente", "Non valid??s"],
            datasets: [
                {
                    backgroundColor: ["#005672", "#007fa8", "#00c1ff"],
                    data: [
                        this.students.filter((s) => s.status === "validated").length,
                        this.students.filter((s) => s.status === "waiting").length,
                        this.students.filter((s) => s.status === "notValidated").length,
                    ],
                    borderWidth: 0,
                },
            ],
        };

        await this.$store.dispatch("getAllCompanies");
        this.companiesData = {
            labels: ["Valid??es", "Non valid??es"],
            datasets: [
                {
                    backgroundColor: ["#6CAE32", "#8eed3b"],
                    data: [
                        this.companies.filter((c) => c.isValidated).length,
                        this.companies.filter((c) => !c.isValidated).length,
                    ],
                    borderWidth: 0,
                },
            ],
        };

        await this.$store.dispatch("getAllOffers");
        this.offersData = {
            labels: ["Valid??es", "En attente", "Non valid??es"],
            datasets: [
                {
                    backgroundColor: ["#6e541b", "#b88d2c", "#FFC43D"],
                    data: [
                        this.offers.filter((o) => o.status === "validated").length,
                        this.offers.filter((o) => o.status === "waiting").length,
                        this.offers.filter((o) => o.status === "notValidated").length,
                    ],
                    borderWidth: 0,
                },
            ],
        };

        this.appointments = (await this.$store.dispatch("getAllAppointments")).data;
        this.studentsWithAppointment = this.students.filter((s) => {
            return this.appointments.filter((a) => a.studentId === s.id).length > 2;
        });

        this.loading = false;
    },
};
</script>

<style scoped>
.chartjs-size-monitor,
.chartjs-size-monitor-expand,
.chartjs-size-monitor-shrink {
    position: relative;
}

.pie-chart {
    width: 95%;
    position: absolute;
    left: 12px;
    right: 12px;
    top: 90px;
    bottom: 12px;
}

.chart-card {
    width: 25vw;
    height: 43vh;
    padding: 20px;
}

.chart-card:hover {
    box-shadow: none !important;
    background-color: rgba(0, 0, 0, 0.07) !important;
    opacity: none !important;
    transition: background-color 100ms;
}

@media (max-width: 960px) {
    .chart-card {
        width: 80vw;
        flex-direction: column;
    }
}

.v-card {
    box-shadow: none !important;
}

.card-icon {
    background-color: rgb(185, 185, 185);
    width: 55px;
    height: 55px;
}

.subtitle {
    font-size: 0.875rem;
}

.card-error {
    background-color: var(--v-error-base);
    color: white;
}

.card-error .card-icon {
    color: var(--v-error-base);
    background-color: white;
}

.card-warning {
    background-color: var(--v-warning-base);
    color: white;
}

.card-warning .card-icon {
    color: var(--v-warning-base);
    background-color: white;
}

.card-success {
    background-color: var(--v-success-base);
    color: white;
}

.card-success .card-icon {
    color: var(--v-success-base);
    background-color: white;
}
</style>