<template>
  <div
    class="game background"
    :class="{
      'background-color1':
        $store.state.livegame.currentStep === steps.JOIN_OR_CREATE,
      'background-color2':
        $store.state.livegame.minigame &&
        $store.state.livegame.minigame.type === 'coc',
      'background-color3':
        $store.state.livegame.minigame &&
        $store.state.livegame.minigame.type === 'lme',
      'background-color4':
        $store.state.livegame.currentStep === steps.GAME_PARAMETERS,
      'background-color5':
        $store.state.livegame.minigame &&
        $store.state.livegame.minigame.type === 'quiz',
    }"
  >
    <!-- Début de partie -->
    <!-- <div class="game_infos">
      <p>Game page</p>
      <p>
        Step: {{ steps[$store.state.livegame.currentStep] }} | Round:
        {{ $store.state.livegame.currentRound }} /
        {{ $store.state.livegame.roundNumber }} | Mini game:
        {{ $store.state.livegame.currentMiniGame }} /
        {{ $store.state.livegame.minigameNumber }}
      </p>
      <p v-if="!!$store.state.player && $store.state.player.isMDR">Tu es MDR</p>

      <button
        v-if="$store.state.livegame.currentStep === steps.GAME_PARAMETERS"
        v-on:click="copyCode"
      >
        Copier le code
      </button>

      <div class="logs">
        <p v-for="notif in notifications" v-bind:key="notif">{{ notif }}</p>
      </div>

      <ul class="playersList">
        <p>Joueurs connecté</p>
        <li
          class="playerName"
          v-bind:class="{ active: player.isReady }"
          v-for="player in $store.state.players"
          v-bind:key="player.id"
        >
          <span>{{ player.username }}</span>
          <span>{{ player.score }}</span>
          <span class="readyCircle">
            <span class="readyCircle_inner"></span>
          </span>
        </li>
      </ul>

      <label htmlFor="streamMode"
        >Stream mode
        <input
          id="streamMode"
          type="checkbox"
          v-on:change="
            () => {
              $store.commit('updateSettings', {
                index: 'streamerMode',
                value: !$store.state.settings.streamerMode,
              });
            }
          "
      /></label>
    </div> -->

    <div class="steps">
      <!-- Choix pseudo + Rejoindre ou créer une partie -->
      <JoinOrCreate
        v-if="steps.JOIN_OR_CREATE == $store.state.livegame.currentStep"
      />

      <!-- Ecran choix perso + paramètrage par le MDR + bouton "pret" -->
      <GameParameters
        v-if="steps.GAME_PARAMETERS == $store.state.livegame.currentStep"
      />

      <!-- En jeu -->

      <!-- Ecran titre de mini jeu -->
      <MiniGameTitle
        v-if="steps.MINI_GAME_TITLE == $store.state.livegame.currentStep"
      />

      <!-- Ecran titre de round -->
      <!-- <MiniGameRoundTitle
        v-if="steps.MINI_GAME_ROUND_TITLE == $store.state.livegame.currentStep"
      /> -->

      <!-- Mini Game Round -->
      <MiniGameRound
        v-if="
          steps.MINI_GAME_ROUND == $store.state.livegame.currentStep ||
          steps.MINI_GAME_ROUND_RESULT == $store.state.livegame.currentStep
        "
      />

      <!-- Résultat round -->
      <!-- <MiniGameRoundResult
        v-if="steps.MINI_GAME_ROUND_RESULT == $store.state.livegame.currentStep"
      /> -->

      <!-- Résultat mini-jeu -->
      <MiniGameResult
        v-if="steps.MINI_GAME_RESULT == $store.state.livegame.currentStep"
      />

      <!-- Résultat du jeu -->
      <GameResult
        v-if="steps.GAME_RESULT == $store.state.livegame.currentStep"
      />
    </div>

    <div class="loader" v-if="isLoading">
      <span>Loading... Wait please :)</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Client, Room } from "colyseus.js";
import { Store } from "vuex";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import JoinOrCreate from "@/components/game/JoinOrCreate.vue";
import GameParameters from "@/components/game/GameParameters.vue";
import MiniGameTitle from "@/components/game/MiniGameTitle.vue";
import MiniGameRoundTitle from "@/components/game/MiniGameRoundTitle.vue";
import MiniGameRound from "@/components/game/MiniGameRound.vue";
import MiniGameRoundResult from "@/components/game/MiniGameRoundResult.vue";
import MiniGameResult from "@/components/game/MiniGameResult.vue";
import GameResult from "@/components/game/GameResult.vue";

export enum STEPS {
  JOIN_OR_CREATE,
  GAME_PARAMETERS,
  MINI_GAME_TITLE,
  MINI_GAME_ROUND,
  MINI_GAME_ROUND_RESULT,
  MINI_GAME_RESULT,
  GAME_RESULT,
}

