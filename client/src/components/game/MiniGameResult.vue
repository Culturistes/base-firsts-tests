<template>
  <div class="minigameResult step">
    <p class="title">L'aire des <Rect :notEmpty="true">résultats</Rect></p>
    <PlayersList :minigameresult="true" />
    <StarBtn
      class="btn"
      :big="true"
      v-on:click="readyForNext"
      :valid="$store.state.player?.isReady"
      :absolute="true"
      v-if="
        $store.state.livegame.currentMiniGame !=
        $store.state.livegame.chosenParams.minigameNumber
      "
      >Mini-jeu<br />suivant</StarBtn
    >
    <StarBtn
      class="btn"
      :big="true"
      v-on:click="readyForNext"
      :valid="$store.state.player?.isReady"
      :absolute="true"
      v-else
    >
      Résultats
    </StarBtn>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class MiniGameResult extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;

  readyForNext(): void {
    this.$store.state.sounds.cta.howl.play();
    this.$store.dispatch("readyForNext");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  font-size: 3rem;
}

.btn {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
