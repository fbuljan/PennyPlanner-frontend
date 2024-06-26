<template>
    <v-dialog v-model="localShowUserProfile" persistent max-width="800px">
        <v-card>
            <v-card-title class="window-title">User Profile</v-card-title>
            <v-card-text>
                <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
                    {{ apiAlert.message }}
                </v-alert>
                <br />
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <p class="registration-date">Registration date: {{ formatDate(userData.registrationDate) }}
                            </p>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="userData.username" label="Username"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="userData.email" label="Email"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="userData.name" label="Name"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-btn text @click="showChangePasswordDialog = true">Change Password</v-btn>
                            <v-btn text @click="updateUserProfile">Update</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeUserProfile">Close</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="showDeleteUserDialog = true">Delete Account</v-btn>
                <v-btn color="blue darken-1" text @click="logout">Log Out</v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="showChangePasswordDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="window-title">Change Password</v-card-title>
                <v-card-text>
                    <v-alert v-if="passwordAlert.visible" :type="passwordAlert.type" dismissible
                        @input="passwordAlert.visible = false">
                        {{ passwordAlert.message }}
                    </v-alert>
                    <br />
                    <v-form ref="passwordForm" v-model="validPasswordForm" lazy-validation>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="newPassword" label="New Password" type="password"
                                    :rules="[v => !!v || 'New Password is required']" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="confirmNewPassword" label="Confirm New Password" type="password"
                                    :rules="[v => !!v || 'Confirm New Password is required']" required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showChangePasswordDialog = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="changePassword">Change</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showDeleteUserDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="window-title">Delete Account</v-card-title>
                <v-card-text>
                    <h1>Are you sure you want to delete your user account and lose all your data?</h1>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click="showDeleteUserDialog = false">Cancel</v-btn>
                    <v-btn color="red darken-1" text @click="deleteUserAccount">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script>
export default {
    name: 'UserProfile',
    props: {
        showUserProfile: {
            type: Boolean,
            default: false
        },
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            userData: {},
            showChangePasswordDialog: false,
            showDeleteUserDialog: false,
            newPassword: '',
            confirmNewPassword: '',
            valid: false,
            validPasswordForm: false,
            passwordAlert: {
                visible: false,
                type: '',
                message: ''
            },
            apiAlert: {
                visible: false,
                type: '',
                message: ''
            }
        };
    },
    created() {
        this.userData = { ...this.user };
    },
    watch: {
        user: {
            handler(newUser) {
                this.userData = { ...newUser };
            },
            deep: true,
            immediate: true
        },
        showUserProfile(newVal) {
            this.localShowUserProfile = newVal;
        }
    },
    computed: {
        localShowUserProfile: {
            get() {
                return this.showUserProfile;
            },
            set(value) {
                this.$emit('update:showUserProfile', value);
            }
        }
    },
    methods: {
        formatDate(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Date(date).toLocaleDateString(undefined, options);
            const newDate = formattedDate.split(' ');
            return newDate[0] + ". " + newDate[1] + " " + newDate[2] + ".";
        },
        closeUserProfile() {
            this.localShowUserProfile = false;
            this.clearAlerts();
        },
        updateUserProfile() {
            const payload = {
                id: this.userData.id,
                username: this.userData.username,
                email: this.userData.email,
                name: this.userData.name
            };

            this.$axios.put('/api/User/update', payload)
                .then(() => {
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'User profile updated successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.$emit('updated');
                })
                .catch(error => {
                    try {
                        const errorArray = JSON.parse(error.response.data.detail);
                        const errorMessages = errorArray.map(error => error.ErrorMessage);
                        this.apiAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error updating user profile: ' + errorMessages[0]
                        };
                    }
                    catch (error2) {
                        this.apiAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error updating user profile: ' + error.response.data.title
                        };
                    }
                    setTimeout(this.clearAlerts, 5000);
                });
        },
        changePassword() {
            if (this.newPassword !== this.confirmNewPassword) {
                this.passwordAlert = {
                    visible: true,
                    type: 'error',
                    message: 'New passwords do not match.'
                };
                setTimeout(this.clearAlerts, 5000);
                return;
            }

            const payload = {
                id: this.userData.id,
                password: this.newPassword
            };

            this.$axios.put('/api/User/update', payload)
                .then(() => {
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'Password changed successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.showChangePasswordDialog = false;
                    this.newPassword = '';
                    this.confirmNewPassword = '';
                    this.$emit('userDeleted');
                })
                .catch(error => {
                    try {
                        const errorArray = JSON.parse(error.response.data.detail);
                        const errorMessages = errorArray.map(error => error.ErrorMessage);
                        this.passwordAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error changing password: ' + errorMessages[0]
                        };
                    }
                    catch (error2) {
                        this.passwordAlert = {
                            visible: true,
                            type: 'error',
                            message: 'Error changing password: ' + error.response.data.title
                        };
                    }
                    setTimeout(this.clearAlerts, 5000);
                });
        },
        deleteUserAccount() {
            const payload = {
                id: this.userData.id
            };

            this.$axios({
                method: 'delete',
                url: '/api/User/delete',
                data: payload
            })
                .then(() => {
                    this.apiAlert = {
                        visible: true,
                        type: 'success',
                        message: 'User account deleted successfully!'
                    };
                    setTimeout(this.clearAlerts, 5000);
                    this.localShowUserProfile = false;
                    this.$emit('userDeleted');
                })
                .catch(error => {
                    this.apiAlert = {
                        visible: true,
                        type: 'error',
                        message: 'Error deleting user account: ' + error.message
                    };
                    setTimeout(this.clearAlerts, 5000);
                });

            this.showDeleteUserDialog = false;
        },
        logout() {
            this.localShowUserProfile = false;
            this.$emit('logout');
        },
        clearAlerts() {
            this.apiAlert = {
                visible: false,
                type: '',
                message: ''
            };
            this.passwordAlert = {
                visible: false,
                type: '',
                message: ''
            };
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

.registration-date {
    font-size: 1rem;
    font-weight: bold;
    color: #757575;
}

.v-btn {
    margin-left: 8px;
}
</style>