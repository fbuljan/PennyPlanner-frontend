<template>
    <div>
        <v-toolbar color="primary" dark prominent style="position: relative">
            <v-toolbar-title class="d-flex align-center" style="margin: 0; padding: 0;">
                <img :src="require('../assets/logo_toolbar_white.png')" alt="PennyPlanner Logo" 
                style="height: 50px; padding-top: 10px; padding-left: 10px;" />
            </v-toolbar-title>
            <v-btn @click="showCurrencyCalculator = true">Currency calculator</v-btn>
            <v-btn @click="showTransactionsWindow = true">Transactions</v-btn>
            <v-btn @click="showAccountsWindow = true">Accounts</v-btn>
            <v-btn @click="showGoalsWindow = true">Goals</v-btn>
            <v-container class="d-flex align-items-center" style="width: auto;">
                <v-btn icon @click="showCalendar = true">
                    <v-icon>mdi-calendar</v-icon>
                </v-btn>
                <v-btn icon @click="showUserProfile = true">
                    <v-icon>mdi-menu</v-icon>
                </v-btn>
            </v-container>
        </v-toolbar>

        <v-container fluid class="px-4">
            <v-row>
                <v-col cols="12">
                    <h2 class="welcome-text">Welcome{{ getUserDisplayName() }}!</h2>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6" class="py-2">
                    <v-row>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">
                                <v-row style="width: 100%">
                                    <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
                                        <v-card-title class="larger-text-total">Current balance:</v-card-title>
                                        <v-card-subtitle class="larger-text-total display-4 text--primary">{{
                                            totalBalance }} €</v-card-subtitle>
                                    </v-col>
                                    <v-col cols="12" md="6" class="d-flex flex-column"
                                        style="max-height: 250px; overflow-y: auto;">
                                        <v-card-text v-for="account in accounts" :key="account.name"
                                            class="account-item larger-text">
                                            <strong :style="{ color: '#1867c0' }">{{ account.name }}:</strong> {{
                                            account.balance }} €
                                        </v-card-text>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">
                                <v-card-title>Goals preview</v-card-title>
                                <v-list dense style="max-height: 170px; overflow-y: auto;">
                                    <v-list-item v-for="goal in goals" :key="goal.id" class="goal-item">
                                        <v-list-item-content>
                                            <v-list-item-title class="larger-text-goal">{{ goal.name
                                                }}</v-list-item-title>
                                            <v-progress-linear :model-value="getGoalProgress(goal)" :min="0" :max="100"
                                                :color="getProgressColor(goal)" rounded striped height="15">
                                                <template v-slot:default>
                                                    <strong>{{ getGoalProgress(goal).toFixed(2) }}%</strong>
                                                </template>
                                            </v-progress-linear>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" md="6" class="py-2">
                    <v-row>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">
                                <v-card-title>Last 3 transactions</v-card-title>
                                <v-list dense style="background-color: #f5f5f5;">
                                    <v-list-item v-for="transaction in latestTransactions" :key="transaction.id"
                                        class="transaction-item">
                                        <v-list-item-content class="transaction-content">
                                            <v-list-item-title class="transaction-title"
                                                :style="transaction.transactionType < 0 ? 'color: red;' : 'color: green;'">
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
                                                {{ transaction.description ? transaction.description : 'No description'
                                                }}
                                            </v-list-item-subtitle>
                                            <v-list-item-subtitle class="larger-text-transaction">
                                                {{ new Date(transaction.date).toLocaleDateString() }}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-col>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">
                                <v-card-title>Stats</v-card-title>
                                <v-card-text>
                                    <div class="stats-item">
                                        <strong>Most used account:</strong> {{ mostUsedAccount.name }} ({{
                                        mostUsedAccount.transactions.length }} transactions)
                                    </div>
                                    <div class="stats-item">
                                        <strong>Most common transaction category:</strong> {{ categoryName }}
                                    </div>
                                    <div class="stats-item">
                                        <strong>Average monthly income:</strong> {{ averageMonthlyIncome.toFixed(2) }} €
                                    </div>
                                    <div class="stats-item">
                                        <strong>Average monthly expenditure:</strong> {{
                                        averageMonthlyExpenditure.toFixed(2) }} €
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>

        <TransactionsWindow @transactionCreated="fetchUser" @transactionDeleted="fetchUser"
            @transactionUpdated="fetchUser" v-model:showTransactionsWindow="showTransactionsWindow"
            @close-transactions-window="showTransactionsWindow = false" :transactions="transactions"
            :accounts="accounts" :categories="categories" />

        <AccountsWindow @accountCreated="fetchUser" @accountUpdated="fetchUser" @accountDeleted="fetchUser"
            v-model:showAccountsWindow="showAccountsWindow" :accounts="accounts" />

        <CurrencyCalculator v-model:showCalculator="showCurrencyCalculator" />

        <UserProfile v-model:showUserProfile="showUserProfile" :user="user" @logout="handleLogout"
            @userDeleted="handleUserDeletion" @updated="fetchUser" />

        <GoalsWindow v-model:showGoalsWindow="showGoalsWindow" :goals="goals" :goalTypes="goalTypes"
            :accounts="accounts" @goalCreated="fetchUser" @goalUpdated="fetchUser" @goalDeleted="fetchUser" />

        <Calendar v-model:showCalendar="showCalendar" :goals="goals" :transactions="transactions" />

        <v-overlay
            :value="showTransactionsWindow || showAccountsWindow || showCurrencyCalculator || showUserProfile || showGoalsWindow || showCalendar">
            <div class="blur-background"></div>
        </v-overlay>
    </div>