@Options({
  components: {
    JoinOrCreate,
    GameParameters,
    MiniGameTitle,
    MiniGameRoundTitle,
    MiniGameRound,
    MiniGameRoundResult,
    MiniGameResult,
    GameResult,
  },
})
export default class Game extends Vue {
  player: {
    id: string;
    username: string;
    isMDR: boolean;
    score: number;
  } | null = null;
  notifications: Array<string> = [];
  streamerMode = false;
  steps = STEPS;
  isLoading = false;

  $store!: Store<StoreState>;

  async created(): Promise<void> {
    this.$store.commit("updateLiveGame", {
      index: "currentStep",
      value: this.steps.JOIN_OR_CREATE,
    });

    let settingsItem = localStorage.getItem("settings");

    if (settingsItem) {
      let settings = JSON.parse(settingsItem);
      this.$store.commit("updateSettings", {
        index: "streamerMode",
        value: settings.streamerMode,
      });
    }

    try {
      console.log(process.env.VUE_APP_SERVER_URL);
      let client = await new Client(process.env.VUE_APP_SERVER_URL);
      this.$store.commit("updateClient", client);
      store.watch(
        () => this.$store.state.room,
        (room, oldVal) => {
          if (room !== null) {
            // Final global listener
            this.listenToServer(room, "serverPacket");

            if (oldVal == null) {
              this.$store.commit("updateLiveGame", {
                index: "currentStep",
                value: STEPS.GAME_PARAMETERS,
              });
            }
          }
        }
      );

      console.log("Client initialized");
    } catch (e) {
      console.log("Client couldn't be initialized:", e);
    }
  }

  listenToServer(room: Room, type: string): void {
    room.onMessage(type, async (packet: any) => {
      let { type, datas } = packet;

      let newDatas = null;

      console.log(`Received packet from server (${type})`);

      switch (type) {
        case "playerInfos":
          this.$store.commit("updatePlayer", datas);
          newDatas = {
            infos: datas,
            roomId: room.id,
            expiration: new Date().getTime() + 120 * 1000,
          };
          // TODO: work on the 2min reconnect without localStorage
          localStorage.setItem(`player_params`, JSON.stringify(newDatas));
          localStorage.setItem(`username`, datas.username);
          break;
        case "playersList":
          this.$store.commit("updatePlayers", datas);
          break;
        case "minigame":
          this.$store.commit("updateLiveGame", {
            index: "minigame",
            value: {
              type: datas.type,
              title:
                datas.type == "coc" ? datas.content.name : datas.content.title,
              answers: datas.content.answers,
              description: datas.content.description,
              latLong:
                datas.content.latitude && datas.content.longitude
                  ? [datas.content.latitude, datas.content.longitude]
                  : [],
              gentileM: datas.content.gentileM ? datas.content.gentileM : "",
              gentileF: datas.content.gentileF ? datas.content.gentileF : "",
              goodAnswers: datas.content.goodAnswer,
            },
          });
          break;
        case "chosenParams":
          this.$store.commit("updateLiveGame", {
            index: "chosenParams",
            value: datas,
          });
          break;
        case "canGoNext":
          if (datas) {
            this.isLoading = false;
            this.$store.dispatch("goNextStep");
          }
          break;
        case "goOnStep":
          this.$store.commit("updateLiveGame", {
            index: "currentStep",
            value: datas.step,
          });

          if (datas.minigame) {
            this.$store.commit("updateLiveGame", {
              index: "currentMiniGame",
              value: datas.minigame,
            });
          }
          if (datas.round) {
            this.$store.commit("updateLiveGame", {
              index: "currentRound",
              value: datas.round,
            });
          }
          this.$store.commit("setPlayerIsReady", false);
          break;
        case "loading":
          this.isLoading = true;
          break;
        case "goodAnswer":
          console.log("goodAnswer", datas);
          this.$store.commit("updateMinigame", {
            index: "goodAnswer",
            value: datas,
          });
          break;
      }
    });
  }

  copyCode(): void {
    if (this.$store.state.room) {
      const el = document.createElement("textarea");
      el.value = this.$store.state.room.id;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  .playersList {
    text-align: left;
    position: absolute;
    left: 20px;
    top: 20px;
    border: 1px solid black;
    padding: 10px;
    background-color: white;

    .playerName {
      background-color: white;
      border: 1px solid black;
      padding: 5px;
      list-style-type: none;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .readyCircle {
        width: 20px;
        height: 20px;
        border: 1px solid black;
        border-radius: 50%;
        position: relative;

        .readyCircle_inner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      &.active {
        .readyCircle_inner {
          background-color: green;
        }
      }
    }
  }

  .step {
    &.active {
      color: green;
    }
  }

  .loader {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
