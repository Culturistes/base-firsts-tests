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
    :class="{ disabled: disabled }"
    :disabled="disabled"
  >
    <span><slot></slot></span>
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
  },
})
export default class StarBtn extends Vue {}
</script>

<style lang="scss" scoped>
.star-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 130px;
  height: 130px;
  background-color: unset;
  background-image: url("/img/buttons/star.svg");
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
    transform: rotate(15deg);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
