<template>
  <ul class="playersList" v-if="!minigameresult">
    <ListBlock
      :li="true"
      :ready="player.isReady"
      class="playerName"
      v-bind:class="{ active: player.isReady }"
      v-for="(player, i) in $store.state.players"
      v-bind:key="player.id"
      :rank="i + 1"
      :name="player.username"
      :score="player.score"
      :scoreWon="player.scoreWon"
      :perso="player.avatarURL"
      :minigameresult="minigameresult"
    >
    </ListBlock>
  </ul>

  <div class="playersListContainer" v-else>
    <ul>
      <ListBlock
        :li="true"
        :ready="player.isReady"
        class="playerName"
        v-bind:class="{ active: player.isReady }"
        v-for="(player, i) in firstColumn"
        v-bind:key="player.id"
        :rank="i + 1"
        :name="player.username"
        :score="player.score"
        :scoreWon="player.scoreWon"
        :perso="player.avatarURL"
        :minigameresult="minigameresult"
      >
      </ListBlock>
    </ul>
    <ul>
      <ListBlock
        :li="true"
        :ready="player.isReady"
        class="playerName"
        v-bind:class="{ active: player.isReady }"
        v-for="(player, i) in secondColumn"
        v-bind:key="player.id"
        :rank="i + 1 + firstColumn.length"
        :name="player.username"
        :score="player.score"
        :scoreWon="player.scoreWon"
        :perso="player.avatarURL"
        :minigameresult="minigameresult"
      >
      </ListBlock>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

@Options({
  props: {
    minigameresult: {
      type: Boolean,
      default: false,
    },
  },
})
export default class playersList extends Vue {
  $store!: Store<StoreState>;

  steps = STEPS;

  get playersByColumn() {
    return Math.round(this.$store.state.players.length / 2);
  }

  get firstColumn() {
    let array = [];
    for (let i = 0; i < this.playersByColumn; i++) {
      array.push(this.$store.state.players[i]);
    }

    return array;
  }

  get secondColumn() {
    let array = [];
    for (
      let i = this.playersByColumn;
      i < this.$store.state.players.length;
      i++
    ) {
      array.push(this.$store.state.players[i]);
    }

    return array;
  }

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

.playersListContainer {
  display: flex;
  width: 1013px;
  justify-content: center;
  margin: auto;
}
</style>
