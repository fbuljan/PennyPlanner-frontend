import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import axios from "./axios";
import router from './router';

loadFonts();

const app = createApp(App);

app.config.globalProperties.$axios = axios;

app.use(router).use(vuetify).mount("#app");
