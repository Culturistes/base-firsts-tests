<template>
  <div class="gameParameters step">
    <p>GameParameters</p>
    <div
      class="parameters"
      v-if="!!$store.state.player && $store.state.player.isMDR"
    >
      <label>
        Nb Mini-jeu
        <input value="3" type="number" ref="inputNbMiniGame" onChange />
      </label>
      <label>
        Nb round par mini jeu (test)
        <input value="3" type="number" ref="inputNbRound" />
      </label>
    </div>

    <button v-on:click="playerReady">Are you ready ?</button>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class GameParameters extends Vue {
  $refs!: {
    inputNbMiniGame: HTMLInputElement;
    inputNbRound: HTMLInputElement;
  };
  $store!: Store<StoreState>;

  gameSettings!: {
    minigameNumber: number;
    roundNumber: number;
  };

  playerIsReady = false;

  playerReady(): void {
    this.playerIsReady = !this.playerIsReady;
    if (this.$store.state.player.isMDR) {
      let params = {
        minigameNumber: parseInt(this.$refs.inputNbMiniGame.value),
        roundNumber: parseInt(this.$refs.inputNbRound.value),
      };
      this.$store.state.room?.send("clientPacket", {
        type: "playerReadyToStart",
        datas: {
          isReady: this.playerIsReady,
          params: params,
        },
      });
    } else {
      this.$store.state.room?.send("clientPacket", {
        type: "playerReadyToStart",
        datas: { isReady: this.playerIsReady },
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
