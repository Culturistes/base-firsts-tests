<template>
  <div class="gameParameters step">
    <div class="gameParameters-content">
      <div class="parameters">
        <StepTitle color="black">ROOM DE {{ $store.state.room?.id }}</StepTitle>
        <label
          class="inline-input"
          v-if="$store.state.player && $store.state.player.isMDR"
        >
          <span>Nombre de mini-jeu</span>
          <TextInput
            color="black"
            value="3"
            type="number"
            v-model="inputNbMiniGame"
            :disabled="$store.state.player && !$store.state.player.isMDR"
            >Entrez un nombre</TextInput
          >
        </label>
        <label
          class="inline-input"
          v-if="$store.state.player && $store.state.player.isMDR"
        >
          <span>Nombre de questions par mini-jeu</span>
          <TextInput
            color="black"
            value="1"
            type="number"
            v-model="inputNbRound"
            :disabled="$store.state.player && !$store.state.player.isMDR"
            >Entrez un nombre</TextInput
          >
        </label>
        <ArrowBtn v-on:click="playerReady">Prêt ?</ArrowBtn>
      </div>

      <div class="players">
        <p class="waiting">En attente des joueurs...</p>
        <PlayersList />
      </div>
    </div>
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
  inputNbMiniGame = "3";
  inputNbRound = "1";

  playerReady(): void {
    this.playerIsReady = !this.playerIsReady;
    if (this.$store.state.player.isMDR) {
      let params = {
        minigameNumber: parseInt(this.inputNbMiniGame),
        roundNumber: parseInt(this.inputNbRound),
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
<style lang="scss">
.gameParameters-content {
  display: flex;

  .parameters {
    width: 60%;
  }

  .players {
    width: 40%;

    .waiting {
      margin-top: 0;
      text-align: left;
    }
  }

  .inline-input {
    display: flex;

    span {
      width: 70%;
    }
  }

  .playersList {
    list-style: none;
    padding: 0;
  }
}
</style>
