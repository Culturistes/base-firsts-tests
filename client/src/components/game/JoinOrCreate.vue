<template>
  <div class="joinOrCreate step">
    <div class="inputContainer">
      <label htmlFor="username">
        <span>Pseudo</span>
        <input
          id="username"
          class="playername"
          ref="inputPlayername"
          placeholder="Username"
          type="text"
          :value="username"
        />
      </label>
      <label htmlFor="inputRoomId">
        <span>Room ID</span>
        <input
          id="inputRoomId"
          ref="inputRoomID"
          :type="$store.state.settings.streamerMode ? 'password' : 'text'"
        />
      </label>
    </div>

    <button class="join-btn" v-on:click="joinRoom">Join</button>
    <button class="create-btn" v-on:click="createRoom">Create</button>
    <!-- <div>
      <p v-for="notif in notifications" :key="notif">{{ notif }}</p>
    </div>
    <div>
      <input ref="inputSendMsg" />
      <button v-on:click="sendMessage">Send message to everyone</button>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

export default class JoinOrCreate extends Vue {
  $refs!: {
    inputPlayername: HTMLInputElement;
    inputRoomID: HTMLInputElement;
  };
  $store!: Store<StoreState>;
  username = "";

  created(): void {
    let item = localStorage.getItem("username");
    if (item) {
      this.username = item;
    }
  }

  async createRoom(): Promise<void> {
    try {
      let room = await this.$store.state.client?.create("chat", {
        username: this.$refs.inputPlayername.value,
        creator: true,
      });
      this.$store.commit("updateRoom", room);
      this.$store.dispatch("goNextStep");
    } catch (e) {
      console.error("join error", e);
    }
  }

  async joinRoom(): Promise<void> {
    const itemStr = localStorage.getItem("player_infos");

    if (itemStr) {
      const item = JSON.parse(itemStr);
      const now = new Date();

      // compare the expiry time of the item with the current time
      if (now.getTime() > item.expiration) {
        // If the item is expired, delete the item from storage
        localStorage.removeItem("player_infos");

        this.connect();
      } else {
        if (this.$refs.inputRoomID.value != item.roomId) {
          this.connect();
        } else {
          this.reconnect(item);
        }
      }
    } else {
      this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      let room = await this.$store.state.client?.joinById(
        this.$refs.inputRoomID.value,
        { username: this.$refs.inputPlayername.value }
      );
      this.$store.commit("updateRoom", room);
      this.$store.dispatch("goNextStep");
    } catch (e) {
      console.error("Join error");
      console.log();
    }
  }

  async reconnect(item: any): Promise<void> {
    try {
      const room = await this.$store.state.client?.reconnect(
        this.$refs.inputRoomID.value,
        item.data.id
      );
      this.$store.commit("updateRoom", room);
    } catch (e) {
      console.error("join error", e);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.joinOrCreate {
  margin: 10px;

  .inputContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;

    label {
      display: flex;
      flex-flow: nowrap column;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
