<template>
  <button
    class="btn-arrow btn-arrow-m"
    :class="{ disabled: disabled, validate: validate }"
    :disabled="disabled"
  >
    <span v-if="!validate"><slot></slot></span>
    <span v-else>Lien copié !</span>
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
    validate: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ArrowBtn extends Vue {}
</script>

<style lang="scss" scoped>
.btn-arrow {
  width: 214px;
  height: 96px;
  font-family: $btnFont;
  font-weight: bold;
  text-align: left;
  text-transform: uppercase;
  font-size: 2rem;

  border: none;

  background-image: url("/img/buttons/panneau.svg");
  background-color: unset;
  background-size: 100% 100%;

  cursor: pointer;

  span {
    display: block;
    width: 100%;
    padding: 5px;
    text-align: center;
    transform: translate(-11px, 0px) rotate(-4deg);
  }

  &.validate {
    background-image: url("/img/buttons/panneau-validate.svg");
  }

  &.disabled {
    opacity: 0.5;

    cursor: not-allowed;
  }
}
</style>
