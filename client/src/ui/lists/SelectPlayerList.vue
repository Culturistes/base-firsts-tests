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
      <Stamp
        :key="i"
        v-for="(p, i) in PEOPLE"
        :pos="i"
        :selected="selectedPos"
        :people="p"
      ></Stamp>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

const PEOPLE = [
  "surfeuse",
  "surfeuse",
  "surfeuse",
  "garcon",
  "surfeuse",
  "fermier",
  "skieuse",
  "camping",
  "touriste",
];

@Options({
  props: {
    modelValue: {
      type: String,
    },
  },
})
export default class SelectPlayerList extends Vue {
  $store!: Store<StoreState>;
  PEOPLE = PEOPLE;

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

    this.$emit("update:modelValue", PEOPLE[this.selectedPos]);
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
