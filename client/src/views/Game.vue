<template>
  <div
    class="game background"
    :class="{
      'background-color1':
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          $store.state.avatarUrl === 'bigouden') ||
        ($store.state.livegame.currentStep !== steps.TUTORIAL &&
          $store.state.livegame.minigame &&
          $store.state.livegame.minigame.type === 'lme'),
      'background-color2':
        $store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
        $store.state.avatarUrl === 'tropique',
      'background-color3':
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          $store.state.avatarUrl === 'fermier') ||
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          $store.state.avatarUrl === 'rando'),
      'background-color5':
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          $store.state.avatarUrl === 'skieuse') ||
        ($store.state.livegame.currentStep !== steps.TUTORIAL &&
          $store.state.livegame.minigame &&
          $store.state.livegame.minigame.type === 'quiz'),
      'background-color6':
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          $store.state.avatarUrl === 'surfeuse') ||
        ($store.state.livegame.currentStep !== steps.TUTORIAL &&
          $store.state.livegame.minigame &&
          $store.state.livegame.minigame.type === 'coc'),
      'background-color8':
        ($store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
          ($store.state.avatarUrl === 'garcon' ||
            $store.state.avatarUrl === 'camping')) ||
        ($store.state.livegame.currentStep !== steps.TUTORIAL &&
          $store.state.livegame.minigame &&
          $store.state.livegame.minigame.type === 'lbf'),
      'background-color9':
        $store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
        $store.state.avatarUrl === 'bayonnais',
      'background-color10':
        $store.state.livegame.currentStep === steps.JOIN_OR_CREATE &&
        $store.state.avatarUrl === 'touriste',
      'background-color7':
        $store.state.livegame.currentStep === steps.GAME_PARAMETERS ||
        $store.state.livegame.currentStep === steps.MINI_GAME_RESULT ||
        $store.state.livegame.currentStep === steps.TUTORIAL,
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

    <div class="stickers-container">
      <img
        class="sticker"
        v-for="(sticker, index) in stickers"
        :key="index"
        :src="sticker.url"
        :style="{ left: sticker.left, top: sticker.top }"
      />
    </div>

    <div class="steps">
      <!-- Choix pseudo + Rejoindre ou créer une partie -->
      <JoinOrCreate
        :code="roomCode"
        v-if="steps.JOIN_OR_CREATE == $store.state.livegame.currentStep"
      />

      <!-- Ecran choix perso + paramètrage par le MDR + bouton "pret" -->
      <GameParameters
        v-if="steps.GAME_PARAMETERS == $store.state.livegame.currentStep"
      />

      <Tutorial v-if="steps.TUTORIAL == $store.state.livegame.currentStep" />

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
import Tutorial from "@/components/game/Tutorial.vue";
import MiniGameTitle from "@/components/game/MiniGameTitle.vue";
import MiniGameRoundTitle from "@/components/game/MiniGameRoundTitle.vue";
import MiniGameRound from "@/components/game/MiniGameRound.vue";
import MiniGameRoundResult from "@/components/game/MiniGameRoundResult.vue";
import MiniGameResult from "@/components/game/MiniGameResult.vue";
import GameResult from "@/components/game/GameResult.vue";
import axios from "axios";

export enum STEPS {
  JOIN_OR_CREATE,
  GAME_PARAMETERS,
  TUTORIAL,
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
    Tutorial,
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

  stickers: any = {};
  stickerIndex = 0;

  $store!: Store<StoreState>;

  //FOR PRELOAD IMG
  img: any = null;
  numberLoaded = 0;
  async created(): Promise<void> {
    //PRELOAD IMG
    this.img = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
    ];

    this.img[0].src = "/img/animations/camping.png";
    this.img[1].src = "/img/animations/fermier.png";
    this.img[2].src = "/img/animations/garcon.png";
    this.img[3].src = "/img/animations/skieuse.png";
    this.img[4].src = "/img/animations/surfeuse.png";
    this.img[5].src = "/img/animations/touriste.png";
    this.img[6].src = "/img/animations/bigouden.png";
    this.img[7].src = "/img/animations/rando.png";
    this.img[8].src = "/img/animations/bayonnais.png";

    this.img.forEach((el: any) => {
      el.onload = () => {
        this.numberLoaded++;

        if (this.numberLoaded >= 9) {
          this.$store.commit("updateLoading", false);
        }
      };
    });
    //END PRELOAD IMG

    this.$store.commit("updateLiveGame", {
      index: "currentStep",
      value: this.steps.JOIN_OR_CREATE,
    });

    let settingsItem = localStorage.getItem("settings");

    //this.$store.state.sounds.ambiance.howl.play(); // TODO IMPORTANT REACTIVE POUR PROD (commenté pour les tests sinon moi cogner pc)

    this.$store.state.room?.state.listen(
      "currentStep",
      (val: boolean, oldVal: boolean) => {
        this.$store.commit("updateLiveGame", {
          index: "jokersParams",
          value: {
            showOthersChoice: false,
            othersCursor: [],
            showMapRange: false,
            highlightItems: false,
            screenIsBlurred: false,
          },
        });
      }
    );

    if (settingsItem) {
      let settings = JSON.parse(settingsItem);
      this.$store.commit("updateSettings", {
        index: "streamerMode",
        value: settings.streamerMode,
      });
    }

