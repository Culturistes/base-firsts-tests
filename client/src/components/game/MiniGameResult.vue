<template>
  <div class="minigameResult step">
    <StepTitle>Mini game result</StepTitle>
    <p>Podium</p>
    <PlayersList />
    <StarBtn
      v-on:click="$store.dispatch('readyForNext')"
      :valid="$store.state.player?.isReady"
      >Suivant</StarBtn
    >
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
