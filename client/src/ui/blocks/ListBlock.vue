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
      <div class="scoreWon">
        <div class="anchor"></div>
        + {{ scoreWon }} km
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
      type: String,
      default: "1",
    },
    name: {
      type: String,
      default: "Moi",
    },
    score: {
      type: String,
      default: "0",
    },
    scoreWon: {
      type: String,
      default: "0",
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
      .scoreWon {
        position: relative;
        right: 0;
        margin-right: auto;

        transform: none;
      }
    }
  }
  .scoreWon {
    position: absolute;
    right: 6%;
    background-color: white;
    padding: 15px;
    border-radius: 12px;
    transform: translateX(113%);

    z-index: 1;

    font-size: 1.6rem;

    box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;

    .anchor {
      position: absolute;
      left: -10px;
      top: calc(50% - 7px);
      transform: scaleY(0.6);
      z-index: -1;

      &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        transform: rotate(45deg);

        //box-shadow: rgba($color: #000, $alpha: 0.25) 0px 5px 5px;
      }
    }
  }
}
</style>
