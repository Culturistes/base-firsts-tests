<template>
  <div class="minigameTitle step centered">
    <MiniGameTitle>
      {{ gameTitle }}
    </MiniGameTitle>
    <LineBtn v-on:click="$store.dispatch('readyForNext')"
      >À vos marques, prêt, partez !</LineBtn
    >
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
  gameTitle!: string;

  created(): void {
    switch (this.$store.state.livegame.minigame.type) {
      case "quiz":
        this.gameTitle =
          "C’est l’heure du fameux quizz questions pour un chauvin sur Radio Soleil ! Défiez les autres joueurs et remportez le prix de l’expert des régions.";
        break;
      case "lme":
        this.gameTitle =
          "Péage : ne vous trompez pas de voie, cela risque de vous retarder ! Choisissez soit la réponse de droite, soit celle de gauche.";
        break;
      case "coc":
        this.gameTitle = "Ché où ça";
        break;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
