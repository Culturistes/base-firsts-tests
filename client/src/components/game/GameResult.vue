<template>
  <div class="gameResult step">
    <video class="confettis" autoplay>
      <source src="/img/divers/confettis.mp4" />
    </video>
    <img src="/img/titles/final.svg" />
    <div class="split">
      <div class="podium-container">
        <div class="podium">
          <img
            :src="'/img/players/' + $store.state.players[0].avatarURL + '.svg'"
            class="img-classement classement-1"
          />
          <img
            v-if="$store.state.players[1]"
            :src="'/img/players/' + $store.state.players[1].avatarURL + '.svg'"
            class="img-classement classement-2"
          />
          <img
            v-if="$store.state.players[2]"
            :src="'/img/players/' + $store.state.players[2].avatarURL + '.svg'"
            class="img-classement classement-3"
          />
          <div class="classement classement-1">
            <img src="/img/chiffres/chiffres_01.svg" />
            <p class="name">{{ $store.state.players[0].username }}</p>
            <p class="score">{{ $store.state.players[0].score }} km</p>
          </div>
          <div v-if="$store.state.players[1]" class="classement classement-2">
            <img src="/img/chiffres/chiffres_02.svg" />
            <p class="name">{{ $store.state.players[1].username }}</p>
            <p class="score">{{ $store.state.players[1].score }} km</p>
          </div>
          <div v-if="$store.state.players[2]" class="classement classement-3">
            <img src="/img/chiffres/chiffres_03.svg" />
            <p class="name">{{ $store.state.players[2].username }}</p>
            <p class="score">{{ $store.state.players[2].score }} km</p>
          </div>
        </div>
      </div>
      <div class="other-ranks-container">
        <div class="rank" :key="i" v-for="(player, i) in lastPlayers">
          <img :src="'/img/chiffres/chiffres_0' + (i + 4) + '.svg'" />
          <img
            class="stamp-img"
            :src="'/img/stamps/' + player.avatarURL + '-s.svg'"
          />
          <div>
            <p class="name">{{ player.username }}</p>
            <p class="score">{{ player.score }} km</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "node_modules/vuex/types";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class GameResult extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;

  get lastPlayers() {
    let array = [];

    for (let i = 3; i < this.$store.state.players.length; i++) {
      array.push(this.$store.state.players[i]);
    }

    return array;
  }

  mounted(): void {
    this.$store.state.sounds.podium.howl.play();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.confettis {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
.split {
  display: flex;

  .podium-container {
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(100%);

    flex: 1 1;

    .podium {
      height: 211px;
      width: 486px;
      background-image: url("/img/divers/podium.svg");
      position: relative;

      .img-classement {
        position: absolute;

        width: 185px;

        &.classement-1 {
          top: -115%;
          left: 31%;
        }

        &.classement-2 {
          left: 0%;
          top: -98%;
        }

        &.classement-3 {
          top: -88%;
          right: 1%;
        }
      }

      .classement {
        position: absolute;
        color: white;

        font-size: 1.8rem;
        font-family: $btnFont;

        width: 77px;

        .name {
          margin: 0;
          margin-top: 5px;
        }

        .score {
          font-weight: normal;
          margin-top: 5px;
        }

        &.classement-1 {
          top: 30%;
          left: 42%;
        }

        &.classement-2 {
          top: 44%;
          left: 9.5%;
        }

        &.classement-3 {
          top: 47%;
          right: 10%;
        }
      }
    }
  }

  .other-ranks-container {
    flex: 1 1;
    .rank {
      display: flex;
      align-items: center;

      font-family: $btnFont;
      font-size: 1.8rem;
      text-align: left;

      .name {
        margin: 0;
      }

      .score {
        font-weight: normal;

        margin: 0;
        margin-top: 5px;
      }

      .stamp-img {
        margin-right: 10px;
      }
    }
  }
}
</style>
