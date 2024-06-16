<template>
    <v-dialog v-model="localShowUserProfile" persistent max-width="800px">
      <v-card>
        <v-card-title class="window-title">User Profile</v-card-title>
        <v-card-text>
          <v-alert v-if="apiAlert.visible" :type="apiAlert.type" dismissible @input="apiAlert.visible = false">
            {{ apiAlert.message }}
          </v-alert>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <p class="registration-date">Registration Date: {{ formatDate(userData.registrationDate) }}</p>
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
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeUserProfile">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showChangePasswordDialog = true">Change Password</v-btn>
          <v-btn color="blue darken-1" text @click="updateUserProfile">Update</v-btn>
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
            <v-form ref="passwordForm" v-model="validPasswordForm" lazy-validation>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="currentPassword" label="Current Password" type="password"
                    :rules="[v => !!v || 'Current Password is required']" required></v-text-field>
                </v-col>
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
  
      <v-dialog v-model="showDeleteUserDialog" persistent max-width="400px">
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
        userData: { ...this.user },
        showChangePasswordDialog: false,
        showDeleteUserDialog: false,
        currentPassword: '',
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
        return new Date(date).toLocaleDateString(undefined, options);
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
          })
          .catch(error => {
            this.apiAlert = {
              visible: true,
              type: 'error',
              message: 'Error updating user profile: ' + error.response.data.title
            };
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
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        };
  
        this.$axios.put('/api/User/changePassword', payload)
          .then(() => {
            this.passwordAlert = {
              visible: true,
              type: 'success',
              message: 'Password changed successfully!'
            };
            setTimeout(this.clearAlerts, 5000);
            this.showChangePasswordDialog = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
          })
          .catch(error => {
            this.passwordAlert = {
              visible: true,
              type: 'error',
              message: 'Error changing password: ' + error.response.data.title
            };
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
    },
    watch: {
      showUserProfile(newVal) {
        this.localShowUserProfile = newVal;
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
  