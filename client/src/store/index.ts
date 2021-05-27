import StoreState from "@/interfaces/StoreState";
import { createStore } from "vuex";
import { Client, Room } from "colyseus.js";

export default createStore({
  state: {
    client: null,
    room: null,
    player: null,
    players: [],
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
        title: "",
        answers: [],
        latLong: [],
        gentileM: "",
        gentileF: "",
        chosenAnswer: "",
        description: "",
        goodAnswer: {}
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
    updatePlayers(state: StoreState, value: Array<any>): void {
      state.players = value;
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
    updateMinigame(
      state: StoreState,
      data: { index: string; value: any }
    ): void {
      state.livegame.minigame[data.index] = data.value;
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
  modules: {},
});
