<template>
    <v-dialog v-model="localShowAccountsWindow" persistent max-width="800px">
        <v-card>
            <v-card-title class="window-title">Accounts</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-list dense class="scrollable-accounts">
                            <v-list-item v-for="account in accounts" :key="account.id" @click="selectAccount(account)"
                                :class="{ 'selected-account': selectedAccount && selectedAccount.id === account.id }"
                                class="account-item">
                                <v-list-item-content class="accounts-content">
                                    <v-list-item-title>{{ account.name }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ account.description }}</v-list-item-subtitle>
                                    <v-list-item-subtitle>{{ account.balance }} €</v-list-item-subtitle>
                                    <v-list-item-action class="account-item">
                                        <v-btn icon small @click.stop="openEditDialog(account)">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click.stop="openDeleteDialog(account)">
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
                                <line-chart :transactions="selectedAccount.transactions"></line-chart>
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

        <!-- Add Account Dialog -->
        <v-dialog v-model="showAddAccountDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Add New Account</v-card-title>
                <v-card-text>
                    <v-alert v-if="alert.visible" :type="alert.type" dismissible @input="alert.visible = false">
                        {{ alert.message }}
                    </v-alert>
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
                    <v-btn color="blue darken-1" text @click="showAddAccountDialog = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="createAccount">Create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Account Dialog -->
        <v-dialog v-model="showEditAccountDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Edit Account</v-card-title>
                <v-card-text>
                    <v-alert v-if="alert.visible" :type="alert.type" dismissible @input="alert.visible = false">
                        {{ alert.message }}
                    </v-alert>
                    <v-form ref="editForm" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="editAccount.name" label="Name"
                                    :rules="[v => !!v || 'Name is required']" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editAccount.description" label="Description"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editAccount.balance" label="Balance" type="number"
                                    :rules="[v => !!v || 'Balance is required']" required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showEditAccountDialog = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="updateAccount">Update</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Account Dialog -->
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
import LineChart from './LineChart.vue'; // Ensure you have a LineChart component

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
            localShowAccountsWindow: this.showAccountsWindow,
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
                description: '',
                balance: null
            },
            accountToDelete: null,
            valid: false,
            alert: {
                visible: false,
                type: '',
                message: ''
            }
        };
    },
    methods: {
        selectAccount(account) {
            this.selectedAccount = account;
        },
        closeAccountsWindow() {
            this.localShowAccountsWindow = false;
        },
        createAccount() {
            this.$refs.form.validate();
            if (!this.valid) {
                this.alert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(() => this.alert.visible = false, 5000);
                return;
            }
            // API call to create account
        },
        openEditDialog(account) {
            this.editAccount = { ...account };
            this.showEditAccountDialog = true;
        },
        updateAccount() {
            this.$refs.editForm.validate();
            if (!this.valid) {
                this.alert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(() => this.alert.visible = false, 5000);
                return;
            }
            // API call to update account
        },
        openDeleteDialog(account) {
            this.accountToDelete = account;
            this.showDeleteAccountDialog = true;
        },
        confirmDeleteAccount() {
            // API call to delete account
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
</style>