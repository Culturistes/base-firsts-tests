<template>
  <button class="minimalist-arrow-btn" v-if="direction == 'left'">
    <img src="/img/buttons/left-arrow.svg" />
    <slot></slot>
  </button>
  <button class="minimalist-arrow-btn" v-else-if="direction == 'right'">
    <slot></slot>
    <img src="/img/buttons/right-arrow.svg" />
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    direction: {
      type: String,
      default: "left",
    },
  },
})
export default class MinimalistArrowBtn extends Vue {}
</script>

<style lang="scss" scoped>
.minimalist-arrow-btn {
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: $btnFont;
  font-weight: bold;
  background: none;
  border: none;
}
</style>
