<template>
  <div class="game">
    <!-- Début de partie -->
    <div class="game_infos">
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
          v-for="player in players"
          v-bind:key="player.id"
        >
          <span>{{ player.username }}</span>
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
                index: 'modeStreamer',
                value: !$store.state.settings.modeStreamer,
              });
            }
          "
      /></label>
    </div>

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
      <MiniGameRoundTitle
        v-if="steps.MINI_GAME_ROUND_TITLE == $store.state.livegame.currentStep"
      />

      <!-- Mini Game Round -->
      <MiniGameRound
        v-if="steps.MINI_GAME_ROUND == $store.state.livegame.currentStep"
      />

      <!-- Résultat round -->
      <MiniGameRoundResult
        v-if="steps.MINI_GAME_ROUND_RESULT == $store.state.livegame.currentStep"
      />

      <!-- Résultat mini-jeu -->
      <MiniGameResult
        v-if="steps.MINI_GAME_RESULT == $store.state.livegame.currentStep"
      />

      <!-- Résultat du jeu -->
      <GameResult
        v-if="steps.GAME_RESULT == $store.state.livegame.currentStep"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Client } from "colyseus.js";
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
  MINI_GAME_ROUND_TITLE,
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
  players: Array<{ id: string; username: string; score: number }> = [];

  streamerMode = false;

  steps = STEPS;

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
        index: "modeStreamer",
        value: settings.modeStreamer,
      });
    }

    try {
      let client = await new Client("ws://localhost:2567");
      this.$store.commit("updateClient", client);
      store.watch(
        () => this.$store.state.room,
        (room, oldVal) => {
          if (room !== null) {
            //For testing
            this.listenToServer(room, "messages");
            this.listenToServer(room, "user_notifs");

            // Used
            this.listenToServer(room, "game_state");
            this.listenToServer(room, "players_list");
            this.listenToServer(room, "your_infos");
            this.listenToServer(room, "livegame");

            if (oldVal == null) {
              this.$store.commit("updateLiveGame", {
                index: "currentStep",
                value: STEPS.GAME_PARAMETERS,
              });
            }
          }
        }
      );

      //DEBUG ONLY
      store.watch(
        () => this.$store.state.livegame.currentStep,
        (newStep, oldStep) => {
          let container = document.querySelector(".steps");
          if (container) {
            let items = container.children;
            let item = items.item(this.$store.state.livegame.currentStep);
            container.querySelectorAll(".step")?.forEach((item) => {
              item.classList.remove("active");
            });
            item?.classList.add("active");
          }
        }
      );
      console.log("Client initialized");
    } catch (e) {
      console.log("Client couldn't be initialized:", e);
    }
  }

  listenToServer(room: any, type: string): void {
    room.onMessage(type, async (data: any) => {
      if (type == "messages") {
        console.log(`Received message (${type}):`, data);
      }
      if (type == "user_notifs") {
        this.notifications.push(data);
      }
      if (type == "players_list") {
        this.players = data;
      }
      if (type == "your_infos") {
        this.$store.commit("updatePlayer", data);
        let datas = {
          data: data,
          roomId: room.id,
          expiration: new Date().getTime() + 120 * 1000,
        };
        localStorage.setItem(`player_infos`, JSON.stringify(datas));
        localStorage.setItem(`username`, data.username);
      }
      if (type == "game_state") {
        if (data.type == "all_ready" && data.content == true) {
          this.$store.dispatch("goNextStep");
          let player = this.$store.state.player;
          player.isReady = false;
          this.$store.commit("updatePlayer", player);
        }
        if (data.type == "goOnStep") {
          this.$store.commit("updateLiveGame", {
            index: "currentStep",
            value: data.content.step,
          });
          if (data.content.minigame) {
            this.$store.commit("updateLiveGame", {
              index: "currentMiniGame",
              value: data.content.minigame,
            });
          }
          if (data.content.round) {
            this.$store.commit("updateLiveGame", {
              index: "currentRound",
              value: data.content.round,
            });
          }
          let player = this.$store.state.player;
          player.isReady = false;
          this.$store.commit("updatePlayer", player);
        }

        if (data.type == "params") {
          this.$store.commit("updateLiveGame", {
            index: "minigameNumber",
            value: data.content.minigameNumber,
          });
          this.$store.commit("updateLiveGame", {
            index: "roundNumber",
            value: data.content.roundNumber,
          });
        }
      }
      if (type == "livegame") {
        console.log(data.content.datas[0]);
        let content = data.content.datas[0];
        this.$store.commit("updateLiveGame", {
          index: "minigame",
          value: {
            name: data.content.type,
            question: content.title,
            answers: content.answers,
            goodAnswer: 0,
            desc: content.desc,
          },
        });
      }
    });
  }

  sendToServer(type: string, message: any): void {
    if (this.$store.state.room != null) {
      this.$store.state.room.send(type, message);
    }
  }

  copyCode(): void {
    console.log(this.$store.state.room.id);
    const el = document.createElement("textarea");
    el.value = this.$store.state.room.id;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}
</script>

<style scoped lang="scss">
.game {
  width: 100%;
  height: 100%;

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
    border-top: 1px solid black;
    padding-top: 20px;
    &.active {
      color: green;
    }
  }
}
</style>
