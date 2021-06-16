<template>
  <div class="minigameTitle step centered">
    <p class="count-minigame">
      Mini-jeu
      <span
        >{{ $store.state.livegame.currentMiniGame }}/{{
          $store.state.livegame.chosenParams.minigameNumber
        }}</span
      >
    </p>
    <img :src="'/img/titles/' + $store.state.livegame.minigame.type + '.png'" />
    <StarBtn
      v-on:click="$store.dispatch('readyForNext')"
      :valid="$store.state.player.isReady"
      >Prêt ?</StarBtn
    >
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "node_modules/vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class MiniGameTitle extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;
  gameTitle!: string;

  created(): void {
    switch (this.$store.state.livegame.minigame.type) {
      case "quiz":
        this.gameTitle = "Question pour un chauvin";
        break;
      case "lme":
        this.gameTitle = "La majorité l'emporte";
        break;
      case "coc":
        this.gameTitle = "Ché où ça";
        break;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.count-minigame {
  font-family: $btnFont;
  font-size: 1.8rem;

  margin-bottom: 25px;

  span {
    font-size: 3rem;
  }
}
</style>
