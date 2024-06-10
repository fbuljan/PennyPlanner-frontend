<template>
    <div>
        <v-toolbar color="primary" dark prominent>
            <v-toolbar-title><strong>PennyPlanner</strong></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn>Currency calculator</v-btn>
            <v-btn>Transactions</v-btn>
            <v-btn>Accounts</v-btn>
            <v-btn>Goals</v-btn>
            <v-container class="d-flex align-items-center" style="width: auto;">
                <v-btn icon>
                    <v-icon>mdi-calendar</v-icon>
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-menu</v-icon>
                </v-btn>
            </v-container>
        </v-toolbar>

        <v-container>
            <v-row>
                <v-col cols="12">
                    <h2>Welcome{{ getUserDisplayName() }}!</h2>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="7" class="py-2">
                    <v-row>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">
                                <v-row>
                                    <v-col cols="6" class="d-flex flex-column align-center justify-center">
                                        <v-card-title>Current balance:</v-card-title>
                                        <v-card-subtitle class="display-4 text--primary">{{ totalBalance }} €</v-card-subtitle>
                                    </v-col>
                                    <v-col cols="6" class="d-flex flex-column justify-center" style="max-height: 250px; overflow-y: auto;">
                                        <v-card-text v-for="account in accounts" :key="account.name" class="account-item">
                                            <strong :style="{ color: '#1867c0' }">{{ account.name }}:</strong> {{ account.balance }} €
                                        </v-card-text>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">Goals preview</v-card>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="5" class="py-2">
                    <v-row>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">Last 3 transactions</v-card>
                        </v-col>
                        <v-col cols="12" class="my-2">
                            <v-card class="rectangle">Stats</v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    name: 'HomePage',
    data() {
        return {
            userName: '',
            totalBalance: 0,
            accounts: []
        };
    },
    methods: {
        async fetchUser() {
            const userId = localStorage.getItem('id');
            const userResponse = await this.$axios.get('/api/User/get/' + userId);
            console.log(userResponse);
            this.userName = userResponse.data.name;
            this.handleAccountsData(userResponse);
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
            })
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
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.v-card-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1867c0;
}

.v-card-subtitle.display-4 {
    font-size: 2.5rem;
    font-weight: bold;
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
</style>
