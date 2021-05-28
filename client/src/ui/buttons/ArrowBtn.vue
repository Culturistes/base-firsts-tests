<template>
  <button
    class="btn-arrow btn-arrow-m"
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
    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ArrowBtn extends Vue {}
</script>

<style lang="scss" scoped>
.btn-arrow {
  font-family: $btnFont;
  color: $light-text;
  text-align: left;

  border: none;

  background-color: unset;
  background-size: 100% 100%;

  cursor: pointer;

  span {
    display: block;
    width: 9rem;

    padding: 5px;

    text-align: center;
  }

  &-m {
    width: 152px;
    height: 70px;

    background-image: url("/img/buttons/button-m.png");
  }

  &-l {
    width: 172px;
    height: 70px;

    background-image: url("/img/buttons/button-l.png");
  }

  &.disabled {
    opacity: 0.5;

    cursor: not-allowed;
  }
}
</style>
