<template>
  <span class="rect"
    ><img src="/img/divers/rect.svg" class="bg" />
    <div class="mask">
      <span
        v-for="(word, i) in wordList"
        :key="i"
        class="text"
        :style="{ transform: 'translateY(calc(' + translate + '% + 3px))' }"
        >{{ word }}</span
      >
    </div></span
  >
</template>

pinzutu, touriste, ESTIVANT, VACANCIER, TROADOUR

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    selected: {
      type: Number,
      default: 0,
    },
  },
})
export default class Rect extends Vue {
  wordList = [
    "Monchu",
    "pinzutu",
    "touriste",
    "Estivant",
    "Vacancier",
    "Troadour",
  ];

  get translate() {
    return 100 * -this.selected;
  }
}
</script>

<style lang="scss" scoped>
.rect {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 157px;
  height: 42px;
  transform: translate(10px, -7px);

  color: black;

  .bg {
    position: absolute;
  }

  .mask {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 84%;
    overflow: hidden;

    transform: rotate(-3deg);
  }

  .text {
    position: relative;
    transform: rotate(-3deg);

    transition: transform 0.3s;
  }
}
</style>
