import StoreState from "@/interfaces/StoreState";
import { createStore } from "vuex";
<<<<<<< HEAD
=======
import { Client, Room } from "colyseus.js";
>>>>>>> develop

export default createStore({
  state: {
    client: null,
    room: null,
<<<<<<< HEAD
    settings: {
      modeStreamer: false,
    },
  },
  mutations: {
    updateClient(state: StoreState, value: string) {
      state.client = value;
    },
    updateRoom(state: StoreState, value: string) {
      state.room = value;
    },
  },
  actions: {},
=======
    player: null,
    livegame: {
      currentStep: 0,
      currentMiniGame: 1,
      currentRound: 1,
      paramsChosen: {
        minigameNumber: 1,
        roundNumber: 1,
      },
      miniGame: {
        name: "",
        question: "",
        answers: [],
        chosenAnswer: null,
        desc: "",
      },
    },
    settings: {
      streamerMode: false,
    },
  },
  mutations: {
    updateClient(state: StoreState, value: Client): void {
      state.client = value;
    },
    updateRoom(state: StoreState, value: Room): void {
      state.room = value;
    },
    updatePlayer(state: StoreState, value: string): void {
      state.player = value;
    },
    setPlayerIsReady(state: StoreState, value: boolean): void {
      state.player.isReady = value;
    },
    updateLiveGame(
      state: StoreState,
      data: { index: string; value: any }
    ): void {
      state.livegame[data.index] = data.value;
    },
    updateSettings(
      state: StoreState,
      data: { index: string; value: any }
    ): void {
      state.settings[data.index] = data.value;
    },
  },
  actions: {
    goNextStep(ctx): void {
      ctx.commit("updateLiveGame", {
        index: "currentStep",
        value: ctx.state.livegame.currentStep + 1,
      });
      if (ctx.state.player) ctx.commit("setPlayerIsReady", false);
    },
    readyForNext(ctx, payload?): void {
      const player = { ...ctx.state.player };
      player.isReady = !player.isReady;
      ctx.commit("setPlayerIsReady", !player.isReady);

      const chosenAnswer = payload != undefined ? payload.chosenAnswer : null;
      ctx.state.room?.send("clientPacket", {
        type: "playerReadyForNext",
        datas: {
          isReady: player.isReady,
          chosenAnswer: chosenAnswer,
        },
      });
    },
  },
>>>>>>> develop
  modules: {},
});
