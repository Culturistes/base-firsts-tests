<template>
  <button
    v-if="button"
    class="quiz-block quiz-block-button"
    :class="{
      selected: selected,
      wrong: wrong,
      right: right,
    }"
  >
    <slot></slot>
  </button>
  <li v-else-if="li" class="quiz-block quiz-block-li" :class="{ right: right }">
    <slot></slot>
  </li>
  <div v-else class="quiz-block">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    li: {
      type: Boolean,
      default: false,
    },
    button: {
      type: Boolean,
      default: false,
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
export default class QuizBlock extends Vue {}
</script>

<style lang="scss" scoped>
$margin-between-btn: 15px;

.quiz-block {
  font-family: $btnFont;

  padding: 40px;
  margin-bottom: 40px;
  width: 100%;

  background-color: $light-text;
  border: solid 5px white;
  border-radius: $border-radius;

  &.selected {
    background-color: $wait;
  }

  &.right {
    background-color: $right;
  }

  &.wrong {
    background-color: $wrong;
  }

  &-button {
    display: inline-block;
    width: calc(50% - #{$margin-between-btn});

    padding: 20px;
    margin-bottom: $margin-between-btn;

    cursor: pointer;
  }

  &-li {
    padding: 20px;
    margin-bottom: $margin-between-btn;
  }
}
</style>
