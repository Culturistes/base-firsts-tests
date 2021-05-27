<template>
  <h2 class="h2" :class="{ black: color === 'black' }">
    <slot></slot>
    <div class="subline"></div>
  </h2>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    color: {
      type: String,
      default: "white",
    },
  },
})
export default class StepTitle extends Vue {}
</script>

<style lang="scss" scoped>
.h2 {
  display: table;
  position: relative;

  margin-top: 0;

  text-align: left;
  font-family: $titleFont;
  font-weight: bold;
  font-size: $fontLsize;
  color: $light-text;

  .subline {
    position: absolute;
    bottom: -0.6rem;
    right: 0%;

    width: 13.487rem;
    height: 0.733rem;

    background: url("/img/inputs/inputLine.svg");
    background-size: 100% 100%;
  }

  &.black {
    color: black;

    .subline {
      filter: invert(1);
    }
  }
}
</style>
