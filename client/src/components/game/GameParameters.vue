<template>
  <div class="gameParameters step">
    <div class="gameParameters-content">
      <div class="players">
        <StepTitle color="black"
          >ROOM DE {{ $store.state.livegame.gameName }} | Code :
          {{ $store.state.room?.id }}</StepTitle
        >
        <ul class="players-list">
          <li v-for="player in $store.state.players" v-bind:key="player.id">
            <StampS>{{ player.username }}</StampS>
          </li>
        </ul>
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
      </div>

      <div class="parameters">
        <div class="parameters-container">
          <PanneauBtn :active="true" title="Mode Autoroute"
            >Appuie sur le champignon ! Ce mode de jeu s’adresse aux touristes
            pressés.</PanneauBtn
          >
          <PanneauBtn title="Mode Autoroute"
            >Appuie sur le champignon ! Ce mode de jeu s’adresse aux touristes
            pressés.</PanneauBtn
          >
          <PanneauBtn title="Mode Autoroute"
            >Appuie sur le champignon ! Ce mode de jeu s’adresse aux touristes
            pressés.</PanneauBtn
          >
          <StarBtn v-on:click="playerReady">En voiture<br />Simone !</StarBtn>
        </div>
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

  .parameters,
  .players {
    height: calc(100vh - (#{$steps-padding} * 2));
    background-color: white;

    border-radius: 15px;
    padding: 32px;
  }

  .players {
    width: 50%;
    margin-right: calc(#{$steps-padding} / 2);
  }

  .parameters {
    width: 50%;
    margin-left: calc(#{$steps-padding} / 2);

    .waiting {
      margin-top: 0;
      text-align: left;
    }

    .parameters-container {
      width: 30vw;
      height: 37vw;
      background-image: url("/img/divers/planche.png");
      background-size: 100% 100%;

      .panneau-btn {
        width: 75%;
        margin-left: 26%;
      }
    }
  }

  .inline-input {
    display: flex;

    span {
      width: 70%;
    }
  }

  .players-list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;

    li {
      margin-right: $steps-padding;
      margin-bottom: 20px;
    }
  }
}
</style>
