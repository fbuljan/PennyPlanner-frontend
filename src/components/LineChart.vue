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
        <v-checkbox v-model="showPredictions" label="Show predictions for 6 months" class="mt-2"></v-checkbox>
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

            let removedByFilterEnd = [];

            if (this.localFilterPeriodEnd) {
                removedByFilterEnd = filteredTransactions.filter(t => new Date(t.date) > new Date(this.localFilterPeriodEnd));
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(this.localFilterPeriodEnd));
            }

            filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            const labels = [];
            const data = [];
            let balance = currentBalance;

            if (removedByFilterEnd.length > 0) {
                removedByFilterEnd.forEach(transaction => {
                    if (transaction.transactionType !== 0) {
                        if (transaction.transactionType === -1) {
                            balance += transaction.amount;
                        } else if (transaction.transactionType === 1) {
                            balance -= transaction.amount;
                        }
                    }
                });
            }

            currentBalance = balance;

            for (let i = filteredTransactions.length - 1; i >= 0; i--) {
                const transaction = filteredTransactions[i];
                if (transaction.transactionType !== 0) {
                    labels.unshift(new Date(transaction.date).toLocaleDateString());
                    if (transaction.transactionType === -1) {
                        balance += transaction.amount;
                    } else if (transaction.transactionType === 1) {
                        balance -= transaction.amount;
                    }
                    data.unshift(balance);
                }
            }

            labels.push(this.localFilterPeriodEnd !== null ? new Date(this.localFilterPeriodEnd).toLocaleDateString() : "Current Balance");
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
            const numPredictions = 6;
            const degree = 2;

            const smoothedData = this.weightedMovingAverage(data, 5);

            const x = smoothedData.map((_, index) => index);
            const y = smoothedData;

            const n = y.length;
            const X = [];
            const Y = y;

            for (let i = 0; i < n; i++) {
                X[i] = [];
                for (let j = 0; j <= degree; j++) {
                    X[i].push(Math.pow(x[i], j));
                }
            }

            const XT = X[0].map((_, colIndex) => X.map(row => row[colIndex]));
            const XTX = XT.map(row => row.map((_, colIndex) => row.reduce((sum, cell, i) => sum + cell * X[i][colIndex], 0)));
            const XTY = XT.map(row => row.reduce((sum, cell, i) => sum + cell * Y[i], 0));
            const B = this.gaussianElimination(XTX, XTY);

            for (let i = 1; i <= numPredictions; i++) {
                const predictedX = x.length + i;
                let predictedY = 0;
                for (let j = 0; j <= degree; j++) {
                    predictedY += B[j] * Math.pow(predictedX, j);
                }
                predictions.push(Math.round(predictedY));
            }

            return predictions;
        },
        weightedMovingAverage(data, windowSize) {
            const weights = Array.from({ length: windowSize }, (_, i) => i + 1);
            const smoothedData = [];

            for (let i = 0; i < data.length; i++) {
                let weightedSum = 0;
                let currentWeightSum = 0;
                for (let j = 0; j < windowSize && i - j >= 0; j++) {
                    weightedSum += data[i - j] * weights[j];
                    currentWeightSum += weights[j];
                }
                smoothedData.push(weightedSum / currentWeightSum);
            }

            return smoothedData;
        },
        gaussianElimination(a, b) {
            const n = a.length;
            for (let i = 0; i < n; i++) {
                let maxEl = Math.abs(a[i][i]);
                let maxRow = i;
                for (let k = i + 1; k < n; k++) {
                    if (Math.abs(a[k][i]) > maxEl) {
                        maxEl = Math.abs(a[k][i]);
                        maxRow = k;
                    }
                }

                [a[i], a[maxRow]] = [a[maxRow], a[i]];
                [b[i], b[maxRow]] = [b[maxRow], b[i]];

                for (let k = i + 1; k < n; k++) {
                    const c = -a[k][i] / a[i][i];
                    for (let j = i; j < n; j++) {
                        if (i === j) {
                            a[k][j] = 0;
                        } else {
                            a[k][j] += c * a[i][j];
                        }
                    }
                    b[k] += c * b[i];
                }
            }

            const x = new Array(n).fill(0);
            for (let i = n - 1; i >= 0; i--) {
                x[i] = b[i] / a[i][i];
                for (let k = i - 1; k >= 0; k--) {
                    b[k] -= a[k][i] * x[i];
                }
            }
            return x;
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
