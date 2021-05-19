<template>
  <div class="minigameRoundTitle step">
    <p>Mini game round title {{ $store.state.livegame.minigame.question }}</p>
    <button v-on:click="$store.dispatch('readyForNext')">Start round</button>
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
