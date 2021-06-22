<template>
  <router-link
    v-if="routerLink"
    class="star-btn"
    :class="{ disabled: disabled, absolute: absolute, centered: centered }"
  >
    <span><slot></slot></span>
  </router-link>
  <button
    v-else
    class="star-btn"
    :class="{
      disabled: disabled,
      big: big,
      absolute: absolute,
      centered: centered,
      'fixed-center': fixedCenter,
      little: little,
    }"
    :disabled="disabled"
  >
    <span v-if="!valid"><slot></slot></span>
    <span v-else><img src="/img/divers/valid.svg" /></span>
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
    absolute: {
      type: Boolean,
      default: false,
    },
    centered: {
      type: Boolean,
      default: false,
    },
    fixedCenter: {
      type: Boolean,
      default: false,
    },
    little: {
      type: Boolean,
      default: false,
    },
  },
})
export default class StarBtn extends Vue {}
</script>

<style lang="scss" scoped>
.star-btn {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 130px;
  height: 130px;
  border: none;

  font-family: "Baloo";
  font-weight: bold;
  font-size: $fontSsize;
  color: $light-text;
  text-transform: uppercase;
  text-decoration: none;

  z-index: 3;

  &.absolute {
    position: absolute;
  }

  &.centered {
    transform: translateX(-50%);
  }

  &.little {
    width: 80px;
    height: 80px;

    img {
      transform: scale(0.7);
    }
  }

  &.fixed-center {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: unset;
    background-image: url("/img/buttons/star.svg");
    background-size: 100%;
    transition: transform 0.2s ease;

    animation: rotation 8s forwards linear infinite;
    animation-play-state: paused;
  }

  &:hover {
    &::before {
      animation-play-state: running;
    }
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  span {
    display: block;
    transform: translateZ(0) rotate(15deg);
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
