<template>
  <div class="loader">
    <div class="car"></div>
    <div class="mask">
      <span v-for="(word, i) in wordList" class="text" :key="i">{{
        word
      }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

export default class Loading extends Vue {
  wordList = [
    "Crème solaire en cours d’étalage dans le dos...",
    "Pastis en préparation...",
    "Emplacement de camping en cours de réservation...",
    "Choix du sandwich triangle...",
    "Calcul de l’itinéraire dans le GPS...",
  ];
  selected: any = 0;

  get translate() {
    return 100 * -this.selected;
  }
}
</script>

<style lang="scss" scoped>
.loader {
  width: 100%;
  height: 100%;
  background-color: $color7;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .car {
    height: 240px;
    width: 240px;
    background: url("/img/animations/loader.png");
    animation: sprite 1.5s steps(28) infinite;

    margin-bottom: 24px;
  }

  .mask {
    display: flex;
    flex-direction: column;
    max-height: 20px;
    overflow: hidden;

    font-family: $btnFont;
    font-size: 1.8rem;

    .text {
      animation: words 12s infinite;
    }
  }
}

@keyframes sprite {
  to {
    background-position: -6720px;
  }
}

@keyframes words {
  0% {
    transform: translateY(0%);
  }

  15% {
    transform: translateY(0%);
  }
  20% {
    transform: translateY(-100%);
  }

  35% {
    transform: translateY(-100%);
  }
  40% {
    transform: translateY(-200%);
  }

  55% {
    transform: translateY(-200%);
  }
  60% {
    transform: translateY(-300%);
  }

  75% {
    transform: translateY(-300%);
  }
  80% {
    transform: translateY(-400%);
  }

  95% {
    transform: translateY(-400%);
  }
}
</style>
