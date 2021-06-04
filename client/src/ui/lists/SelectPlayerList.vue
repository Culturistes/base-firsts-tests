<template>
  <div>
    <MinimalistArrowBtn direction="left" @click="selectedPos++"
      >Précédent</MinimalistArrowBtn
    >
    <MinimalistArrowBtn direction="right" @click="selectedPos--"
      >Suivant</MinimalistArrowBtn
    >
    <div class="select-player-list">
      <Stamp :pos="0" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="1" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="2" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="3" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="4" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="5" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="6" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="7" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="8" :selected="selectedPos" people="rando"></Stamp>
      <Stamp :pos="9" :selected="selectedPos" people="rando"></Stamp>
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

  selectedPos = 9;
}
</script>

<style scoped lang="scss">
.select-player-list {
  display: flex;
  align-items: center;

  transform: translateX(calc(50vw - #{$steps-padding} - 113px));
}
</style>
