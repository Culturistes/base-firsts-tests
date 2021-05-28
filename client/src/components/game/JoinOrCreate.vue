<template>
  <div class="joinOrCreate step">
    <StepTitle>Séléctionne ton monchu</StepTitle>
    <Stamp people="rando"></Stamp>
    <div class="inputContainer">
      <TextInput v-model="username"> Entre ton pseudo </TextInput>
      <TextInput
        v-model="roomID"
        :type="$store.state.settings.streamerMode ? 'password' : 'text'"
        :required="true"
      >
        Entre le code
      </TextInput>
      <!-- <label htmlFor="username">
        <span>Pseudo</span>
        <input
          id="username"
          class="playername input input-text"
          ref="inputPlayername"
          placeholder="Username"
          type="text"
          :value="username"
        />
      </label> -->
      <!-- <label htmlFor="inputRoomId">
        <span>Room ID</span>
        <input
          id="inputRoomId"
          class="input input-text"
          ref="inputRoomID"
          :type="$store.state.settings.streamerMode ? 'password' : 'text'"
        />
      </label> -->
    </div>

    <div class="bottom">
      <ArrowBtn v-on:click="createRoom" :disabled="username.length <= 0">
        Créer
      </ArrowBtn>
      <ArrowBtn
        v-on:click="joinRoom"
        :disabled="username.length <= 0 || roomID.length <= 0"
      >
        Rejoindre
      </ArrowBtn>
    </div>
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
  roomID = "";

  created(): void {
    let item = localStorage.getItem("username");
    if (item) {
      this.username = item;
    }
  }

  async createRoom(): Promise<void> {
    try {
      console.log(this.username);
      let room = await this.$store.state.client?.create("chat", {
        username: this.username,
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
        if (this.roomID != item.roomId) {
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
      let room = await this.$store.state.client?.joinById(this.roomID, {
        username: this.username,
      });
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
        this.roomID,
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

  .bottom {
    margin-top: 50px;
  }
}
</style>
