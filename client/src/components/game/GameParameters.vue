<template>
  <div class="gameParameters step">
    <div class="gameParameters-content">
      <div class="players">
        <ArrowBtn @click="copyToClipboard" class="invite" :validate="linkCopied"
          >Inviter des vacanciers</ArrowBtn
        >
        <ul class="players-list">
          <li v-for="player in $store.state.players" v-bind:key="player.id">
            <StampS
              :people="player.avatarURL"
              :isMDR="player.isMDR"
              :isReady="player.isReady"
              >{{ player.username }}</StampS
            >
          </li>
          <li :key="n" v-for="n in 10 - $store.state.players.length">
            <StampS people="empty"></StampS>
          </li>
        </ul>
      </div>

      <div class="parameters">
        <div class="parameters-container">
          <PanneauBtn
            @click="changeSelectedMod(0)"
            :active="selectedMod == 0"
            title="Mode Autoroute"
            >Appuie sur le champignon ! Ce mode de jeu s’adresse aux touristes
            pressés..</PanneauBtn
          >
          <PanneauBtn
            @click="changeSelectedMod(1)"
            :active="selectedMod == 1"
            title="Mode Départemental"
            >Qui se presse n’arrive pas ! Ce mode de jeu permet d’explorer le
            paysage.</PanneauBtn
          >
          <PanneauBtn
            @click="changeSelectedMod(2)"
            :active="selectedMod == 2"
            title="Mode Détour"
            >Tous les chemins mènent à Rome ! Laissez vous guider avec ce mode
            de jeu mystèrieux.</PanneauBtn
          >
        </div>
        <div class="btn-container">
          <StarBtn
            :big="true"
            :valid="$store.state.player?.isReady"
            v-on:click="playerReady"
            >En voiture<br />Simone !</StarBtn
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "vuex/types";
import store from "@/store";
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

  linkCopied = false;

  selectedMod = 0;
  mods = [
    {
      minigame: 3,
      round: 1,
    },
    {
      minigame: 3,
      round: 2,
    },
    {
      minigame: 3,
      round: 5,
    },
  ];

  playerIsReady = false;
  inputNbMiniGame = "3";
  inputNbRound = "1";

  mounted(): void {
    store.watch(
      () => this.$store.state.livegame.chosenParams,
      (val, oldVal) => {
        this.selectedMod = val.gamemode;
      }
    );
  }

  changeSelectedMod(i: number): void {
    if (this.$store.state.player.isMDR) {
      this.selectedMod = i;

      let params = {
        minigameNumber: this.mods[this.selectedMod].minigame,
        roundNumber: this.mods[this.selectedMod].round,
        gamemode: i,
      };
      this.$store.state.room?.send("clientPacket", {
        type: "gameMode",
        datas: {
          params: params,
        },
      });
    }
  }

  copyToClipboard() {
    this.linkCopied = true;
    var dummy = document.createElement("textarea");

    document.body.appendChild(dummy);

    dummy.value = `${location.origin}/${this.$store.state.room?.id}&${this.$store.state.livegame.gameName}`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    setTimeout(() => {
      this.linkCopied = false;
    }, 2000);
  }

  playerReady(): void {
    if (!this.playerIsReady) {
      this.$store.state.sounds["lechage_timbre"].howl.play();
    }

    this.playerIsReady = !this.playerIsReady;
    if (this.$store.state.player.isMDR) {
      this.$store.state.room?.send("clientPacket", {
        type: "playerReadyToStart",
        datas: {
          isReady: this.playerIsReady,
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

  .invite {
    display: block;
  }

  #room-code {
    display: hidden;
  }

  .parameters {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 50%;
    margin-left: calc(#{$steps-padding} / 2);

    .waiting {
      margin-top: 0;
      text-align: left;
    }

    .parameters-container {
      width: 391px;
      min-width: 391px;
      height: 518px;
      background-image: url("/img/divers/planche.png");
      background-size: 100% 100%;
      transform: translateX(-24px) translateY(44px);

      .panneau-btn {
        width: 315px;
        height: 104px;
        margin-left: 26%;

        &:first-child {
          margin-top: 47px;
        }
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
.star {
  width: 160px;
  height: 160px;
}
</style>
