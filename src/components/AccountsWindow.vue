<template>
    <v-dialog v-model="localShowAccountsWindow" persistent max-width="800px">
        <v-card>
            <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
                {{ apiAlert.message }}
            </v-alert>
            <v-card-title class="window-title">Accounts</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-list dense class="scrollable-accounts">
                            <v-list-item v-for="account in accounts" :key="account.id" @click="selectAccount(account)"
                                :class="{ 'selected-account': selectedAccount && selectedAccount.id === account.id }"
                                class="account-item">
                                <v-list-item-content class="accounts-content">
                                    <v-list-item-title class="larger-text-accounts">{{ account.name
                                        }}</v-list-item-title>
                                    <v-list-item-subtitle class="larger-text-accounts">{{ account.description
                                        }}</v-list-item-subtitle>
                                    <v-list-item-subtitle class="larger-text-accounts balance">{{ account.balance }}
                                        €</v-list-item-subtitle>
                                    <v-list-item-action class="account-item">
                                        <v-btn icon small @click.stop="openEditDialog(account)"
                                            class="d-flex justify-center align-center">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click.stop="openDeleteDialog(account)"
                                            class="d-flex justify-center align-center">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
                <v-row v-if="selectedAccount">
                    <v-col cols="12">
                        <v-card class="rectangle">
                            <v-card-title>Balance Over Time</v-card-title>
                            <v-card-text>
                                <line-chart :transactions="selectedAccount.transactions"
                                    :current-balance="selectedAccount.balance"></line-chart>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeAccountsWindow">Close</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="showAddAccountDialog = true">Add</v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="showAddAccountDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Add New Account</v-card-title>
                <v-card-text>
                    <v-alert v-if="addAlert.visible" :type="addAlert.type" dismissible
                        @input="addAlert.visible = false">
                        {{ addAlert.message }}
                    </v-alert>
                    <br />
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="newAccount.name" label="Name"
                                    :rules="[v => !!v || 'Name is required']" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="newAccount.description" label="Description"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="newAccount.balance" label="Balance" type="number"
                                    :rules="[v => !!v || 'Balance is required']" required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text
                        @click="showAddAccountDialog = false; this.clearAlerts()">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="createAccount">Create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showEditAccountDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Edit Account</v-card-title>
                <v-card-text>
                    <v-alert v-if="updateAlert.visible" :type="updateAlert.type" dismissible
                        @input="updateAlert.visible = false">
                        {{ updateAlert.message }}
                    </v-alert>
                    <br />
                    <v-form ref="editForm" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="editAccount.name" label="Name"
                                    :rules="[v => !!v || 'Name is required']" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editAccount.description" label="Description"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text
                        @click="showEditAccountDialog = false; this.clearAlerts()">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="updateAccount">Update</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showDeleteAccountDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="window-title">Delete Account</v-card-title>
                <v-card-text>
                    <h1>Are you sure you want to delete this account?</h1>
                    <br />
                    <div v-if="accountToDelete">
                        <p><strong>Name:</strong> {{ accountToDelete.name }}</p>
                        <p><strong>Description:</strong> {{ accountToDelete.description }}</p>
                        <p><strong>Balance:</strong> {{ accountToDelete.balance }} €</p>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showDeleteAccountDialog = false">Cancel</v-btn>
                    <v-btn color="red darken-1" text @click="confirmDeleteAccount">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script>
import LineChart from './LineChart.vue';

