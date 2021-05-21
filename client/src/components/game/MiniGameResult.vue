<template>
  <div class="minigameResult step">
    <p>Mini game result</p>
    <p>Podium</p>
    <ul>
      <li v-for="(player, i) in $store.state.players" :key="i">
        <span>{{ i + 1 }}</span>
        <span>{{ player.username }}</span>
        <span>{{ player.score }}</span>
      </li>
    </ul>
    <button v-on:click="$store.dispatch('readyForNext')">Next</button>
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
