<template>
  <button class="panneau-btn" :class="{ active: active }">
    <p class="title">{{ title }}</p>
    <p class="description"><slot></slot></p>
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    title: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
})
export default class PanneauBtn extends Vue {}
</script>

<style lang="scss" scoped>
.panneau-btn {
  background-color: $color3-light;
  border-radius: $border-radius;

  padding: 20px;
  margin-bottom: 10px;

  border: solid white 5px;

  text-align: left;

  transition: 0.3s;

  .title {
    margin: 0px;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .description {
    font-family: $btnFont;
    font-size: 1.3rem;

    margin-top: 6px;
    margin-bottom: 0;
  }

  &.active {
    background-color: $color3;
    border: solid black 5px;
  }
}
</style>