export default {
    name: 'AccountsWindow',
    components: { LineChart },
    props: {
        showAccountsWindow: {
            type: Boolean,
            default: false
        },
        accounts: Array
    },
    data() {
        return {
            selectedAccount: null,
            showAddAccountDialog: false,
            showEditAccountDialog: false,
            showDeleteAccountDialog: false,
            newAccount: {
                name: '',
                description: '',
                balance: null
            },
            editAccount: {
                id: null,
                name: '',
                description: ''
            },
            accountToDelete: null,
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
        localShowAccountsWindow: {
            get() {
                return this.showAccountsWindow;
            },
            set(value) {
                this.$emit('update:showAccountsWindow', value);
            }
        }
    },
    methods: {
        selectAccount(account) {
            this.clearAlerts();
            if (!account.transactions || account.transactions.length === 0) {
                this.apiAlert = {
                    visible: true,
                    type: 'error',
                    message: 'There are no transactions for selected account!'
                };
                this.selectedAccount = null;
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            if (this.selectedAccount && account.id === this.selectedAccount.id) {
                this.selectedAccount = null;
                return;
            }

            this.selectedAccount = account;
        },
        closeAccountsWindow() {
            this.selectedAccount = null;
            this.localShowAccountsWindow = false;
            this.clearAlerts();
        },
        createAccount() {
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
                name: this.newAccount.name,
                balance: this.newAccount.balance,
                description: this.newAccount.description
            };

            this.$axios.post('/api/Account/create', payload)
                .then(response => {
                    console.log('Account created successfully', response);
                    this.$emit('accountCreated');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Account created successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showAddAccountDialog = false;
                    this.newAccount = {
                        name: '',
                        description: '',
                        balance: null
                    };
                })
                .catch(error => {
                    console.error('Error creating account', error);
                    try {
                        const errorArray = JSON.parse(error.response.data.detail);
                        const errorMessages = errorArray.map(error => error.ErrorMessage);
                        this.apiAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error creating account: ' + errorMessages[0]
                        };
                    }
                    catch (error2) {
                        this.apiAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error creating account: ' + error.response.data.title
                        };
                    }
                    setTimeout(this.clearAlerts, 5000);
                    this.showAddAccountDialog = false;
                });
        },
        openEditDialog(account) {
            this.editAccount = { ...account };
            this.showEditAccountDialog = true;
        },
        updateAccount() {
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
                id: this.editAccount.id,
                name: this.editAccount.name,
                description: this.editAccount.description
            };

            this.$axios.put('/api/Account/update', payload)
                .then(response => {
                    console.log('Account updated successfully', response);
                    this.$emit('accountUpdated');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Account updated successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showEditAccountDialog = false;
                    this.editAccount = {
                        name: '',
                        description: '',
                        id: null
                    };
                })
                .catch(error => {
                    console.error('Error updating account', error);
                    this.updateAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error updating account: ' + error.response.data.title
                    };
                    setTimeout(this.clearAlerts, 5000);
                });
        },
        openDeleteDialog(account) {
            this.accountToDelete = account;
            this.showDeleteAccountDialog = true;
        },
        confirmDeleteAccount() {
            const payload = {
                id: this.accountToDelete.id,
            }

            this.$axios({
                method: 'delete',
                url: '/api/Account/delete',
                data: payload
            })
                .then(response => {
                    console.log('Account deleted successfully', response);
                    this.$emit('accountDeleted');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Account deleted successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                })
                .catch(error => {
                    console.error('Error deleting account', error.message);
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error deleting account: ' + error.message
                    };
                    setTimeout(this.clearAlerts, 5000);
                });

            this.showDeleteAccountDialog = false;
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
        }
    },
    watch: {
        showAccountsWindow(newVal) {
            this.localShowAccountsWindow = newVal;
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

.scrollable-accounts {
    max-height: 300px;
    overflow-y: auto;
}

.accounts-content {
    display: grid;
    grid-template-columns: 25% 35% 20% 20%;
    justify-content: start;
    justify-items: start;
    width: 100%;
}

.account-item .v-btn {
    max-width: 30px;
    max-height: 30px;
    padding: 5%;
}

.account-item .v-list-item-action {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.account-item .v-list-item-action .v-btn {
    margin-left: 8px;
}

.selected-account {
    background-color: #e3f2fd;
}

.date-clear-button {
    margin-left: 8px;
}

.larger-text-accounts {
    font-size: 1.5rem;
    font-weight: bold;
    padding-bottom: 2px;
    line-height: 1.5;
}

.balance {
    color: #3f51b5;
}
</style>