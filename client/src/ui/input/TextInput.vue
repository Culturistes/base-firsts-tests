<template>
  <div class="input" :class="{ black: color == 'black' }">
    <label class="input-label" :class="{ hide: modelValue.length > 0 }"
      ><span class="text"><slot></slot></span>
      <div class="subline"></div
    ></label>
    <input
      class="input-text"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    type: {
      type: String,
      default: "text",
    },
    color: {
      type: String,
      default: "white",
    },
    modelValue: {
      type: String,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
})
export default class TextInput extends Vue {}
</script>

<style lang="scss" scoped>
.input {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &-text,
  &-label {
    font-family: $titleFont;
    font-weight: bold;
    color: $light-text;
  }

  &-text {
    border: none;
    background: none;

    text-align: center;
  }

  &-label {
    pointer-events: none;
    position: absolute;

    .text {
      transition: 0.3s;
    }

    .subline {
      position: absolute;
      bottom: -0.6rem;
      left: 50%;
      transform: translateX(-50%);

      width: 13.487rem;
      height: 0.733rem;

      background: url("/img/inputs/inputLine.svg");
      background-size: 100% 100%;
    }

    &.hide {
      .text {
        opacity: 0;
      }
    }
  }

  &.black {
    .input-text,
    .input-label {
      color: black;
    }

    .subline {
      filter: invert(1);
    }
  }
}
</style>
