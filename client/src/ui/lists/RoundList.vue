<template>
  <ul class="answers">
    <li class="answer" :key="i" v-for="(res, i) in result">
      <img v-if="res.isGood" src="/img/divers/sun.svg" alt="" />
      <img v-else src="/img/divers/rain.svg" alt="" />
      <div class="barre passed"></div>
    </li>
    <li
      class="answer"
      :key="i"
      v-for="(res, i) in $store.state.livegame.paramsChosen.roundNumber -
      result.length"
    >
      <!-- MAEL : remplacer à la place de 5 le nombre de question par minijeu -->
      <div class="dummy-img"></div>
      <div class="barre"></div>
    </li>
  </ul>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";

@Options({
  props: {
    result: {
      default: null,
    },
    maxRound: {
      default: 1,
    },
  },
})
export default class StampS extends Vue {
  $store!: Store<StoreState>;
}
</script>

<style lang="scss" scoped>
.answers {
  display: flex;
  justify-content: center;
  padding: 0;
  list-style: none;
  .answer {
    margin-right: 10px;

    .dummy-img {
      height: 20px;
      width: 20px;
    }
    .barre {
      width: 38px;
      height: 3px;
      background: black;
      border-radius: 37px;

      opacity: 0.5;

      &.passed {
        opacity: 1;
      }
    }
  }
}
</style>
