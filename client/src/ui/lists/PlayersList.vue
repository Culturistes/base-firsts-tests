<template>
  <ul class="playersList">
    <ListBlock
      :li="true"
      :right="player.isReady"
      class="playerName"
      v-bind:class="{ active: player.isReady }"
      v-for="(player, i) in $store.state.players"
      v-bind:key="player.id"
      :rank="i + 1"
      :name="player.username"
      :score="player.score"
      :scoreWon="player.scoreWon"
    >
    </ListBlock>
  </ul>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

/* @Options({
  props: ["streamerMode"],
}) */
export default class playersList extends Vue {
  $store!: Store<StoreState>;

  steps = STEPS;

  mounted(): void {
    store.watch(
      () => this.$store.state.players,
      (val, oldVal) => {
        //
      }
    );
  }

  updated(): void {
    console.log(
      this.$store.state.livegame.currentStep ==
        this.steps.MINI_GAME_ROUND_RESULT,
      this.$store.state.livegame.currentStep,
      this.steps.MINI_GAME_ROUND_RESULT
    );
  }
}
</script>

<style lang="scss" scoped>
.playersList {
  margin-top: 0;
  list-style: none;
  padding: 0;

  .playerName {
    position: relative;
    .scoreWon {
      color: green;
      transform: rotateZ(20deg) translateY(-50%);
      position: absolute;
      right: 10px;
      top: 50%;
      opacity: 0;

      &.active {
        animation: animate 1s ease forwards;
      }

      @keyframes animate {
        0% {
          opacity: 0;
          transform: scale(1, 1) rotateZ(20deg) translateY(-50%);
        }
        10% {
          opacity: 1;
          transform: scale(1.02, 0.9) rotateZ(20deg) translateY(-50%);
        }
        30% {
          transform: scale(0.9, 1.02) rotateZ(20deg) translateY(-48%);
        }
        50% {
          transform: scale(1.02, 0.95) rotateZ(20deg) translateY(-50%);
        }
        57% {
          transform: scale(1, 1) rotateZ(20deg) translateY(-49%);
        }
        64% {
          transform: scale(1, 1) rotateZ(20deg) translateY(-50%);
        }
        100% {
          transform: scale(1, 1) rotateZ(20deg) translateY(-50%);
          opacity: 1;
        }
      }
    }
  }
}
</style>
