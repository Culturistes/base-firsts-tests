<template>
  <div
    class="slide-container"
    :class="[
      color == 'blue' ? 'blue' : 'rose',
      isOut ? 'isOut' : '',
      'pic-' + i,
    ]"
  >
    <div
      class="picture"
      :class="['pic-' + i, color == 'blue' ? 'blue' : 'rose']"
    >
      <div
        class="case"
        :class="{ blue: color == 'blue', rose: color == 'rose' }"
      >
        <p><slot></slot></p>
      </div>
      <div class="info">
        <p v-if="isQuestion">{{ result }}</p>
        <p v-else>0</p>
        <img v-if="!isQuestion" :src="'/img/divers/like_empty.svg'" />
        <img
          v-if="!selected && !showAnswer && isQuestion"
          :src="'/img/divers/like_empty.svg'"
        />
        <img
          v-else-if="selected && !showAnswer && isQuestion"
          :src="'/img/divers/like_full.svg'"
        />
        <img
          v-else-if="!right && showAnswer && isQuestion"
          :src="'/img/divers/like_empty.svg'"
        />
        <img
          v-else-if="right && showAnswer && isQuestion"
          :src="'/img/divers/like_full.svg'"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    color: {
      type: String,
      default: "blue",
    },
    result: {
      default: 0,
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
    isQuestion: {
      type: Boolean,
      default: false,
    },
    isOut: {
      type: Boolean,
      default: false,
    },
    i: {
      default: 0,
    },
  },
})
export default class Picture extends Vue {}
</script>

<style lang="scss" scoped>
.slide-container {
  transition: transform 0.5s;

  &.rose {
    transition-delay: 0.1s;
  }

  &.isOut {
    transform: translateY(100vh) rotate(30deg);
  }

  &.pic-0 {
    z-index: 5;
  }

  &.pic-1 {
    z-index: 4;
  }

  &.pic-2 {
    z-index: 3;
  }

  &.pic-3 {
    z-index: 2;
  }

  &.pic-4 {
    z-index: 1;
  }
}
.picture {
  position: relative;

  cursor: pointer;

  width: 218px;
  height: 248px;

  background-color: white;

  box-shadow: rgba($color: #000000, $alpha: 0.25) 0px 4px 4px;

  .case {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 14px;
    left: 14px;
    width: 190px;
    height: 162px;

    &.rose {
      background-color: $color8;
    }

    &.blue {
      background-color: $color5;
    }

    p {
      position: absolute;
      width: 100%;
      font-family: $titleFont;
      font-weight: 900;
      font-size: $fontLsize;
    }
  }

  .info {
    position: absolute;
    bottom: 14px;
    right: 14px;
    display: flex;
    font-family: $btnFont;
    font-weight: bold;
    font-size: $fontLsize;

    p {
      margin: 0;
      margin-right: 5px;
    }
  }

  &.blue {
    &.pic-0 {
      transform: rotate(-10.49deg) translate(0%, 0%);
    }

    &.pic-1 {
      transform: rotate(-10.49deg) translate(-20%, -5%);
    }

    &.pic-2 {
      transform: rotate(-17.49deg) translate(5%, 5%);
    }

    &.pic-3 {
      transform: rotate(-17.49deg) translate(2%, 10%);
    }

    &.pic-4 {
      transform: rotate(-15.49deg) translate(-15%, 10%);
    }
  }

  &.rose {
    &.pic-0 {
      transform: rotate(19.49deg);
    }

    &.pic-1 {
      transform: rotate(-19.49deg);
    }

    &.pic-2 {
      transform: rotate(2deg);
    }

    &.pic-3 {
      transform: rotate(14.49deg);
    }

    &.pic-4 {
      transform: rotate(12.49deg);
    }
  }
}
</style>