    try {
      console.log(`Connecting to: ws://${process.env.VUE_APP_SERVER_URL}`);

      await axios.get(`http://${process.env.VUE_APP_SERVER_URL}/matchmake`);

      let client = await new Client(`ws://${process.env.VUE_APP_SERVER_URL}`);
      this.$store.commit("updateClient", client);

      store.watch(
        () => this.$store.state.isLoading,
        (val, oldVal) => {
          this.$store.commit("updateLoading", val);
        }
      );

      store.watch(
        () => this.$store.state.room,
        (room, oldVal) => {
          if (room !== null) {
            // Final global listener
            this.listenToServer(room, "serverPacket");

            if (oldVal == null) {
              setTimeout(() => {
                this.$store.commit("updateLoading", false);
                this.$store.commit("updateLiveGame", {
                  index: "currentStep",
                  value: STEPS.GAME_PARAMETERS,
                });
              }, 1000);
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
        case "gameName":
          this.$store.commit("updateLiveGame", {
            index: "gameName",
            value: datas,
          });
          break;
        case "playerInfos":
          this.$store.commit("updatePlayer", datas);
          newDatas = {
            infos: datas,
            roomId: room.id,
            expiration: new Date().getTime() + 120 * 1000,
          };
          // Instantiate all listener when server send back players infos ? > test for optimization/perfs

          // TODO: work on the 2min reconnect without localStorage
          localStorage.setItem(`player_params`, JSON.stringify(newDatas));
          localStorage.setItem(`username`, datas.username);
          break;
        case "playersList":
          this.$store.commit("updatePlayers", datas);
          var myinfos = datas.find(
            (player: any) => player.id == this.$store.state.player.id
          );
          console.log(myinfos);
          this.$store.commit("updatePlayer", myinfos);
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
              goodAnswer: datas.content.goodAnswer,
            },
          });
          break;
        case "chosenParams":
          this.$store.commit("updateLiveGame", {
            index: "chosenParams",
            value: datas,
          });
          console.log(datas);
          break;
        case "canGoNext":
          if (datas) {
            this.$store.commit("updateLoading", false);
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
          this.$store.commit("updateLoading", datas);
          break;
        case "goodAnswer":
          this.$store.commit("updateMinigame", {
            index: "goodAnswer",
            value: datas,
          });
          break;
        case "toggleTimer":
          this.$store.commit("updateLiveGame", {
            index: "timerIsRunning",
            value: datas,
          });
          break;
        case "STICKER":
          this.createSticker(datas);
          break;
        case "jokerUsed":
          switch (datas.type) {
            case "cdp":
              switch (this.$store.state.livegame.minigame.type) {
                case "quiz":
                  // Remove 2 bad answers
                  var answers = this.$store.state.livegame.minigame.answers;
                  var newAnswers = [
                    answers.find((ans: string) => ans.slice(0, 1) == "$"),
                    answers.find((ans: string) => ans.slice(0, 1) != "$"),
                  ];
                  this.$store.commit("updateMinigame", {
                    index: "answers",
                    value: newAnswers,
                  });
                  break;
                case "lme":
                  // Voir les jauges des choix
                  this.$store.commit("updateJokersParams", {
                    index: "showOthersChoice",
                    value: true,
                  });
                  break;
                case "coc":
                  // Créer une zone en lumière sur le carte
                  this.$store.commit("updateJokersParams", {
                    index: "showMapRange",
                    value: true,
                  });
                  break;
                case "lbf":
                  // Do smth
                  this.$store.commit("updateJokersParams", {
                    index: "highlightItems",
                    value: true,
                  });
                  break;
              }
              break;
            case "pjn":
              if (this.$store.state.player.id != datas.attacker) {
                // Don't affect the attacker :D
                console.log("your screen must be blurred");
                this.$store.commit("updateJokersParams", {
                  index: "screenIsBlurred",
                  value: true,
                });
              }
              break;
          }
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

  createSticker({
    index,
    x,
    y,
  }: {
    index: number;
    x: number;
    y: number;
  }): void {
    if (Object.keys(this.stickers).length >= 15) {
      delete this.stickers[Object.keys(this.stickers)[0]];
    }

    let id = this.stickerIndex;
    console.log("creating sticker:", id);
    let timeout = setTimeout(() => {
      //let idx = this.stickers.findIndex((sticker) => sticker.id == id);
      //this.stickers.splice(idx, 1);
      delete this.stickers[id.toString()];
    }, 5000);

    let sticker = {
      url: `/img/stickers/${index}.png`,
      left: `${x}px`,
      top: `${y}px`,
      timeout: timeout,
    };

    this.stickers[id] = sticker;
    this.stickerIndex++;
  }

  registerSound(): void {
    //
  }

  unmounted(): void {
    Object.keys(this.stickers).forEach((key) => {
      clearTimeout(this.stickers[key].timeout);
      delete this.stickers[key];
    });
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

  .stickers-container {
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;

    .sticker {
      position: absolute;
      top: 0;
      left: 0;
      animation: disappear 5s forwards running;
    }

    @keyframes disappear {
      0% {
        opacity: 1;
      }
      94% {
        opacity: 1;
      }
      99% {
        opacity: 0;
      }
      100% {
        opacity: 0;
      }
    }
  }

  .step {
    position: relative;
    z-index: 10;
    &.active {
      color: green;
    }
  }
}
</style>
