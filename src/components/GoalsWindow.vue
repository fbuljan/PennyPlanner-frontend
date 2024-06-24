<template>
    <v-dialog v-model="localShowGoalsWindow" persistent max-width="1600px">
        <v-card>
            <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
                {{ apiAlert.message }}
            </v-alert>
            <v-card-title class="window-title">Goals</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-list dense class="scrollable-goals">
                            <v-list-item v-for="goal in goals" :key="goal.id" class="goal-item">
                                <v-list-item-content class="goals-content">
                                    <v-list-item-title class="larger-text-goals">{{ goal.name }}</v-list-item-title>
                                    <v-progress-linear :model-value="getGoalProgress(goal)" :min="0" :max="100"
                                        :color="getProgressColor(goal)" rounded striped height="20" style="top: 10px">
                                        <template v-slot:default>
                                            <strong>{{ getGoalProgress(goal).toFixed(2) }}%</strong>
                                        </template>
                                    </v-progress-linear>
                                    <v-list-item-subtitle class="larger-text-goals balance">{{ goal.currentValue + " €"}} / {{
                                        goal.targetValue + " €"}}</v-list-item-subtitle>
                                    <v-list-item-subtitle class="larger-text-goals">{{ getDaysUntil(goal.endDate) }}
                                        days left</v-list-item-subtitle>
                                    <v-list-item-subtitle class="larger-text-goals">{{ getGoalTypeName(goal.goalType) }}
                                    </v-list-item-subtitle>
                                    <v-list-item-action class="goal-item">
                                        <v-btn icon small @click.stop="openEditDialog(goal)"
                                            class="d-flex justify-center align-center">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click.stop="openDeleteDialog(goal)"
                                            class="d-flex justify-center align-center">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeGoalsWindow">Close</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="showAddGoalDialog = true">Add</v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="showAddGoalDialog" persistent max-width="600px">
    <v-card>
        <v-card-title class="window-title">Add New Goal</v-card-title>
        <v-card-text>
            <v-alert v-if="addAlert.visible" :type="addAlert.type" dismissible @input="addAlert.visible = false">
                {{ addAlert.message }}
            </v-alert>
            <br />
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="newGoal.name" label="Name"
                            :rules="[v => !!v || 'Name is required']" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select v-model="newGoal.goalType" :items="goalTypeOptions" item-text="name"
                            item-value="value" label="Goal Type" :rules="[v => !!v || 'Goal Type is required']"
                            required></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newGoal.endDate" label="End Date" type="date"
                            :rules="[v => !!v || 'End Date is required']" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newGoal.targetValue" label="Target Value" type="number"
                            :rules="[v => !!v || 'Target Value is required']" required></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="isAccountRequired">
                        <v-select v-model="newGoal.accountName" :items="accountOptions" label="Account"
                            item-text="name" item-value="id" :rules="accountRules"
                            required></v-select>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="blue darken-1" text @click="showAddGoalDialog = false; this.clearAlerts()">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="createGoal">Create</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>

        <v-dialog v-model="showEditGoalDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Edit Goal</v-card-title>
                <v-card-text>
                    <v-alert v-if="updateAlert.visible" :type="updateAlert.type" dismissible
                        @input="updateAlert.visible = false">
                        {{ updateAlert.message }}
                    </v-alert>
                    <br />
                    <v-form ref="editForm" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="editGoal.name" label="Name"
                                    :rules="[v => !!v || 'Name is required']" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="editGoal.goalType" :items="goalTypeOptions" item-text="name"
                                    item-value="value" label="Goal Type"></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editGoal.endDate" label="End Date" type="date"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editGoal.targetValue" label="Target Value"
                                    type="number"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text
                        @click="showEditGoalDialog = false; this.clearAlerts()">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="updateGoal">Update</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showDeleteGoalDialog" persistent max-width="700px">
            <v-card>
                <v-card-title class="window-title">Delete Goal</v-card-title>
                <v-card-text>
                    <h1>Are you sure you want to delete this goal?</h1>
                    <br />
                    <div v-if="goalToDelete">
                        <p><strong>Name:</strong> {{ goalToDelete.name }}</p>
                        <p><strong>Goal Type:</strong> {{ getGoalTypeName(goalToDelete.goalType) }}</p>
                        <p><strong>Target Value:</strong> {{ goalToDelete.targetValue }}</p>
                        <p><strong>Current Value:</strong> {{ goalToDelete.currentValue }}</p>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showDeleteGoalDialog = false">Cancel</v-btn>
                    <v-btn color="red darken-1" text @click="confirmDeleteGoal">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script>
