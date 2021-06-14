<template>
  <ul class="playersList">
    <ListBlock
      :li="true"
      :right="player.isReady"
      class="playerName"
      v-bind:class="{ active: player.isReady }"
      v-for="(player, i) in $store.state.players"
      v-bind:key="player.id"
      :rank="i + 1"
      :name="player.username"
      :score="player.score"
    >
    </ListBlock>
  </ul>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class playersList extends Vue {
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
