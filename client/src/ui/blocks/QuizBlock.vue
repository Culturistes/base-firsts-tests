<template>
  <button
    v-if="button"
    class="quiz-block quiz-block-button"
    :class="{
      selected: selected,
      wrong: wrong,
      right: right,
      fit: fit,
      'half-opacited': halfOpacited,
    }"
  >
    <slot></slot>
  </button>
  <li v-else-if="li" class="quiz-block quiz-block-li" :class="{ right: right }">
    <slot></slot>
  </li>
  <div v-else class="quiz-block" :class="{ fit: fit }">
    <div
      v-if="isTimer"
      class="bar bar-up-right"
      :style="{ width: timerBarSize.topRight + '%' }"
    ></div>
    <div
      v-if="isTimer"
      :style="{ height: timerBarSize.right + '%' }"
      class="bar bar-right"
    ></div>
    <div
      v-if="isTimer"
      :style="{ width: timerBarSize.bottom + '%' }"
      class="bar bar-down"
    ></div>
    <div
      v-if="isTimer"
      :style="{ height: timerBarSize.left + '%' }"
      class="bar bar-left"
    ></div>
    <div
      v-if="isTimer"
      :style="{ width: timerBarSize.topLeft + '%' }"
      class="bar bar-up-left"
    ></div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

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
    fit: {
      type: Boolean,
      default: false,
    },
    halfOpacited: {
      type: Boolean,
      default: false,
    },
    isTimer: {
      type: Boolean,
      default: false,
    },
  },
})
export default class QuizBlock extends Vue {
  $store!: Store<StoreState>;

  timer = 20;
  elapsedTime = 0;
  maxTime = 20;

  timerBar = {
    topRight: (100 * this.maxTime) / 500,
    right: (50 * this.maxTime) / 500,
    bottom: (200 * this.maxTime) / 500,
    left: (50 * this.maxTime) / 500,
    topLeft: (100 * this.maxTime) / 500,
  };

  stepTime = {
    topRight: 0,
    right: this.timerBar.topRight,
    bottom: this.timerBar.topRight + this.timerBar.right,
    left: this.timerBar.topRight + this.timerBar.right + this.timerBar.bottom,
    topLeft:
      this.timerBar.topRight +
      this.timerBar.right +
      this.timerBar.bottom +
      this.timerBar.left,
  };

  timerBarSize = {
    topRight: 0,
    right: 0,
    bottom: 0,
    left: 0,
    topLeft: 0,
  };

  mounted(): void {
    this.$store.state.room?.state.listen(
      "currentTimer",
      (val: number, oldVal: number) => {
        this.timer = Math.round(val);
        this.elapsedTime = this.maxTime - val;

        if (this.maxTime === this.timer) {
          this.timerBarSize = {
            topRight: 0,
            right: 0,
            bottom: 0,
            left: 0,
            topLeft: 0,
          };
        }

        if (this.elapsedTime <= this.timerBar.topRight) {
          this.timerBarSize.topRight =
            (50 / this.timerBar.topRight) * this.elapsedTime;
        } else if (
          this.elapsedTime > this.stepTime.right &&
          this.elapsedTime <= this.timerBar.right + this.stepTime.right
        ) {
          this.timerBarSize.right =
            (100 / this.timerBar.right) *
            (this.elapsedTime - this.stepTime.right);
        } else if (
          this.elapsedTime > this.stepTime.bottom &&
          this.elapsedTime <= this.timerBar.bottom + this.stepTime.bottom
        ) {
          this.timerBarSize.bottom =
            (100 / this.timerBar.bottom) *
            (this.elapsedTime - this.stepTime.bottom);
        } else if (
          this.elapsedTime > this.stepTime.left &&
          this.elapsedTime <= this.timerBar.left + this.stepTime.left
        ) {
          this.timerBarSize.left =
            (100 / this.timerBar.left) *
            (this.elapsedTime - this.stepTime.left);
        } else if (
          this.elapsedTime > this.stepTime.topLeft &&
          this.elapsedTime <= this.timerBar.topLeft + this.stepTime.topLeft
        ) {
          this.timerBarSize.topLeft =
            (50 / this.timerBar.topLeft) *
            (this.elapsedTime - this.stepTime.topLeft);
        }
      }
    );
  }
}
</script>

<style lang="scss" scoped>
$margin-between-btn: 7px;

.quiz-block {
  position: relative;
  font-family: $btnFont;

  padding: 40px;
  margin-bottom: 40px;
  width: 100%;

  background-color: $light-text;
  border: solid 5px white;
  border-radius: $border-radius;

  &.selected {
    border: solid $wrong 5px;
  }

  &.right {
    border: solid $right 5px;
  }

  &.wrong {
    position: relative;
    border: solid $wrong 5px;
    overflow: hidden;
    &::after {
      content: "";
      width: 200%;
      height: 5px;
      background: $wrong;
      top: 0;
      left: 0;
      position: absolute;
      transform: rotate(-10deg);
      top: 46%;
      left: -50%;
    }
  }
  &.half-opacited {
    opacity: 0.5;
  }

  &-button {
    display: inline-block;
    width: calc(50% - #{$margin-between-btn});

    padding: 20px;
    margin-bottom: 15px;

    cursor: pointer;
  }

  &-li {
    padding: 20px;
    margin-bottom: $margin-between-btn;
  }

  $paddingTop: 15px;
  $paddingSide: 20px;
  &.fit {
    width: auto;
    display: table;
    margin-left: auto;
    margin-right: auto;
    padding: $paddingTop $paddingSide;

    .bar-up-left,
    .bar-up-right,
    .bar-down {
      height: 3px;
    }

    .bar-left,
    .bar-right {
      width: 3px;
    }
  }

  .bar {
    position: absolute;
    background: $color3;
  }

  .bar-up-left,
  .bar-up-right,
  .bar-down {
    height: 6px;

    //transition: linear 0.3s;
  }

  .bar-up-left,
  .bar-up-right {
    top: 0;
    width: 0%;
  }

  .bar-up-left {
    left: 0;
  }

  .bar-up-right {
    left: 50%;
  }

  .bar-down {
    width: 0%;
    bottom: 0;
    right: 0;
  }

  .bar-left,
  .bar-right {
    width: 6px;
    height: 0%;

    //transition: linear 0.3s;
  }

  .bar-left {
    bottom: 0;
    left: 0;
  }
  .bar-right {
    top: 0;
    right: 0;
  }
}
</style>
