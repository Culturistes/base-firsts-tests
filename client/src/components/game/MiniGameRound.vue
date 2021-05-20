<template>
  <div class="minigameRound step">
    <p>Mini game round</p>
    <p>{{ $store.state.livegame.minigame.name }}</p>
    <ul class="answers">
      <li
        class="answer"
        v-for="(answer, index) in $store.state.livegame.minigame.answers"
        v-bind:key="answer"
        v-on:click="(e) => chooseAnswer(e, index)"
      >
        {{ answer }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "node_modules/vuex/types";
import StoreState from "@/interfaces/StoreState";

/* @Options({
  props: ["streamerMode"],
}) */
export default class MiniGameRound extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;

  selectedElmt!: HTMLElement;
  selectedIndex = null;

  chooseAnswer(e: any, index: number): void {
    e.target.classList.add("active");

    if (this.selectedElmt != undefined) {
      this.selectedElmt.classList.remove("active");
    }

    if (index != this.selectedIndex) {
      this.selectedElmt = e.target;

      this.$store.commit("updateLiveGame", {
        index: "minigame",
        value: { ...this.$store.state.livegame.minigame, chosenAnswer: index },
      });

      this.$store.dispatch("readyForNext", { chosenAnswer: index });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.minigameRound {
  .answer {
    &.active {
      color: green;
    }
  }
}
</style>
