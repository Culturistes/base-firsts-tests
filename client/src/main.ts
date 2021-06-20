import dotenv from "dotenv";
dotenv.config();

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import Loading from "./ui/loading/Loading.vue";

import PlayersList from "./ui/lists/PlayersList.vue";
import RoundList from "./ui/lists/RoundList.vue";
import QuizBlock from "./ui/blocks/QuizBlock.vue";
import ListBlock from "./ui/blocks/ListBlock.vue";
import ArrowBtn from "./ui/buttons/ArrowBtn.vue";
import PanneauBtn from "./ui/buttons/PanneauBtn.vue";
import StarBtn from "./ui/buttons/StarBtn.vue";
import LineBtn from "./ui/buttons/LineBtn.vue";
import MinimalistArrowBtn from "./ui/buttons/MinimalistArrowBtn.vue";
import TextInput from "./ui/input/TextInput.vue";
import StepTitle from "./ui/titles/StepTitle.vue";
import MiniGameTitle from "./ui/titles/MiniGameTitle.vue";
import Stamp from "./ui/stamps/Stamp.vue";
import StampS from "./ui/stamps/StampS.vue";
import VSStamp from "./ui/stamps/VSStamp.vue";
import Rect from "./ui/stamps/Rect.vue";
import Picture from "./ui/pictures/Picture.vue";
import PictureSolo from "./ui/pictures/PictureSolo.vue";

const app = createApp(App);

app.use(store).use(router).mount("#app");

app.component("Loading", Loading);

app.component("PlayersList", PlayersList);
app.component("RoundList", RoundList);
app.component("QuizBlock", QuizBlock);
app.component("ListBlock", ListBlock);
app.component("ArrowBtn", ArrowBtn);
app.component("PanneauBtn", PanneauBtn);
app.component("StarBtn", StarBtn);
app.component("LineBtn", LineBtn);
app.component("MinimalistArrowBtn", MinimalistArrowBtn);
app.component("TextInput", TextInput);
app.component("StepTitle", StepTitle);
app.component("MiniGameTitle", MiniGameTitle);
app.component("Stamp", Stamp);
app.component("StampS", StampS);
app.component("VSStamp", VSStamp);
app.component("Rect", Rect);
app.component("Picture", Picture);
app.component("PictureSolo", PictureSolo);

app.config.globalProperties.$filters = {
  hideDollar(value: string) {
    if (value.slice(0, 1) == "$") {
      return value.slice(1, value.length);
    }
    return value;
  },
};
