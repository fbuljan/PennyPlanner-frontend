<template>
    <div>
        <v-toolbar color="primary" dark prominent>
            <v-toolbar-title><strong>PennyPlanner</strong></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="showLoginDialog = true">Log in</v-btn>
            <v-btn @click="showRegisterDialog = true">Sign up</v-btn>
        </v-toolbar>

        <v-container fluid>
            <v-row>
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-text>
                            <h1 class="display-1">Welcome to PennyPlanner!</h1>
                            <h2 class="display-2">Who fails to plan - plans to fail</h2>
                            <p class="body-1">
                                Managing your personal finances has never been easier. <strong>PennyPlanner</strong> is
                                designed to help
                                you take full control of your financial future with a suite of powerful tools and
                                intuitive features. Whether you're tracking multiple accounts, categorizing expenses, or
                                setting financial goals, PennyPlanner provides everything you need to make informed
                                financial decisions.
                            </p>
                            <h2 class="headline">Why should you track your personal finances?</h2>
                            <ul>
                                <li>
                                    <strong>Understand Your Spending Habits:</strong> By categorizing your transactions,
                                    <strong>PennyPlanner</strong> helps you identify where your money goes, highlighting
                                    the most common
                                    and most expensive types of expenses.
                                </li>
                                <li>
                                    <strong>Set and Achieve Financial Goals:</strong> Define and track goals such as
                                    overall saldo goals, account-specific saldo goals, monthly income targets, and
                                    expense reduction targets. <strong>PennyPlanner</strong>'s goal-setting features
                                    keep you focused and
                                    motivated.
                                </li>
                                <li>
                                    <strong>Gain Financial Insights:</strong> With comprehensive stats and analytics,
                                    you can see detailed reports on your spending patterns, helping you to make better
                                    financial decisions.
                                </li>
                                <li>
                                    <strong>Plan for the Future:</strong> Use the built-in calendar to visualize
                                    transactions and goal deadlines, ensuring you stay on track to meet your objectives.
                                </li>
                            </ul>
                            <h2 class="headline">Key Features</h2>
                            <ul>
                                <li>
                                    <strong>Multi-Account Management:</strong> Seamlessly manage and track multiple
                                    accounts. List transactions that can be tied to one account or split between a
                                    source and destination account.
                                </li>
                                <li>
                                    <strong>Categorization and Statistics:</strong> Automatically categorize
                                    transactions to provide insightful stats on your spending habits, helping you see
                                    where you can save.
                                </li>
                                <li>
                                    <strong>Goal Setting and Achievement:</strong> Set various financial goals and track
                                    your progress. Whether it's achieving a savings target or reducing monthly expenses,
                                    <strong>PennyPlanner</strong> helps you stay on course.
                                </li>
                                <li>
                                    <strong>Intelligent Tooltips:</strong> Benefit from personalized tips and
                                    recommendations based on your financial data, guiding you towards your goals more
                                    efficiently.
                                </li>
                                <li>
                                    <strong>Interactive Calendar:</strong> Visualize your transactions and goals on a
                                    calendar, making it easier to plan and achieve your financial milestones.
                                </li>
                            </ul>
                            <p class="body-1">
                                Become the latest person who has taken control of their finances with
                                <strong>PennyPlanner</strong>.
                                Start your journey to financial freedom today!
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="4">
                    <v-img src="../assets/background-toolbar.jpg" class="mb-4"></v-img>
                    <v-img src="../assets/background-toolbar.jpg" class="mb-4"></v-img>
                    <v-img src="../assets/background-toolbar.jpg"></v-img>
                </v-col>
            </v-row>
        </v-container>

        <v-dialog v-model="showLoginDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="window-title">Log in</v-card-title>
                <v-card-text>
                    <v-form ref="loginForm" @submit.prevent="login">
                        <v-text-field v-model="loginData.login" label="Username or email" required></v-text-field>
                        <v-text-field v-model="loginData.password" label="Password" type="password"
                            required></v-text-field>
                    </v-form>
                    <v-row justify="center" class="mt-2">
                        <span>Don't have an account? <a href="#"
                                @click.prevent="showRegisterDialog = true; showLoginDialog = false; loginError = false;">Sign up!</a></span>
                    </v-row>
                    <v-divider class="mt-4"></v-divider>
                    <v-row justify="center" class="mt-2">
                        <v-alert v-if="loginError" type="error">{{ loginError }}</v-alert>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="showLoginDialog = false; loginError = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="login">Log in</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showRegisterDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="window-title">Sign up</v-card-title>
                <v-card-text>
                    <v-form ref="registerForm" @submit.prevent="register">
                        <v-text-field v-model="registerData.username" label="Username" required></v-text-field>
                        <v-text-field v-model="registerData.email" label="Email" required></v-text-field>
                        <v-text-field v-model="registerData.password" label="Password" type="password"
                            required></v-text-field>
                        <v-text-field v-model="registerData.name" label="Name"></v-text-field>
                    </v-form>
                    <v-row justify="center" class="mt-2">
                        <span>Already have an account? <a href="#"
                                @click.prevent="showLoginDialog = true; showRegisterDialog = false; registerError = false;">Log in!</a></span>
                    </v-row>
                    <v-divider class="mt-4"></v-divider>
                    <v-row justify="center" class="mt-2">
                        <v-alert v-if="registerError" type="error">{{ registerError }}</v-alert>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="showRegisterDialog = false; registerError = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="register">Sign up</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-overlay :value="showLoginDialog || showRegisterDialog">
            <div class="blur-background"></div>
        </v-overlay>
    </div>
</template>

<script>
export default {
    name: 'LandingPage',
    data() {
        return {
            showLoginDialog: false,
            showRegisterDialog: false,
            loginData: {
                login: '',
                password: ''
            },
            registerData: {
                username: '',
                email: '',
                password: '',
                name: ''
            },
            loginError: null,
            registerError: null
        };
    },
    methods: {
        async login() {
            try {
                const response = await this.$axios.post('/api/User/login', this.loginData);
                localStorage.setItem('jwt', response.data.token);
                this.showLoginDialog = false;
                this.loginError = null;
            } catch (error) {
                console.error('Login failed', error);
                this.loginError = error.response.data.message;
            }
        },
        async register() {
            try {
                const response = await this.$axios.post('/api/User/register', this.registerData);
                console.log(response.data);
                this.showRegisterDialog = false;
                this.registerError = null;
            } catch (error) {
                console.error('Registration failed', error);
                try {
                    const errorArray = JSON.parse(error.response.data.detail);
                    const errorMessages = errorArray.map(error => error.ErrorMessage);
                    this.registerError = errorMessages[0];
                }
                catch (error2) {
                    this.registerError = error.response.data.detail;
                }
            }
        }
    }
}
</script>

<style>
.display-1 {
    font-size: 3rem;
    font-weight: 750;
    margin-bottom: 1rem;
}

.display-2 {
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.headline {
    font-size: 1.75rem;
    font-weight: 400;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.body-1 {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1rem;
}

ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

li {
    margin-bottom: 0.5rem;
}

.mb-4 {
    margin-bottom: 16px;
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
</style>
