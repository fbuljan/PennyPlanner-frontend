<template>
  <v-dialog v-model="localShowCalendar" max-width="60vw">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Calendar</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="localShowCalendar = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-calendar
          ref="calendar"
          v-model:now="focused"
          color="primary"
          :type="type"
          :weekdays="[0, 1, 2, 3, 4, 5, 6]"
          :events="events"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CalendarComponent',
  props: {
    showCalendar: {
      type: Boolean,
      default: false
    },
    goals: {
      type: Array,
      default: () => []
    },
    transactions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      focused: new Date().toISOString().substr(0, 10),
      type: 'month',
      events: []
    };
  },
  computed: {
    localShowCalendar: {
      get() {
        return this.showCalendar;
      },
      set(value) {
        this.$emit('update:showCalendar', value);
      }
    }
  },
  watch: {
    showCalendar(newVal) {
      if (newVal) {
        this.loadEvents();
      }
    }
  },
  methods: {
    loadEvents() {
      const events = [];
      this.goals.forEach(goal => {
        events.push({
          id: goal.id,
          title: goal.name,
          start: new Date(goal.endDate),
          end: new Date(goal.endDate),
          color: 'blue'
        });
      });

      this.transactions.forEach(transaction => {
        if (transaction.transactionType === 0) return;

        events.push({
          id: transaction.id,
          title: transaction.description || 'No description',
          start: new Date(transaction.date),
          end: new Date(transaction.endDate),
          color: transaction.transactionType < 0 ? 'red' : 'green'
        });
      });

      console.log(events)
      this.events = events;
    }
  }
};
</script>

<style>
.calendar-day {
  position: relative;
  height: 100%;
}
.calendar-day div {
  text-align: center;
}
.calendar-day span {
  display: block;
  margin-top: 4px;
  padding: 2px;
  border-radius: 2px;
  color: white;
}
</style>
