<template>
    <div>
        <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
    </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)

export default {
    name: 'LineChart',
    components: {
        LineChart: Line
    },
    props: {
        transactions: {
            type: Array,
            required: true
        }
    },
    computed: {
        chartData() {
            const labels = this.transactions.map(t => new Date(t.date).toLocaleDateString())
            const data = this.transactions.map(t => t.amount)

            return {
                labels,
                datasets: [
                    {
                        label: 'Balance Over Time',
                        backgroundColor: '#f87979',
                        data
                    }
                ]
            }
        },
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