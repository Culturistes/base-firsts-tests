<template>
  <ul class="playersList">
    <QuizBlock
      :li="true"
      :right="player.isReady"
      class="playerName"
      v-bind:class="{ active: player.isReady }"
      v-for="(player, i) in $store.state.players"
      v-bind:key="player.id"
    >
      <span>{{ i + 1 }} - </span>
      <span>{{ player.username }} : </span>
      <span>{{ player.score }}</span>
    </QuizBlock>
  </ul>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class GameParameters extends Vue {
  $store!: Store<StoreState>;
}
</script>

<style lang="scss" scoped>
.playersList {
  margin-top: 0;
  list-style: none;
  padding: 0;
}
</style>
