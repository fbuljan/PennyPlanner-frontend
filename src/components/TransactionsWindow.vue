<template>
    <v-dialog v-model="localShowTransactionsWindow" persistent max-width="800px">
        <v-card>
            <v-card-title class="window-title">Transactions history</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="localFilterPeriodStart" label="From" type="date"
                            prepend-icon="mdi-calendar"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="localFilterPeriodEnd" label="To" type="date"
                            prepend-icon="mdi-calendar"></v-text-field>
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
                                        <template v-if="transaction.transactionType < 0">
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
                                        <v-btn icon small @click="editTransaction(transaction)">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon small @click="deleteTransaction(transaction.id)">
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
                <v-btn color="blue darken-1" text @click="closeTransactionsWindow">Cancel</v-btn>
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
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.accountName" :items="accountOptions" label="Account"
                                item-text="name" item-value="id" required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.amount" label="Amount" type="number"
                                required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.date" label="Date" type="date"
                                required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.transactionType" :items="transactionTypeOptions"
                                label="Transaction Type" required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="newTransaction.transactionCategory" :items="categoryOptions"
                                label="Category" required></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="newTransaction.description" label="Description"></v-text-field>
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
                description: ''
            },
            valid: false
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
            if ((!this.localFilterPeriodStart || !this.localFilterPeriodEnd) && this.localFilterTransactionType !== 'Template') {
                return [];
            }
            const startDate = new Date(this.localFilterPeriodStart);
            const endDate = new Date(this.localFilterPeriodEnd);
            endDate.setDate(endDate.getDate() + 1);
            return this.transactions
                .filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    let matchesFilters = this.localFilterTransactionType === 'Template' ? transaction.transactionType === 0 :
                        transaction.transactionType !== 0 && transactionDate >= startDate && transactionDate <= endDate;

                    if (this.localFilterAccount) {
                        const account = this.accounts.find(account => account.transactions.some(accTransaction => accTransaction.id === transaction.id));
                        matchesFilters = matchesFilters && account && account.name === this.localFilterAccount;
                    }
                    if (this.localFilterCategory) {
                        const category = this.categories.find(category => category.name === this.localFilterCategory);
                        if (category) {
                            matchesFilters = matchesFilters && transaction.transactionCategory === category.value;
                        } else {
                            matchesFilters = false;
                        }
                    }
                    if (this.localFilterTransactionType) {
                        let transactionTypeValue;
                        if (this.localFilterTransactionType === 'Income') transactionTypeValue = 1;
                        else if (this.localFilterTransactionType === 'Expense') transactionTypeValue = -1;
                        else if (this.localFilterTransactionType === 'Template') transactionTypeValue = 0;

                        matchesFilters = matchesFilters && transaction.transactionType === transactionTypeValue;
                    }
                    return matchesFilters;
                })
                .map(transaction => {
                    const account = this.accounts.find(account => account.transactions.some(accTransaction => accTransaction.id === transaction.id));
                    return {
                        ...transaction,
                        accountName: account ? account.name : 'Unknown'
                    };
                });
        },
        filteredMostUsedAccount() {
            const accountTransactionCounts = this.accounts.reduce((acc, account) => {
                acc[account.name] = account.transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    return transaction.transactionType !== 0 && transactionDate >= new Date(this.localFilterPeriodStart) && transactionDate <= new Date(this.localFilterPeriodEnd);
                }).length;
                return acc;
            }, {});

            const mostUsedAccountName = Object.keys(accountTransactionCounts).reduce((a, b) => {
                return accountTransactionCounts[a] > accountTransactionCounts[b] ? a : b;
            }, null);

            if (!mostUsedAccountName || accountTransactionCounts[mostUsedAccountName] === 0) {
                return { name: 'None', transactions: [] };
            }

            return this.accounts.find(account => account.name === mostUsedAccountName) || { name: 'None', transactions: [] };
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
            this.$emit('apply-template', transaction);
        },
        editTransaction(transaction) {
            this.$emit('edit-transaction', transaction);
        },
        deleteTransaction(transactionId) {
            this.$emit('delete-transaction', transactionId);
        },
        closeTransactionsWindow() {
            this.localShowTransactionsWindow = false;
        },
        createTransaction() {
            if (this.$refs.form.validate()) {
                const accountId = this.accounts.find(account => account.name === this.newTransaction.accountName).id;

                const category = this.categories.find(category => category.name === this.newTransaction.transactionCategory);

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
                    description: this.newTransaction.description
                };

                this.$axios.post('/api/Transaction/create', payload)
                    .then(response => {
                        console.log('Transaction created successfully', response);
                        this.$emit('transactionCreated');
                    })
                    .catch(error => {
                        console.error('Error creating transaction', error);
                        // Optionally, you can add some error handling code here
                    });

                this.showAddTransactionDialog = false;
                this.newTransaction = {
                    accountName: null,
                    amount: null,
                    date: new Date().toISOString().substr(0, 10),
                    transactionType: null,
                    transactionCategory: null,
                    description: ''
                };
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
</style>