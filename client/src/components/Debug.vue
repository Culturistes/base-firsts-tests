<template>
  <div class="debug" v-if="showDebug">
    <p>Debug</p>
    <div class="sep"></div>
    <p>Client: {{ $store.state.client }}</p>
    <div class="sep"></div>
    <p>Room: {{ $store.state.room?.sessionId }}</p>
    <div class="sep"></div>
    <p>Players:</p>
    <div class="playersList">
      <div
        class="playerCard"
        v-for="player in $store.state.players"
        :key="player.id"
      >
        <p>{{ player.id }}</p>
        <p>{{ player.username }}</p>
        <p>isMdr: {{ player.isMDR }}</p>
        <p>isReady: {{ player.isReady }}</p>
        <p>connected: {{ player.connected }}</p>
        <p>score: {{ player.score }}</p>
        <div class="sep"></div>
        <p>Jokers</p>
        <p v-for="joker in player.jokers" :key="joker.name">
          {{ joker.name }} | {{ joker.available }} |
          <button
            @click="$store.dispatch('useJoker', joker.slug)"
            v-if="joker.available"
          >
            use
          </button>
        </p>
        <div class="sep"></div>
        <p>ChosenAnswer</p>
        <p>{{ player.chosenAnswer }}</p>
      </div>
    </div>
    <div class="sep"></div>
    <p>Livegame</p>
    <div class="split">
      <div class="left">
        <p>Current step {{ $store.state.livegame.currentStep }}</p>
        <p>Current minigame {{ $store.state.livegame.currentMiniGame }}</p>
        <p>Current round {{ $store.state.livegame.currentRound }}</p>
        <div class="sep"></div>
        Params chosen
        <p>
          Minigame number
          {{ $store.state.livegame.paramsChosen.minigameNumber }}
        </p>
        <p>Round number {{ $store.state.livegame.paramsChosen.roundNumber }}</p>
      </div>
      <div class="right" v-if="$store.state.livegame.minigame">
        <p>Minigame</p>
        <p>Name {{ $store.state.livegame.minigame.name }}</p>
        <p>Title {{ $store.state.livegame.minigame.title }}</p>
        <p>Answers {{ $store.state.livegame.minigame.answers }}</p>
        <p>ChosenAnswer {{ $store.state.livegame.minigame.chosenAnswer }}</p>
        <p>Description {{ $store.state.livegame.minigame.description }}</p>
        <p>GoodAnswer {{ $store.state.livegame.minigame.goodAnswer }}</p>
      </div>
    </div>
    <div class="sep"></div>
    <p>Settings:</p>
    <code> {{ $store.state.settings }} </code>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "node_modules/vuex/types";
import StoreState from "@/interfaces/StoreState";

export default class Debug extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;

  showDebug = false;

  mounted(): void {
    document.addEventListener("keypress", (e) => {
      if (e.code == "Numpad5" || e.key == "5") {
        this.showDebug = !this.showDebug;
      }
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.debug {
  width: 90%;
  background-color: white;
  position: absolute;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 400;
}
.playersList {
  display: flex;

  .playerCard {
    border: 1px solid black;
  }
}
.split {
  display: flex;
}
.left,
.right {
  width: 50%;
}
p {
  margin: 0;
}
.sep {
  display: block;
  width: 100%;
  height: 1px;
  background-color: black;
  margin: 5px 0;
}
.playersList {
}
</style>
