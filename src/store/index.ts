import StoreState from "@/interfaces/StoreState";
import { createStore } from "vuex";

export default createStore({
  state: {
    client: null,
    room: null,
    player: null,
    livegame: {
      currentStep: 0,
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
  actions: {},
  modules: {},
});
