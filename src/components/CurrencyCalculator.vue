<template>
    <v-dialog v-model="showCurrencyCalculator" persistent max-width="600px">
        <v-card>
            <v-card-title class="window-title">Currency Calculator</v-card-title>
            <v-card-text>
                <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
                    {{ apiAlert.message }}
                </v-alert>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="amount" label="Amount" type="number"
                                :rules="[v => !!v || 'Amount is required']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select v-model="fromCurrency" :items="currencies" label="From"
                                :rules="[v => !!v || 'Currency is required']" required></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select v-model="toCurrency" :items="currencies" label="To"
                                :rules="[v => !!v || 'Currency is required']" required></v-select>
                        </v-col>
                    </v-row>
                </v-form>
                <v-row>
                    <v-col cols="12">
                        <v-btn color="blue darken-1" text @click="calculateCurrency">Calculate</v-btn>
                        <v-btn icon @click="swapCurrencies" style="margin-left: 350px;">
                                <v-icon>mdi-swap-horizontal</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row v-if="result">
                    <v-col cols="12">
                        <v-alert type="success">
                            {{ amount }} {{ fromCurrency }} = {{ result }} {{ toCurrency }}
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeCalculator">Close</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'CurrencyCalculator',
    props: {
        showCalculator: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showCurrencyCalculator: this.showCalculator,
            amount: null,
            fromCurrency: null,
            toCurrency: null,
            result: null,
            currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD'],
            apiAlert: {
                visible: false,
                type: '',
                message: ''
            },
            valid: false
        };
    },
    methods: {
        calculateCurrency() {
            if (!this.amount || !this.fromCurrency || !this.toCurrency) {
                this.apiAlert = {
                    visible: true,
                    type: 'error',
                    message: 'Please fill in all fields.'
                };
                return;
            }

            const apiKey = process.env.VUE_APP_EXCHANGE_RATE_API_KEY;
            const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${this.fromCurrency}/${this.toCurrency}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const rate = data.conversion_rate;
                    this.result = (this.amount * rate).toFixed(2);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate', error);
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error fetching exchange rate. Please try again later.'
                    };
                });
        },
        closeCalculator() {
            this.$emit('update:showCalculator', false);
            this.resetCalculator();
        },
        resetCalculator() {
            this.amount = null;
            this.fromCurrency = null;
            this.toCurrency = null;
            this.result = null;
            this.apiAlert = {
                visible: false,
                type: '',
                message: ''
            };
        },
        swapCurrencies() {
            const temp = this.fromCurrency;
            this.fromCurrency = this.toCurrency;
            this.toCurrency = temp;
        }
    },
    watch: {
        showCalculator(newVal) {
            this.showCurrencyCalculator = newVal;
        },
        amount() {
            this.result = null;
        },
        fromCurrency() {
            this.result = null;
        },
        toCurrency() {
            this.result = null;
        }
    }
};
</script>

<style scoped>
.window-title {
    font-size: 2rem;
    font-weight: 700;
    color: #3f51b5;
    text-align: center;
    width: 100%;
}
</style>