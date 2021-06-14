<template>
  <div class="select-player-list-container">
    <MinimalistArrowBtn
      class="btn-left"
      direction="left"
      @click="changePerso('-')"
      >Précédent</MinimalistArrowBtn
    >
    <MinimalistArrowBtn
      class="btn-right"
      direction="right"
      @click="changePerso('+')"
      >Suivant</MinimalistArrowBtn
    >
    <div class="select-player-list">
      <Stamp :pos="0" :selected="selectedPos" people="surfeuse"></Stamp>
      <Stamp :pos="1" :selected="selectedPos" people="surfeuse"></Stamp>
      <Stamp :pos="2" :selected="selectedPos" people="surfeuse"></Stamp>
      <Stamp :pos="3" :selected="selectedPos" people="garcon"></Stamp>
      <Stamp :pos="4" :selected="selectedPos" people="surfeuse"></Stamp>
      <Stamp :pos="5" :selected="selectedPos" people="fermier"></Stamp>
      <Stamp :pos="6" :selected="selectedPos" people="skieuse"></Stamp>
      <Stamp :pos="7" :selected="selectedPos" people="camping"></Stamp>
      <Stamp :pos="8" :selected="selectedPos" people="touriste"></Stamp>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class SelectPlayerList extends Vue {
  $store!: Store<StoreState>;

  selectedPos = 4;
  numberPerso = 9;

  changePerso(direction: string) {
    if (direction === "-") {
      this.selectedPos--;
    } else if (direction === "+") {
      this.selectedPos++;
    }

    if (this.selectedPos > this.numberPerso - 1) {
      this.selectedPos = 0;
    } else if (this.selectedPos < 0) {
      this.selectedPos = this.numberPerso - 1;
    }
  }
}
</script>

<style scoped lang="scss">
.select-player-list-container {
  position: relative;

  .btn-left {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 20;
    cursor: pointer;
  }

  .btn-right {
    position: absolute;
    top: 50%;
    right: 0;
    z-index: 20;
    cursor: pointer;
  }
}
.select-player-list {
  display: flex;
  align-items: center;

  transform: translateX(calc(50vw - #{$steps-padding} - 113px));
}
</style>
