<template>
  <div class="gameParameters step">
    <div class="gameParameters-content">
      <div class="players">
        <ArrowBtn @click="copyToClipboard" class="invite" :validate="linkCopied"
          >Inviter des <br />
          vacanciers<img
            class="annotation-1"
            src="/img/annotations/copie_lien.svg"
        /></ArrowBtn>
        <ul class="players-list">
          <li v-for="player in $store.state.players" v-bind:key="player.id">
            <StampS
              :people="player.avatarURL"
              :isMDR="player.isMDR"
              :isReady="player.isReady"
              >{{ player.username }}</StampS
            >
          </li>
          <li :key="n" v-for="n in 9 - $store.state.players.length">
            <StampS people="empty"></StampS>
          </li>
        </ul>
      </div>

      <div class="parameters">
        <img class="annotation-2" src="/img/annotations/mode_de_jeu.svg" />
        <div
          class="parameters-container"
          :class="{ canInteract: this.$store.state.player.isMDR }"
        >
          <PanneauBtn
            @click="changeSelectedMod(0)"
            :active="selectedMod == 0"
            title="Mode Autoroute"
            >Appuie sur le champignon ! Ce mode de jeu s’adresse aux touristes
            pressés...</PanneauBtn
          >
          <PanneauBtn
            @click="changeSelectedMod(1)"
            :active="selectedMod == 1"
            title="Mode Départementale"
            >Qui se presse n’arrive pas ! Ce mode de jeu permet d’explorer le
            paysage.</PanneauBtn
          >
          <PanneauBtn
            @click="changeSelectedMod(2)"
            :active="selectedMod == 2"
            title="Mode Détour"
            >Tous les chemins mènent à Rome ! Laissez-vous guider avec ce mode
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
  $store!: Store<StoreState>;

  gameSettings!: {
    minigameNumber: number;
    roundNumber: number;
  };

  linkCopied = false;

  selectedMod = 0;
  mods = [
    {
      minigame: 4,
      round: 3,
    },
    {
      minigame: 4,
      round: 1,
    },
    {
      minigame: 4,
      round: 5,
    },
  ];

  playerIsReady = false;

  created(): void {
    this.selectedMod = this.$store.state.livegame.chosenParams.gamemode;
    store.watch(
      () => this.$store.state.livegame.chosenParams,
      (val, oldVal) => {
        this.selectedMod = val.gamemode;
      }
    );
  }

  changeSelectedMod(i: number): void {
    if (this.$store.state.player.isMDR) {
      this.$store.state.sounds.cta.howl.play();

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
    this.$store.state.sounds.cta.howl.play();

    this.linkCopied = true;
    var dummy = document.createElement("textarea");

    document.body.appendChild(dummy);

    let name = this.$store.state.livegame.gameName
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    dummy.value = `${location.origin}/${this.$store.state.room?.id}&${name}`;
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
.annotation-1 {
  position: absolute;
  top: -68%;
  right: -60%;
}
.annotation-2 {
  position: absolute;
  right: 230px;
  top: 230px;
}
.gameParameters-content {
  display: flex;

  .parameters,
  .players {
    height: calc(100vh - (#{$steps-padding} * 2));
    background-color: rgba($color: #fff, $alpha: 0.75);

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
      transform: translateX(-24px) translateY(44px) scale(1.2);
      transform-origin: bottom left;
      pointer-events: none;

      &.canInteract {
        pointer-events: visible;
      }

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
    justify-content: space-between;
    list-style: none;
    padding: 0 70px;

    li {
      //margin-right: $steps-padding;
      margin-bottom: 30px;
      width: 30%;
      display: flex;
      justify-content: center;
    }
  }
}
.star {
  width: 160px;
  height: 160px;
}
</style>
