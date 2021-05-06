<template>
  <div class="joinOrCreate">
    <input
      type="text"
      class="playername"
      ref="inputPlayername"
      placeholder="Username"
    />
    <input id="roomname" type="text" ref="inputRoomID" />
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
import { Store } from "node_modules/vuex/types";
import StoreState from "@/interfaces/StoreState";

export default class JoinOrCreate extends Vue {
  $refs!: {
    inputPlayername: HTMLInputElement;
    inputRoomID: HTMLInputElement;
  };
  $store!: Store<StoreState>;

  async createRoom(): Promise<void> {
    try {
      let room = await this.$store.state.client.create("chat", {
        username: this.$refs.inputPlayername.value,
        creator: true,
      });
      this.$store.commit("updateRoom", room);
    } catch (e) {
      console.error("join error", e);
    }
  }

  async joinRoom(): Promise<void> {
    try {
      let room = await this.$store.state.client.joinById(
        this.$refs.inputRoomID.value,
        { username: this.$refs.inputPlayername.value }
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
}
</style>
