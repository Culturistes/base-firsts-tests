import StoreState from "@/interfaces/StoreState";
import { createStore } from "vuex";

export default createStore({
  state: {
    client: null,
    room: null,
    player: null,
    livegame: {
      currentStep: 0,
      isReadyForNext: false,
      minigameNumber: 1,
      roundNumber: 1,
      currentMiniGame: 1,
      currentRound: 1,
    },
    settings: {
      modeStreamer: false,
    },
  },
  mutations: {
    updateClient(state: StoreState, value: string): void {
      state.client = value;
    },
    updateRoom(state: StoreState, value: string): void {
      state.room = value;
    },
    updatePlayer(state: StoreState, value: string): void {
      state.player = value;
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
      ctx.commit("updateLiveGame", {
        index: "isReadyForNext",
        value: false,
      });
    },
    readyForNext(ctx): void {
      const player = ctx.state.player;
      player.isReady = !player.isReady;
      ctx.commit("updatePlayer", player);
      ctx.state.room.send("playerReadyForNext", player.isReady);
    },
  },
  modules: {},
});
