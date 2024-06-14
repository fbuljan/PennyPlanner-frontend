<template>
    <div class="chart-container">
        <v-row>
            <v-col cols="12" md="6" class="d-flex">
                <v-text-field v-model="localFilterPeriodStart" label="From" type="date" prepend-icon="mdi-calendar"
                    class="flex-grow-1"></v-text-field>
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
        <v-checkbox v-model="showPredictions" label="Show predictions for 3 months" class="mt-2"></v-checkbox>
        <div class="chart-wrapper">
            <Line :data="chartData" :options="chartOptions"></Line>
        </div>
    </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)

export default {
    name: 'LineChart',
    components: {
        Line
    },
    props: {
        transactions: {
            type: Array,
            required: true
        },
        currentBalance: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            chartData: {
                labels: [],
                datasets: []
            },
            localFilterPeriodStart: null,
            localFilterPeriodEnd: null,
            showPredictions: false
        }
    },
    watch: {
        transactions: {
            immediate: true,
            handler(newTransactions) {
                this.updateChartData(newTransactions, this.currentBalance)
            }
        },
        localFilterPeriodStart() {
            this.updateChartData(this.transactions, this.currentBalance)
        },
        localFilterPeriodEnd() {
            this.updateChartData(this.transactions, this.currentBalance)
        },
        showPredictions() {
            this.updateChartData(this.transactions, this.currentBalance)
        }
    },
    methods: {
        updateChartData(transactions, currentBalance) {
            let filteredTransactions = transactions;

            if (this.localFilterPeriodStart) {
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= new Date(this.localFilterPeriodStart));
            }

            if (this.localFilterPeriodEnd) {
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(this.localFilterPeriodEnd));
            }

            filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            const labels = [];
            const data = [];
            let balance = currentBalance;

            for (let i = filteredTransactions.length - 1; i >= 0; i--) {
                const t = filteredTransactions[i];
                if (t.transactionType !== 0) {
                    labels.unshift(new Date(t.date).toLocaleDateString());
                    if (t.transactionType === -1) {
                        balance += t.amount;
                    } else if (t.transactionType === 1) {
                        balance -= t.amount;
                    }
                    data.unshift(balance);
                }
            }

            labels.push("Current Balance");
            data.push(currentBalance);

            const predictions = this.getPredictedBalances(data);
            const predictedLabels = this.generatePredictionLabels(predictions.length);

            this.chartData = {
                labels: this.showPredictions ? labels.concat(predictedLabels) : labels,
                datasets: [
                    {
                        label: 'Balance Over Time',
                        backgroundColor: '#f87979',
                        data: data
                    },
                    ...this.showPredictions ? [{
                        label: 'Predicted Balance',
                        backgroundColor: '#7cb342',
                        data: new Array(data.length).fill(null).concat(predictions)
                    }] : []
                ]
            };
        },
        getPredictedBalances(data) {
            const predictions = [];
            const numPredictions = 3;

            const x = data.map((_, index) => index);
            const y = data;

            const n = y.length;
            const sumX = x.reduce((a, b) => a + b, 0);
            const sumY = y.reduce((a, b) => a + b, 0);
            const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
            const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            for (let i = 1; i <= numPredictions; i++) {
                const predictedX = x.length + i;
                const predictedY = slope * predictedX + intercept;

                predictions.push(Math.round(predictedY));
            }

            console.log("Predictions: ", predictions);

            return predictions;
        },
        generatePredictionLabels(numPredictions) {
            const labels = [];
            const currentDate = new Date();
            for (let i = 1; i <= numPredictions; i++) {
                const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                labels.push(futureDate.toLocaleDateString());
            }
            return labels;
        },
        clearDate(type) {
            if (type === 'start') {
                this.localFilterPeriodStart = null;
            } else if (type === 'end') {
                this.localFilterPeriodEnd = null;
            }
        }
    },
    computed: {
        chartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    }
}
</script>

<style scoped>
.chart-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chart-wrapper {
    flex-grow: 1;
    display: flex;
}

.chart-wrapper>* {
    flex-grow: 1;
}

.date-clear-button {
    margin-left: 8px;
}
</style>
