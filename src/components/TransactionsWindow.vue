<template>
    <v-dialog v-model="localShowTransactionsWindow" persistent max-width="800px">
        <v-card>
            <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
                {{ apiAlert.message }}
            </v-alert>
            <v-card-title class="window-title">Transactions history</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6" class="d-flex">
                        <v-text-field v-model="localFilterPeriodStart" label="From" type="date"
                            prepend-icon="mdi-calendar" class="flex-grow-1"></v-text-field>
                        <v-btn icon @click="clearDate('start')" class="date-clear-button">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="6" class="d-flex">
                        <v-text-field v-model="localFilterPeriodEnd" label="To" type="date" prepend-icon="mdi-calendar"
                            class="flex-grow-1"></v-text-field>
                        <v-btn icon @click="clearDate('end')" class="date-clear-button">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-list dense class="scrollable-transactions">
                            <v-list-item v-for="transaction in filteredTransactions" :key="transaction.id"
                                class="transaction-item">
                                <v-list-item-content class="transactions-content">
                                    <v-list-item-title class="transaction-title"
                                        :style="transaction.transactionType == 0 ? 'color: black;' : transaction.transactionType < 0 ? 'color: red;' : 'color: green;'">
                                        <template v-if="transaction.transactionType === -1">
                                            <v-icon color="red">mdi-arrow-down</v-icon>
                                        </template>
                                        <template v-else-if="transaction.transactionType === 1">
                                            <v-icon color="green">mdi-arrow-up</v-icon>
                                        </template>
                                        {{ transaction.amount }} €
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="larger-text-transaction">
                                        {{ transaction.accountName }}
                                    </v-list-item-subtitle>
                                    <v-list-item-subtitle class="larger-text-transaction">
                                        {{ transaction.description ? transaction.description : 'No description' }}
                                    </v-list-item-subtitle>
                                    <v-list-item-subtitle class="larger-text-transaction">
                                        {{ new Date(transaction.date).toLocaleDateString() }}
                                    </v-list-item-subtitle>
                                    <v-list-item-action class="transaction-item">
                                        <v-btn v-if="transaction.transactionType === 0" icon small
                                            @click="applyTemplate(transaction)">
                                            <v-icon>mdi-check</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click="openUpdateDialog(transaction)">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click="deleteTransaction(transaction)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
                <v-row v-if="!filtersApplied">
                    <v-col cols="12">
                        <v-card class="rectangle">
                            <v-card-title>Period stats</v-card-title>
                            <v-card-text>
                                <div class="stats-item">
                                    <strong>Most used account:</strong> {{ filteredMostUsedAccount.name }} ({{
                                        filteredMostUsedAccount.transactions.length }} transactions)
                                </div>
                                <div class="stats-item">
                                    <strong>Transaction categories:</strong>
                                    <div v-for="(count, category) in filteredCategoryCounts" :key="category">
                                        {{ getCategoryName(category) }}: {{ count }}
                                    </div>
                                </div>
                                <div class="stats-item" v-if="!isNaN(filteredTotalIncome)">
                                    <strong>Total income for period:</strong> {{ filteredTotalIncome.toFixed(2) }} €
                                </div>
                                <div class="stats-item" v-if="!isNaN(filteredTotalExpenditure)">
                                    <strong>Total expenditure for period:</strong> {{
                                        filteredTotalExpenditure.toFixed(2) }} €
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-btn @click="showFilterDialog = true">Filter</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeTransactionsWindow">Close</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="showAddTransactionDialog = true">Add</v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="showFilterDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="window-title">Filter Transactions</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" class="d-flex">
                            <v-select v-model="localFilterAccount" :items="accountOptions" label="Account"
                                class="flex-grow-1"></v-select>
                            <v-btn icon @click="clearFilter('account')">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12" class="d-flex">
                            <v-select v-model="localFilterCategory" :items="categoryOptions" label="Category"
                                class="flex-grow-1"></v-select>
                            <v-btn icon @click="clearFilter('category')">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12" class="d-flex">
                            <v-select v-model="localFilterTransactionType" :items="transactionTypeOptions"
                                label="Transaction Type" class="flex-grow-1"></v-select>
                            <v-btn icon @click="clearFilter('transactionType')">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showFilterDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-dialog>

    <v-dialog v-model="showAddTransactionDialog" persistent max-width="600px">
        <v-card>
            <v-card-title class="window-title">Add New Transaction</v-card-title>
            <v-card-text>
                <v-alert v-if="alert.visible" :type="alert.type" dismissible @input="alert.visible = false">
                    {{ alert.message }}
                </v-alert>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.accountName" :items="accountOptions" label="Account"
                                item-text="name" item-value="id" :rules="[v => !!v || 'Account is required']"
                                required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.amount" label="Amount" type="number"
                                :rules="[v => !!v || 'Amount is required']" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.date" label="Date" type="date"
                                :rules="[v => !!v || 'Date is required']" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.transactionType" :items="transactionTypeOptions"
                                label="Transaction Type" :rules="[v => !!v || 'Transaction type is required']"
                                required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.transactionCategory" :items="categoryOptions"
                                label="Category" :rules="[v => !!v || 'Category is required']" required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.description" label="Description"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.otherAccountName" :items="accountOptions"
                                label="Other account" item-text="name" item-value="id"></v-select>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="showAddTransactionDialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="createTransaction">Create</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" persistent max-width="400px">
        <v-card>
            <v-card-title class="window-title">Delete Transaction</v-card-title>
            <v-card-text>
                <h1>Are you sure you want to delete this transaction?</h1>
                <br />
                <div v-if="transactionToDelete">
                    <p><strong>Amount:</strong> {{ transactionToDelete.amount }} €</p>
                    <p><strong>Account:</strong> {{ transactionToDelete.accountName }}</p>
                    <p><strong>Description:</strong> {{ transactionToDelete.description || 'No description' }}</p>
                    <p><strong>Date:</strong> {{ new Date(transactionToDelete.date).toLocaleDateString() }}</p>
                </div>
                <v-checkbox v-model="restoreBalance" label="Restore balance"></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="showDeleteDialog = false">Cancel</v-btn>
                <v-btn color="red darken-1" text @click="confirmDeleteTransaction">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showUpdateTransactionDialog" persistent max-width="600px">
        <v-card>
            <v-card-title class="window-title">Update Transaction</v-card-title>
            <v-card-text>
                <v-alert v-if="updateAlert.visible" :type="updateAlert.type" dismissible
                    @input="updateAlert.visible = false">
                    {{ updateAlert.message }}
                </v-alert>
                <v-form ref="updateForm" v-model="updateValid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="updatedTransaction.amount" label="Amount"
                                type="number"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="updatedTransaction.date" label="Date" type="date"
                                :rules="[v => !!v || 'Date is required']" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="updatedTransaction.transactionType" :items="transactionTypeOptions"
                                label="Transaction Type"></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="updatedTransaction.transactionCategory" :items="categoryOptions"
                                label="Category"></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="updatedTransaction.description" label="Description"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="showUpdateTransactionDialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="updateTransaction">Update</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'TransactionsWindow',
    props: {
        showTransactionsWindow: {
            type: Boolean,
            default: false
        },
        transactions: Array,
        accounts: Array,
        categories: Array,
        filterPeriodStart: String,
        filterPeriodEnd: String,
        filterAccount: String,
        filterCategory: String,
        filterTransactionType: String
    },
    data() {
        return {
            localFilterPeriodStart: this.filterPeriodStart,
            localFilterPeriodEnd: this.filterPeriodEnd,
            localFilterAccount: this.filterAccount,
            localFilterCategory: this.filterCategory,
            localFilterTransactionType: this.filterTransactionType,
            showFilterDialog: false,
            showAddTransactionDialog: false,
            newTransaction: {
                accountName: null,
                amount: null,
                date: new Date().toISOString().substr(0, 10),
                transactionType: null,
                transactionCategory: null,
                description: '',
                otherAccountName: null
            },
            valid: false,
            alert: {
                visible: false,
                type: '',
                message: ''
            },
            apiAlert: {
                visible: false,
                type: '',
                message: ''
            },
            showDeleteDialog: false,
            transactionToDelete: null,
            restoreBalance: false,
            showUpdateTransactionDialog: false,
            updatedTransaction: {
                amount: null,
                date: '',
                transactionType: null,
                transactionCategory: null,
                description: ''
            },
            updateValid: false,
            updateAlert: {
                visible: false,
                type: '',
                message: ''
            }
        };
    },
    computed: {
        localShowTransactionsWindow: {
            get() {
                return this.showTransactionsWindow;
            },
            set(value) {
                this.$emit('update:showTransactionsWindow', value);
            }
        },
        filtersApplied() {
            return this.localFilterAccount !== '' || this.localFilterCategory !== '' || this.localFilterTransactionType !== '';
        },
        filteredTransactions() {
            const startDate = this.localFilterPeriodStart ? new Date(this.localFilterPeriodStart) : null;
            const endDate = this.localFilterPeriodEnd ? new Date(this.localFilterPeriodEnd) : null;

            return this.transactions
                .filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    let matchesFilters = this.localFilterTransactionType === 'Template' ? transaction.transactionType === 0 :
                        transaction.transactionType !== 0;

                    if (matchesFilters && (startDate || endDate)) {
                        if (startDate && endDate) {
                            matchesFilters = transactionDate >= startDate && transactionDate <= endDate;
                        } else if (startDate) {
                            matchesFilters = transactionDate >= startDate;
                        } else if (endDate) {
                            matchesFilters = transactionDate <= endDate;
                        }
                    }

                    if (matchesFilters && this.localFilterAccount) {
                        const account = this.accounts.find(account => account.transactions && account.transactions.some(accTransaction => accTransaction.id === transaction.id));
                        matchesFilters = account && account.name === this.localFilterAccount;
                    }

                    if (matchesFilters && this.localFilterCategory) {
                        const category = this.categories.find(category => category.name === this.localFilterCategory);
                        if (category) {
                            matchesFilters = transaction.transactionCategory === category.value;
                        } else {
                            matchesFilters = false;
                        }
                    }

                    if (matchesFilters && this.localFilterTransactionType) {
                        let transactionTypeValue;
                        if (this.localFilterTransactionType === 'Income') transactionTypeValue = 1;
                        else if (this.localFilterTransactionType === 'Expense') transactionTypeValue = -1;
                        else if (this.localFilterTransactionType === 'Template') transactionTypeValue = 0;

                        matchesFilters = transaction.transactionType === transactionTypeValue;
                    }

                    return matchesFilters;
                })
                .map(transaction => {
                    const account = this.accounts.find(account => account.transactions && account.transactions.some(accTransaction => accTransaction.id === transaction.id));
                    return {
                        ...transaction,
                        accountName: account ? account.name : 'Unknown'
                    };
                });
        },
        filteredMostUsedAccount() {
            const accountTransactionCounts = this.accounts.reduce((acc, account) => {
                if (!account.transactions || account.transactions.length === 0) {
                    return acc;
                }

                const filterStart = this.localFilterPeriodStart ? new Date(this.localFilterPeriodStart) : new Date(-8640000000000000); // Min date
                const filterEnd = this.localFilterPeriodEnd ? new Date(this.localFilterPeriodEnd) : new Date(8640000000000000); // Max date

                const filteredTransactions = account.transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    return transaction.transactionType !== 0 &&
                        transactionDate >= filterStart &&
                        transactionDate <= filterEnd;
                });

                acc[account.name] = filteredTransactions.length;

                return acc;
            }, {});

            const mostUsedAccountName = Object.keys(accountTransactionCounts).reduce((a, b) => {
                return accountTransactionCounts[a] > accountTransactionCounts[b] ? a : b;
            }, null);

            if (!mostUsedAccountName || accountTransactionCounts[mostUsedAccountName] === 0) {
                return { name: 'None', transactions: [] };
            }

            const mostUsedAccount = this.accounts.find(account => account.name === mostUsedAccountName);

            return {
                name: mostUsedAccount.name,
                transactions: mostUsedAccount.transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    const filterStart = this.localFilterPeriodStart ? new Date(this.localFilterPeriodStart) : new Date(-8640000000000000);
                    const filterEnd = this.localFilterPeriodEnd ? new Date(this.localFilterPeriodEnd) : new Date(8640000000000000);

                    return transaction.transactionType !== 0 &&
                        transactionDate >= filterStart &&
                        transactionDate <= filterEnd;
                })
            };
        },
        filteredCategoryCounts() {
            return this.filteredTransactions.reduce((acc, transaction) => {
                if (!acc[transaction.transactionCategory]) {
                    acc[transaction.transactionCategory] = 0;
                }
                acc[transaction.transactionCategory]++;
                return acc;
            }, {});
        },
        filteredTotalIncome() {
            const incomeTransactions = this.filteredTransactions.filter(t => t.transactionType === 1);
            return incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
        },
        filteredTotalExpenditure() {
            const expenditureTransactions = this.filteredTransactions.filter(t => t.transactionType === -1);
            return expenditureTransactions.reduce((acc, t) => acc + t.amount, 0);
        },
        accountOptions() {
            return this.accounts.map(account => account.name);
        },
        categoryOptions() {
            return this.categories.map(category => category.name);
        },
        transactionTypeOptions() {
            return ['Income', 'Expense', 'Template'];
        }
    },
    methods: {
        applyTemplate(transaction) {
            let otherAccountName = null;

            if (transaction.otherAccountId !== null) {
                otherAccountName = this.accounts.find(account => account.id === transaction.otherAccountId).name;
            }

            const category = this.categories.find(category => category.value === transaction.transactionCategory).name;

            this.newTransaction = {
                accountName: transaction.accountName,
                amount: transaction.amount,
                description: transaction.description,
                transactionCategory: category,
                otherAccountName
            }

            this.showAddTransactionDialog = true;
        },
        closeTransactionsWindow() {
            this.localShowTransactionsWindow = false;
            this.clearAlerts();
        },
        clearAlerts() {
            this.alert = {
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
        clearDate(type) {
            if (type === 'start') {
                this.localFilterPeriodStart = '';
            } else if (type === 'end') {
                this.localFilterPeriodEnd = '';
            }
        },
        createTransaction() {
            this.$refs.form.validate();
            if (!this.valid) {
                this.alert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            try {
                const accountId = this.accounts.find(account => account.name === this.newTransaction.accountName).id;
                const category = this.categories.find(category => category.name === this.newTransaction.transactionCategory);

                let otherAccountId = null;

                if (this.newTransaction.otherAccountName !== null) {
                    otherAccountId = this.accounts.find(account => account.name === this.newTransaction.otherAccountName).id;
                }

                let transactionTypeValue;
                if (this.newTransaction.transactionType === 'Income') transactionTypeValue = 1;
                else if (this.newTransaction.transactionType === 'Expense') transactionTypeValue = -1;
                else if (this.newTransaction.transactionType === 'Template') transactionTypeValue = 0;

                const payload = {
                    accountId: accountId,
                    amount: parseFloat(this.newTransaction.amount),
                    date: this.newTransaction.date,
                    transactionType: transactionTypeValue,
                    transactionCategory: category.value,
                    description: this.newTransaction.description,
                    otherAccountId
                };

                this.$axios.post('/api/Transaction/create', payload)
                    .then(response => {
                        console.log('Transaction created successfully', response);
                        this.$emit('transactionCreated');
                        this.apiAlert = {
                            visible: true,
                            type: 'success',
                            message: 'Transaction created successfully!'
                        };
                        setTimeout(this.clearAlerts, 5000);
                    })
                    .catch(error => {
                        console.error('Error creating transaction', error);
                        const errorArray = JSON.parse(error.response.data.detail);
                        const errorMessages = errorArray.map(error => error.ErrorMessage);
                        this.apiAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error creating transaction: ' + errorMessages[0]
                        };
                        setTimeout(this.clearAlerts, 5000);
                    });

                this.showAddTransactionDialog = false;
                this.newTransaction = {
                    accountName: null,
                    amount: null,
                    date: new Date().toISOString().substr(0, 10),
                    transactionType: null,
                    transactionCategory: null,
                    description: '',
                    otherAccountName: null
                };
            } catch (error) {
                console.error(error);
                this.showAddTransactionDialog = false;
                this.alert = {
                    visible: true,
                    type: 'error',
                    message: 'Error creating transaction: ' + error.message
                };
                setTimeout(this.clearAlerts, 5000);
            }
        },
        openDeleteDialog(transaction) {
            this.transactionToDelete = transaction;
            this.showDeleteDialog = true;
        },
        confirmDeleteTransaction() {
            const payload = {
                id: this.transactionToDelete.id,
                resetAmount: this.restoreBalance
            }

            this.$axios({
                method: 'delete',
                url: '/api/Transaction/delete',
                data: payload
            })
                .then(response => {
                    console.log('Transaction deleted successfully', response);
                    this.$emit('transactionDeleted');
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Transaction deleted successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                })
                .catch(error => {
                    console.error('Error deleting transaction', error.message);
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error deleting transaction: ' + error.message
                    };
                    setTimeout(this.clearAlerts, 5000);
                });
            this.showDeleteDialog = false;
            this.transactionToDelete = null;
            this.restoreBalance = false;
        },
        deleteTransaction(transaction) {
            this.openDeleteDialog(transaction);
        },
        openUpdateDialog(transaction) {
            let transactionTypeValue;
            if (transaction.transactionType === 1) transactionTypeValue = 'Income';
            else if (transaction.transactionType === -1) transactionTypeValue = 'Expense';
            else if (transaction.transactionType === 0) transactionTypeValue = 'Template';

            this.updatedTransaction = {
                id: transaction.id,
                amount: transaction.amount,
                date: this.formatDate(transaction.date),
                description: transaction.description,
                transactionType: transactionTypeValue,
                transactionCategory: this.getCategoryName(transaction.transactionCategory)
            };
            this.showUpdateTransactionDialog = true;
        },
        async updateTransaction() {
            this.$refs.updateForm.validate();
            if (!this.updateValid) {
                this.updateAlert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all required fields.'
                };
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            try {
                let transactionTypeValue;
                if (this.updatedTransaction.transactionType === 'Income') transactionTypeValue = 1;
                else if (this.updatedTransaction.transactionType === 'Expense') transactionTypeValue = -1;
                else if (this.updatedTransaction.transactionType === 'Template') transactionTypeValue = 0;

                const category = this.categories.find(category => category.name === this.updatedTransaction.transactionCategory);

                const payload = {
                    id: this.updatedTransaction.id,
                    amount: parseFloat(this.updatedTransaction.amount),
                    date: this.updatedTransaction.date,
                    transactionType: transactionTypeValue,
                    transactionCategory: category.value,
                    description: this.updatedTransaction.description
                };

                await this.$axios.put(`/api/Transaction/update`, payload);
                this.$emit('transactionUpdated');
                this.apiAlert = {
                    visible: true,
                    type: 'success',
                    message: 'Transaction updated successfully!'
                };
                setTimeout(this.clearAlerts, 5000);
                this.showUpdateTransactionDialog = false;
            } catch (error) {
                console.error('Error updating transaction', error);
                try {
                    const errorArray = JSON.parse(error.response.data.detail);
                    const errorMessages = errorArray.map(error => error.ErrorMessage);
                    this.updateAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error updating transaction: ' + errorMessages[0]
                    };
                }
                catch (error2) {
                    this.updateAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error updating transaction: ' + error.response.data.title
                    };
                }
                setTimeout(this.clearAlerts, 5000);
            }
        },
        getCategoryName(categoryId) {
            for (let i = 0; i < this.categories.length; i++) {
                if (this.categories[i].value == categoryId) {
                    return this.categories[i].name;
                }
            }
            return null;
        },
        clearFilter(filterType) {
            if (filterType === 'account') {
                this.localFilterAccount = '';
            } else if (filterType === 'category') {
                this.localFilterCategory = '';
            } else if (filterType === 'transactionType') {
                this.localFilterTransactionType = '';
            }
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
        filterPeriodStart(newVal) {
            this.localFilterPeriodStart = newVal;
        },
        filterPeriodEnd(newVal) {
            this.localFilterPeriodEnd = newVal;
        },
        filterAccount(newVal) {
            this.localFilterAccount = newVal;
        },
        filterCategory(newVal) {
            this.localFilterCategory = newVal;
        },
        filterTransactionType(newVal) {
            this.localFilterTransactionType = newVal;
        },
        showFilterWindow(newVal) {
            this.localShowFilterWindow = newVal;
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

.scrollable-transactions {
    max-height: 300px;
    overflow-y: auto;
}

.transactions-content {
    display: grid;
    grid-template-columns: 15% 25% 25% 15% 20%;
    justify-content: start;
    justify-items: start;
    width: 100%;
}

.transaction-item .v-btn {
    max-width: 30px;
    max-height: 30px;
    padding: 5%;
}

.transaction-item .v-list-item-action {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.transaction-item .v-list-item-action .v-btn {
    margin-left: 8px;
}

.date-clear-button {
    margin-left: 8px;
}
</style>