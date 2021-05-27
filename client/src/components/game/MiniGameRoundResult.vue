<template>
  <div class="minigameRoundResult step">
    <StepTitle>Mini game round result</StepTitle>
    <ArrowBtn v-on:click="$store.dispatch('readyForNext')">Next</ArrowBtn>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "node_modules/vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class MiniGameRoundResult extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
