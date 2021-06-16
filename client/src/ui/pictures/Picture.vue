<template>
  <button
    class="picture"
    :class="{
      'picture-blue': color === 'blue',
      'picture-rose': color === 'rose',
    }"
  >
    <img
      v-if="!selected && !showAnswer"
      :src="'/img/pictures/' + color + '.png'"
    />
    <img
      v-else-if="selected && !showAnswer"
      :src="'/img/pictures/' + color + '-selected.png'"
    />
    <img
      v-else-if="!right && showAnswer"
      :src="'/img/pictures/' + color + '.png'"
    />
    <img
      v-else-if="right && showAnswer"
      :src="'/img/pictures/' + color + '-selected.png'"
    />
    <p v-if="showAnswer" class="responded-number">{{ respondedNumber }}</p>
    <p class="answer"><slot></slot></p>
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
    showAnswer: {
      type: Boolean,
      default: false,
    },
    respondedNumber: {
      type: Number,
      default: 0,
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

  .responded-number {
    position: absolute;
  }

  p {
    position: absolute;

    font-family: $btnFont;
    font-weight: bold;
    font-size: $fontLsize;
  }

  &-blue {
    .responded-number {
      bottom: 6.3%;
      right: 17.4%;
    }
    .answer {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 56%;
      height: 43%;
      left: 30%;
      top: 22%;
    }
    p {
      transform: rotate(-11deg);
    }
  }

  &-rose {
    .responded-number {
      bottom: 3.3%;
      right: 36.2%;
    }
    .answer {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 58%;
      top: 13%;
      height: 47%;
      right: 14%;
    }
    p {
      transform: rotate(18deg);
    }
  }
}
</style>
