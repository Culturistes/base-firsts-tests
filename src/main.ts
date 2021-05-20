import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);

app.use(store).use(router).mount("#app");

app.config.globalProperties.$filters = {
  hideDollar(value: string) {
    if (value.slice(0, 1) == "$") {
      return value.slice(1, value.length);
    }
    return value;
  },
};
