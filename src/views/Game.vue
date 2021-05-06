<template>
  <div class="game">
    <JoinOrCreate v-if="currentStep === steps.JOIN_OR_CREATE" />

    <p v-if="undefined != player && player.isMDR">Tu es MDR</p>

    <button v-if="currentStep === steps.GAME_PARAMETERS" v-on:click="copyCode">
      Copier le code
    </button>

    <div class="logs">
      <p v-for="notif in notifications" v-bind:key="notif">{{ notif }}</p>
    </div>

    <ul class="playersList">
      <li v-for="player in players" v-bind:key="player.id">
        {{ player.username }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Client } from "colyseus.js";
import { Store } from "vuex";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import JoinOrCreate from "@/components/JoinOrCreate.vue";

enum STEPS {
  JOIN_OR_CREATE,
  GAME_PARAMETERS,
}

@Options({
  components: {
    JoinOrCreate,
  },
})
export default class Game extends Vue {
  currentStep = STEPS.JOIN_OR_CREATE;
  player!: { id: string; username: string; isMDR: boolean; score: number };
  notifications: Array<string> = [];
  players: Array<{ id: string; username: string; score: number }> = [];

  steps = STEPS;

  $store!: Store<StoreState>;

  async created(): Promise<void> {
    try {
      let client = await new Client("ws://localhost:2567");
      this.$store.commit("updateClient", client);
      store.watch(
        () => this.$store.state.room,
        (room, oldVal) => {
          if (room !== null) {
            this.listenToServer(room, "messages");
            this.listenToServer(room, "user_notifs");
            this.listenToServer(room, "players_list");
            this.listenToServer(room, "your_infos");

            if (oldVal == null) {
              this.currentStep = STEPS.GAME_PARAMETERS;
            }
          }
        }
      );
      console.log("Client initialized");
    } catch (e) {
      console.log("Client couldn't be initialized:", e);
    }
  }

  listenToServer(room: any, type: string): void {
    room.onMessage(type, (data: any) => {
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
        this.player = data;
      }
    });
  }

  sendToServer(type: string, message: string): void {
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
    width: 300px;
    text-align: left;
    li {
    }
  }
}
</style>
