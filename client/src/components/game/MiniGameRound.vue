<template>
  <div class="minigameRound step">
    <!-- <p>Mini game round</p>
    <p>{{ $store.state.livegame.minigame.name }}</p>
    <ul class="answers">
      <li
        class="answer"
        v-for="(answer, index) in $store.state.livegame.minigame.answers"
        v-bind:key="answer"
        v-on:click="(e) => chooseAnswer(e, index)"
      >
        {{ answer }}
      </li>
    </ul> -->
    <div class="info-player">
      <PlayersList />
    </div>

    <div class="round" :class="{ inactive: /*!canAnswer*/ false }">
      <p>Timer {{ timer }}</p>

      <QuizGame
        v-if="
          $store.state.livegame.minigame.type == 'quiz' ||
          $store.state.livegame.minigame.type == 'lme'
        "
      />

      <MapGame v-if="$store.state.livegame.minigame.type == 'coc'" />

      <BonneFranquetteGame
        v-if="$store.state.livegame.minigame.type == 'lbf'"
      />

      <div
        class="blurred"
        v-if="$store.state.livegame.jokersParams.screenIsBlurred"
      ></div>
    </div>

    <div class="jokers">
      <p class="mes-jokers">Mes jokers</p>
      <button
        class="btn btn-joker"
        :class="{ active: $store.state.player.jokers.pjn.available }"
        @click="$store.dispatch('useJoker', 'pjn')"
      >
        <img src="/img/jokers/drink.svg" />
      </button>
      <button
        class="btn btn-joker"
        :class="{ active: $store.state.player.jokers.cdp.available }"
        @click="$store.dispatch('useJoker', 'cdp')"
      >
        <img src="/img/jokers/pouce.svg" />
      </button>
      <button class="btn btn-spam" @click="displaySticker">
        <img src="/img/jokers/buzzer.svg" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";
import QuizGame from "@/components/game/minigames/QuizGame.vue";
import MapGame from "@/components/game/minigames/MapGame.vue";
import BonneFranquetteGame from "@/components/game/minigames/BonneFranquetteGame.vue";

@Options({
  components: { QuizGame, MapGame, BonneFranquetteGame },
})
export default class MiniGameRound extends Vue {
  $store!: Store<StoreState>;

  selectedElmt!: HTMLElement;
  selectedIndex = null;
  interval: any;
  timer = 10;
  canAnswer = false;

  mounted(): void {
    this.$store.state.room?.state.listen(
      "currentTimer",
      (val: number, oldVal: number) => {
        this.timer = Math.round(val);
      }
    );
    this.$store.state.room?.state.listen(
      "playersCanAnswer",
      (val: boolean, oldVal: boolean) => {
        this.canAnswer = val;
      }
    );
  }

  unmounted(): void {
    clearInterval(this.interval);
  }

  chooseAnswer(e: any, index: number): void {
    e.target.classList.add("active");

    if (this.selectedElmt != undefined) {
      this.selectedElmt.classList.remove("active");
    }

    if (index != this.selectedIndex) {
      this.selectedElmt = e.target;

      this.$store.commit("updateLiveGame", {
        index: "minigame",
        value: {
          ...this.$store.state.livegame.minigame,
          chosenAnswer: { selectedNAnswer: index },
        },
      });

      this.$store.dispatch("readyForNext", {
        chosenAnswer: { selectedNAnswer: index },
      });
    }
  }

  displaySticker(): void {
    let stickersMaxNumber = 10;

    let index = Math.round(Math.random() * (stickersMaxNumber - 1)) + 1;

    let gap = 140 + 20;

    let x = Math.round(Math.random() * (window.innerWidth - gap - 20)) + 20;
    let y = Math.round(Math.random() * (window.innerHeight - gap - 20)) + 20;

    let datas = {
      index: index,
      x: x,
      y: y,
    };

    this.$store.state.room?.send("clientPacket", {
      type: "STICKER",
      datas: datas,
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.minigameRound {
  display: flex;
  .info-player {
    width: 200px;
    margin-right: 100px;
  }
  .round {
    width: calc(100% - 400px);
    position: relative;

    .blurred {
      position: absolute;
      width: calc(100% + 20px);
      height: calc(100% + 20px);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      backdrop-filter: blur(6px);
      pointer-events: none;
    }

    &.inactive {
      pointer-events: none;
    }
  }

  .jokers {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    width: 100px;

    font-family: $btnFont;

    .mes-jokers {
      margin-top: 0;
      font-size: $fontSsize;
    }

    .btn-joker {
      opacity: 0.5;
      pointer-events: none;

      &.active {
        opacity: 1;
      }
    }

    .btn-spam {
      margin-top: auto;
    }
  }
  .answer {
    &.active {
      color: green;
    }
  }
}
</style>
