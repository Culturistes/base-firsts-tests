<template>
  <button
    class="picture"
    :class="{
      'picture-blue': color === 'blue',
      'picture-rose': color === 'rose',
    }"
  >
    <img v-if="!selected" :src="'/img/pictures/' + color + '.png'" />
    <img v-else :src="'/img/pictures/' + color + '-selected.png'" />
    <p><slot></slot></p>
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    color: {
      type: String,
      default: "blue",
    },
    selected: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    wrong: {
      type: Boolean,
      default: false,
    },
  },
})
export default class Picture extends Vue {}
</script>

<style lang="scss">
.picture {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: none;
  border: none;

  cursor: pointer;

  p {
    position: absolute;

    font-family: $btnFont;
    font-weight: bold;
    font-size: $fontLsize;
  }

  &-blue {
    p {
      transform: rotate(-11deg);
    }
  }

  &-rose {
    p {
      transform: rotate(18deg);
    }
  }
}
</style>
