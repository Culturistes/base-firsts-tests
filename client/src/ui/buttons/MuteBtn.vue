<template>
  <router-link
    v-if="routerLink"
    class="star-btn"
    :class="{ disabled: disabled }"
  >
    <span><slot></slot></span>
  </router-link>
  <button
    v-else
    class="star-btn"
    :class="{ disabled: disabled, big: big }"
    :disabled="disabled"
  >
    <span v-if="!valid"><slot></slot></span>
    <span v-else><img src="/img/button/trumpet_muted.svg" /></span>
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    routerLink: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    valid: {
      type: Boolean,
      default: false,
    },
    big: {
      type: Boolean,
      default: false,
    },
  },
})
export default class MuteBtn extends Vue {}
</script>

<style lang="scss" scoped>
.star-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 48px;
  height: 48px;
  background-color: unset;
  background-image: url("/img/buttons/trumpet.svg");
  background-size: 100%;
  border: none;

  font-family: "Baloo";
  font-weight: bold;
  font-size: $fontSsize;
  color: $light-text;
  text-transform: uppercase;
  text-decoration: none;

  span {
    display: block;

    pointer-events: none;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.big {
    width: 160px;
    height: 160px;
  }
}
</style>
