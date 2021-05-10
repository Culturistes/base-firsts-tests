import StoreState from "@/interfaces/StoreState";
import { createStore } from "vuex";

export default createStore({
  state: {
    client: null,
    room: null,
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
  modules: {},
});
