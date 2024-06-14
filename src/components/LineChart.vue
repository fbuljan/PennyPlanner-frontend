<template>
    <div>
        <Line :data="chartData" :options="chartOptions"></Line>
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
            }
        }
    },
    watch: {
        transactions: {
            immediate: true,
            handler(newTransactions) {
                this.updateChartData(newTransactions, this.currentBalance)
            }
        }
    },
    methods: {
        updateChartData(transactions, currentBalance) {
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            const labels = [];
            const data = [];
            let balance = currentBalance;

            for (let i = transactions.length - 1; i >= 0; i--) {
                const t = transactions[i];
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

            this.chartData = {
                labels,
                datasets: [
                    {
                        label: 'Balance Over Time',
                        backgroundColor: '#f87979',
                        data
                    }
                ]
            };
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
div {
    height: 400px;
}
</style>