export default {
    name: 'GoalsWindow',
    props: {
        showGoalsWindow: {
            type: Boolean,
            default: false
        },
        goals: Array,
        goalTypes: Array,
        accounts: Array
    },
    data() {
        return {
            showAddGoalDialog: false,
            showEditGoalDialog: false,
            showDeleteGoalDialog: false,
            newGoal: {
                name: '',
                goalType: null,
                endDate: '',
                targetValue: null,
                accountName: null
            },
            editGoal: {
                id: null,
                name: '',
                goalType: null,
                endDate: '',
                targetValue: null
            },
            goalToDelete: null,
            valid: false,
            addAlert: {
                visible: false,
                type: '',
                message: ''
            },
            updateAlert: {
                visible: false,
                type: '',
                message: ''
            },
            apiAlert: {
                visible: false,
                type: '',
                message: ''
            }
        };
    },
    computed: {
        localShowGoalsWindow: {
            get() {
                return this.showGoalsWindow;
            },
            set(value) {
                this.$emit('update:showGoalsWindow', value);
            }
        },
        goalTypeOptions() {
            return this.goalTypes.map(goal => goal.name);
        },
        accountOptions() {
            return this.accounts.map(account => account.name);
        },
        isAccountRequired() {
            const goalType = this.goalTypes.find(type => type.name === this.newGoal.goalType);
            if (goalType !== undefined) {
                return goalType.value === 1;
            }
            return false;
        }
    },
    methods: {
        closeGoalsWindow() {
            this.localShowGoalsWindow = false;
            this.clearAlerts();
        },
        createGoal() {
            this.$refs.form.validate();
            if (!this.valid) {
                this.addAlert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            const payload = {
                userId: localStorage.getItem('id'),
                name: this.newGoal.name,
                goalType: this.newGoal.goalType,
                endDate: this.newGoal.endDate,
                targetValue: this.newGoal.targetValue,
                accountId: null //todo implement account binding
            };

            this.$axios.post('/api/Goal/create', payload)
                .then(response => {
                    console.log('Goal created successfully', response);
                    this.$emit('goalCreated');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Goal created successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showAddGoalDialog = false;
                    this.newGoal = {
                        name: '',
                        goalType: null,
                        endDate: '',
                        targetValue: null
                    };
                })
                .catch(error => {
                    //todo error handling -> validation errors
                    console.error('Error creating goal', error);
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error creating goal: ' + error.response.data.title
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showAddGoalDialog = false;
                });
        },
        openEditDialog(goal) {
            this.editGoal = { 
                id: goal.id,
                targetValue: goal.targetValue,
                name: goal.name,
                goalType: this.getGoalTypeName(goal.goalType),
                endDate: this.formatDate(goal.endDate)
            };
            this.showEditGoalDialog = true;
        },
        updateGoal() {
            this.$refs.editForm.validate();
            if (!this.valid) {
                this.updateAlert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            const payload = {
                id: this.editGoal.id,
                name: this.editGoal.name,
                goalType: this.editGoal.goalType,
                endDate: this.editGoal.endDate,
                targetValue: this.editGoal.targetValue
            };

            this.$axios.put('/api/Goal/update', payload)
                .then(response => {
                    console.log('Goal updated successfully', response);
                    this.$emit('goalUpdated');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Goal updated successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showEditGoalDialog = false;
                    this.editGoal = {
                        id: null,
                        name: '',
                        goalType: null,
                        endDate: '',
                        targetValue: null
                    };
                })
                .catch(error => {
                    console.error('Error updating goal', error);
                    this.updateAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error updating goal: ' + error.response.data.title
                    };
                    setTimeout(this.clearAlerts, 5000);
                });
        },
        openDeleteDialog(goal) {
            this.goalToDelete = goal;
            this.showDeleteGoalDialog = true;
        },
        confirmDeleteGoal() {
            const payload = {
                id: this.goalToDelete.id,
            }

            this.$axios({
                method: 'delete',
                url: '/api/Goal/delete',
                data: payload
            })
                .then(response => {
                    console.log('Goal deleted successfully', response);
                    this.$emit('goalDeleted');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Goal deleted successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                })
                .catch(error => {
                    console.error('Error deleting goal', error.message);
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error deleting goal: ' + error.message
                    };
                    setTimeout(this.clearAlerts, 5000);
                });

            this.showDeleteGoalDialog = false;
        },
        clearAlerts() {
            this.addAlert = {
                visible: false,
                type: '',
                message: ''
            };
            this.apiAlert = {
                visible: false,
                type: '',
                message: ''
            };
            this.updateAlert = {
                visible: false,
                type: '',
                message: ''
            }
        },
        getGoalProgress(goal) {
            if (goal.goalType === 3) {
                return (goal.targetValue / goal.currentValue) * 100;
            }
            return (goal.currentValue / goal.targetValue) * 100;
        },
        getProgressColor(goal) {
            const progress = this.getGoalProgress(goal);
            if (progress < 25) {
                return 'red';
            } else if (progress < 50) {
                return 'orange';
            } else if (progress < 75) {
                return 'yellow';
            } else {
                return 'green';
            }
        },
        getDaysUntil(endDate) {
            const end = new Date(endDate);
            const today = new Date();
            const diff = end - today;
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        },
        getGoalTypeName(goalTypeValue) {
            const goalType = this.goalTypes.find(type => type.value === goalTypeValue);
            return goalType ? goalType.name : 'Unknown';
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const day = ('0' + date.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        }
    },
    watch: {
        showGoalsWindow(newVal) {
            this.localShowGoalsWindow = newVal;
        }
    }
};
</script>

<style scoped>
.rectangle {
    min-height: 250px;
    padding: 0.5vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.window-title {
    font-size: 2rem;
    font-weight: 700;
    color: #3f51b5;
    text-align: center;
    width: 100%;
}

.scrollable-goals {
    max-height: 300px;
    overflow-y: auto;
}

.goals-content {
    display: grid;
    grid-template-columns: 20% 25% 15% 12.5% 22.5% 5%;
    justify-content: start;
    justify-items: start;
    width: 100%;
}

.goal-item .v-btn {
    max-width: 30px;
    max-height: 30px;
    padding: 5%;
}

.goal-item .v-list-item-action {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.goal-item .v-list-item-action .v-btn {
    margin-left: 8px;
}

.larger-text-goals {
    font-size: 1.5rem;
    font-weight: bold;
    padding-bottom: 2px;
    line-height: 1.5;
}

.v-progress-linear {
    width: 90%;
}

.balance {
    color: #3f51b5;
}
</style>
