import dotenv from "dotenv";
dotenv.config();

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import PlayersList from "./ui/lists/PlayersList.vue";
import QuizBlock from "./ui/blocks/QuizBlock.vue";
import ArrowBtn from "./ui/buttons/ArrowBtn.vue";
import LineBtn from "./ui/buttons/LineBtn.vue";
import MinimalistArrowBtn from "./ui/buttons/MinimalistArrowBtn.vue";
import TextInput from "./ui/input/TextInput.vue";
import StepTitle from "./ui/titles/StepTitle.vue";
import MiniGameTitle from "./ui/titles/MiniGameTitle.vue";
import Stamp from "./ui/stamps/Stamp.vue";

const app = createApp(App);

app.use(store).use(router).mount("#app");

app.component("PlayersList", PlayersList);
app.component("QuizBlock", QuizBlock);
app.component("ArrowBtn", ArrowBtn);
app.component("LineBtn", LineBtn);
app.component("MinimalistArrowBtn", MinimalistArrowBtn);
app.component("TextInput", TextInput);
app.component("StepTitle", StepTitle);
app.component("MiniGameTitle", MiniGameTitle);
app.component("Stamp", Stamp);

app.config.globalProperties.$filters = {
  hideDollar(value: string) {
    if (value.slice(0, 1) == "$") {
      return value.slice(1, value.length);
    }
    return value;
  },
};
