<template>
  <li class="list-block" :class="{ minigameresult: minigameresult }">
    <p class="rank">{{ rank }}</p>
    <img class="img" :src="'/img/stamps/' + perso + '-s.svg'" />
    <div v-if="!minigameresult" class="info">
      <p class="name">{{ name }}</p>
      <p class="score">{{ score }} km</p>
    </div>
    <div class="minigameresult-info" v-if="minigameresult">
      <p class="name">{{ name }}</p>
      <div class="scoreWonContainer">
        <div class="anchor"></div>
        <div class="scoreWon">
          <div class="shadow1"></div>
          <div class="shadow2"></div>
          <div class="label">+ {{ scoreWon }} km</div>
        </div>
      </div>
      <p class="score">{{ score }} km</p>
    </div>
    <img class="ready" v-if="ready" src="/img/divers/ready.svg" />
    <div
      class="scoreWon"
      v-if="
        $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
        scoreWon > 0
      "
    >
      <div class="anchor"></div>
      + {{ scoreWon }} km
    </div>
  </li>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

@Options({
  props: {
    minigameresult: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
      default: 1,
    },
    name: {
      type: String,
      default: "Moi",
    },
    score: {
      type: Number,
      default: 0,
    },
    scoreWon: {
      type: Number,
      default: 0,
    },
    perso: {
      type: String,
      default: "rando",
    },
    ready: {
      type: Boolean,
      default: false,
    },
  },
})
export default class QuizBlock extends Vue {
  $store!: Store<StoreState>;
  steps = STEPS;
}
</script>

<style lang="scss">
.list-block {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba($color: #faf5ed, $alpha: 0.3);
  border-radius: 13px;
  padding: 5px 16px;
  margin-bottom: 6px;

  font-family: $btnFont;

  .rank {
    margin-right: 16px;
  }

  .img {
    width: 50px;
    margin-right: 16px;
  }

  .ready {
    position: absolute;
    right: 8px;
  }

  .info {
    text-align: left;

    p {
      margin: 0;

      font-size: 1.4rem;

      &.rank {
        font-size: $fontSsize;
      }

      &.score {
        font-weight: normal;
      }
    }
  }
  &.minigameresult {
    width: 490px;
    background: white;

    padding-right: 60px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 20px;
    .minigameresult-info {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      .name {
        font-size: 2.5rem;
        margin-right: 25px;
      }
      .score {
        font-size: 1.5rem;
        font-weight: normal;
      }
      .scoreWonContainer {
        position: relative;
        right: 0;
        margin-right: auto;

        transform: none;
      }
    }
  }
  .scoreWonContainer {
    position: absolute;
    right: 6%;
    transform: translateX(113%);

    .scoreWon {
      position: relative;

      //box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;

      //box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;

      .shadow1 {
        position: absolute;
        padding: 15px;
        border-radius: 12px;
        background-color: white;
        z-index: 0;
        width: 100%;
        height: 100%;

        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 12px;
          height: 10px;
          border-top-left-radius: 12px;
          z-index: 0;
          box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;
        }

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 20px;
          height: 12px;
          z-index: 0;
          background-color: white;
          border-bottom-left-radius: 12px;
          box-shadow: rgba($color: #000, $alpha: 0.25) 0px -2px 5px;
        }
      }

      .shadow2 {
        position: absolute;
        padding: 15px;
        border-radius: 12px;
        background-color: white;
        z-index: 0;
        width: 100%;
        height: 100%;

        &::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 80%;
          border-top-right-radius: 12px;
          z-index: 0;
          box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;
        }

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px;
          z-index: 0;
          background-color: white;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;
        }
      }

      .label {
        position: relative;
        z-index: 10;

        padding: 15px;
        border-radius: 12px;
        background-color: white;

        font-size: 1.6rem;
      }
    }
    .anchor {
      position: absolute;
      width: 20px;
      height: 20px;
      transform: translate(-50%, -50%) scaleY(0.6);
      top: 50%;
      left: -10px;
      z-index: 0;

      &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        transform: rotate(45deg);
        z-index: 0;

        box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;
      }
    }
  }
}
</style>
