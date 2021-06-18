<template>
  <div class="joinOrCreate step">
    <h2><span>Séléctionne ton </span><Rect :selected="selectedWord"></Rect></h2>
    <SelectPlayerList v-model="avatar" />
    <div class="inputContainer">
      <TextInput :maxlength="8" v-model="username"> Pseudo </TextInput>
      <!-- <TextInput
        v-if="$route.name === 'game_params'"
        v-model="roomID"
        :type="$store.state.settings.streamerMode ? 'password' : 'text'"
        :required="true"
      >
        Rejoindre une partie
      </TextInput> -->
      <StarBtn
        v-if="$route.name === 'game'"
        v-on:click="createRoom"
        :disabled="username.length <= 0"
      >
        C'est<br />parti !
      </StarBtn>
      <StarBtn
        v-else-if="$route.name === 'game_params'"
        v-on:click="joinRoom"
        :disabled="username.length <= 0 || roomID.length <= 0"
      >
        C'est<br />partie !
      </StarBtn>
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
import { Watch } from "vue-property-decorator";
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import { useRoute } from "vue-router";
import StoreState from "@/interfaces/StoreState";
import SelectPlayerList from "@/ui/lists/SelectPlayerList.vue";

@Options({
  components: { SelectPlayerList },
})
export default class JoinOrCreate extends Vue {
  $refs!: {
    inputPlayername: HTMLInputElement;
    inputRoomID: HTMLInputElement;
  };
  $store!: Store<StoreState>;
  username = "";
  avatar = "surfeuse";
  roomID: any = "";
  selectedWord = 0;
  maxSelectedWord = 6;

  route = useRoute();

  @Watch("avatar")
  onAvatarChanged(val: string, oldVal: string) {
    this.$store.commit("updateAvatarUrl", val);

    this.selectedWord++;
    if (this.selectedWord > this.maxSelectedWord - 1) {
      this.selectedWord = 0;
    }
  }

  mounted(): void {
    if (this.route.params.code != undefined) {
      this.roomID = this.route.params.code;
    }
  }

  created(): void {
    let item = localStorage.getItem("username");
    if (item) {
      this.username = item;
    }
  }

  async createRoom(): Promise<void> {
    this.$store.state.sounds.cta.howl.play();
    try {
      this.$store.commit("updateLoading", true);
      let room = await this.$store.state.client?.create("chat", {
        username: this.username,
        creator: true,
        avatarURL: this.avatar,
      });
      this.$store.commit("updateRoom", room);
    } catch (e) {
      this.$store.commit("updateLoading", false);
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
    this.$store.state.sounds.cta.howl.play();
    try {
      this.$store.commit("updateLoading", true);
      let room = await this.$store.state.client?.joinById(this.roomID, {
        username: this.username,
        avatarURL: this.avatar,
      });
      this.$store.commit("updateRoom", room);
    } catch (e) {
      this.$store.commit("updateLoading", false);
      console.error("Join error");
    }
  }

  async reconnect(item: any): Promise<void> {
    this.$store.state.sounds.cta.howl.play();
    try {
      this.$store.commit("updateLoading", true);
      const room = await this.$store.state.client?.reconnect(
        this.roomID,
        item.data.id
      );
      this.$store.state.sounds.cta.howl.play();
      this.$store.commit("updateRoom", room);
    } catch (e) {
      this.$store.commit("updateLoading", false);
      console.error("join error", e);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.joinOrCreate {
  display: flex;
  flex-direction: column;
  justify-content: center;
  h2 {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    color: white;
  }
  .select-player-list-container {
    margin: 90px 0;
  }
  .inputContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;

    > :first-child {
      margin-right: 24px;
    }
  }
}
</style>