</template>

<script>
import TransactionsWindow from './TransactionsWindow.vue';
import AccountsWindow from './AccountsWindow.vue';
import CurrencyCalculator from './CurrencyCalculator.vue';
import UserProfile from './UserProfile.vue';
import GoalsWindow from './GoalsWindow.vue';
import Calendar from './Calendar.vue';

export default {
    name: 'HomePage',
    components: {
        TransactionsWindow,
        AccountsWindow,
        CurrencyCalculator,
        UserProfile,
        GoalsWindow,
        Calendar
    },
    data() {
        return {
            userName: '',
            totalBalance: 0,
            accounts: [],
            transactions: [],
            categories: [],
            goals: [],
            goalTypes: [],
            mostUsedAccount: { name: 'None', transactions: [] },
            mostCommonCategory: 'None',
            categoryName: "",
            averageMonthlyIncome: 0,
            averageMonthlyExpenditure: 0,
            showTransactionsWindow: false,
            showAccountsWindow: false,
            showCurrencyCalculator: false,
            showUserProfile: false,
            showGoalsWindow: false,
            showCalendar: false,
            user: null
        };
    },
    computed: {
        accountOptions() {
            return this.accounts.map(account => account.name);
        },
        categoryOptions() {
            return this.categories.map(category => category.name);
        },
        latestTransactions() {
            return this.transactions
                .filter(transaction => transaction.transactionType !== 0)
                .map(transaction => {
                    const account = this.accounts.find(account => account.transactions && account.transactions.some(accTransaction => accTransaction.id === transaction.id));
                    return {
                        ...transaction,
                        accountName: account ? account.name : 'Unknown'
                    };
                })
                .sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (dateA.getTime() === dateB.getTime()) {
                        return b.id - a.id;
                    }
                    
                    return dateB - dateA;
                })
                .slice(0, 3);
        }
    },
    methods: {
        async fetchUser() {
            const userId = localStorage.getItem('id');
            const userResponse = await this.$axios.get('/api/User/get/' + userId);
            this.user = userResponse.data;
            this.userName = userResponse.data.name;
            this.handleAccountsData(userResponse);
            this.transactions = userResponse.data.transactions || [];
            this.goals = userResponse.data.goals || [];
            await this.handleCategories();
            await this.handleGoalTypes();
            this.computeStats();
        },
        getUserDisplayName() {
            if (this.userName.length === 0) {
                return '';
            }
            return ", " + this.userName;
        },
        handleAccountsData(userResponse) {
            this.accounts = userResponse.data.accounts;
            this.totalBalance = 0;
            this.accounts.forEach((account) => {
                this.totalBalance += account.balance;
            });
        },
        async handleCategories() {
            const categoriesResponse = await this.$axios.get('/api/Transaction/categories/');
            this.categories = categoriesResponse.data;
        },
        async handleGoalTypes() {
            const typesResponse = await this.$axios.get('/api/Goal/types/');
            this.goalTypes = typesResponse.data;
        },
        computeStats() {
            if (this.accounts.length === 0 || this.transactions.length === 0) return;

            // Most used account
            let maxTransactions = 0;
            this.accounts.forEach(account => {
                if (!account.transactions || account.transactions.length === 0) {
                    return;
                }

                const filteredTransactions = account.transactions.filter(transaction => transaction.transactionType !== 0);
                if (filteredTransactions.length > maxTransactions) {
                    maxTransactions = filteredTransactions;
                    this.mostUsedAccount = {
                        name: account.name,
                        transactions: filteredTransactions
                    }
                }
            });

            // Most common transaction category
            const categoryCount = {};
            this.transactions.forEach(transaction => {
                if (!categoryCount[transaction.transactionCategory]) {
                    categoryCount[transaction.transactionCategory] = 0;
                }
                categoryCount[transaction.transactionCategory]++;
            });
            this.mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
            this.categoryName = this.getCategoryName(this.mostCommonCategory);

            // Average monthly income and expenditure
            const incomeTransactions = this.transactions.filter(t => t.transactionType === 1);
            const expenditureTransactions = this.transactions.filter(t => t.transactionType === -1);

            const months = new Set(this.transactions.map(t => new Date(t.date).getMonth() + "-" + new Date(t.date).getFullYear())).size;
            this.averageMonthlyIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0) / months;
            this.averageMonthlyExpenditure = expenditureTransactions.reduce((acc, t) => acc + t.amount, 0) / months;
        },
        getCategoryName(categoryId) {
            for (let i = 0; i < this.categories.length; i++) {
                if (this.categories[i].value == categoryId) {
                    return this.categories[i].name;
                }
            }
            return null;
        },
        getGoalProgress(goal) {
            if (goal.goalType === 3) {
                return (goal.targetValue / goal.currentValue) * 100;
            } else {
                return (goal.currentValue / goal.targetValue) * 100;
            }
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
        handleLogout() {
            localStorage.removeItem('jwt');
            localStorage.removeItem('id');
            this.$router.push({ name: 'LandingPage' });
        },
        handleUserDeletion() {
            localStorage.removeItem('jwt');
            localStorage.removeItem('id');
            this.$router.push({ name: 'LandingPage' });
        }
    },
    mounted() {
        this.fetchUser();
    },
};
</script>

<style>
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

.v-card-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1867c0;
    text-align: center;
}

.v-card-subtitle.display-4 {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
}

.v-card-text {
    font-size: 1.2rem;
}

.d-flex.align-center.justify-center {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.account-item {
    margin-bottom: 0px;
}

.welcome-text {
    margin: 0;
    text-align: left;
    width: 100%;
}

.transaction-item {
    width: 100%;
}

.transaction-title {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: bold;
}

.transaction-content {
    display: grid;
    grid-template-columns: 25% 30% 30% 15%;
    justify-content: start;
    justify-items: start;
    width: 100%;
}

.transaction-content .transaction-title,
.transaction-content .v-list-item-subtitle {
    text-align: center;
}

.larger-text {
    font-size: 2rem;
    font-weight: bold;
}

.larger-text-total {
    font-size: 2.5rem;
    font-weight: bold;
}

.larger-text-transaction {
    font-size: 1.15rem;
    font-weight: bold;
    padding-bottom: 2px;
    line-height: 1.5;
}

.larger-text-goal {
    font-size: 1.15rem;
    font-weight: bold;
    padding-bottom: 2px;
    line-height: 1.5;
}

.stats-item {
    margin-bottom: 10px;
}

.blur-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(15px);
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
