<template>
  <div class="input" :class="{ black: color == 'black' }">
    <label class="input-label" :class="{ hide: modelValue.length > 0 }"
      ><span class="text"><slot></slot></span>
    </label>
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
  padding: 20px 40px;

  background-color: rgba($color: #fff, $alpha: 0.2);

  border-radius: 50px;

  &-text,
  &-label {
    font-family: $btnFont;
    font-weight: bold;
    font-size: $fontSsize;
    color: $light-text;
  }

  &-text {
    width: 100%;

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
