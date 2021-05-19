<template>
  <div class="minigameTitle step">
    <p>Mini game title : {{ $store.state.livegame.minigame.name }}</p>
    <button v-on:click="$store.dispatch('readyForNext')">Start game</button>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
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
