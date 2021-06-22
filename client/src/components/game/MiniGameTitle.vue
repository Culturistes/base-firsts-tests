<template>
  <div class="minigameTitle step centered">
    <div class="timer"><span :style="{ width: timerWidth + '%' }"></span></div>
    <p class="count-minigame">
      Mini-jeu
      <span
        >{{ $store.state.livegame.currentMiniGame }}/{{
          $store.state.livegame.chosenParams.minigameNumber
        }}</span
      >
    </p>
    <img :src="'/img/titles/' + $store.state.livegame.minigame.type + '.svg'" />
    <div class="instructions-video">
      <div class="video">
        <!-- <img
          :src="
            '/img/animations/' + $store.state.livegame.minigame.type + '.gif'
          "
        /> -->
        <video autoplay loop>
          <source
            :src="
              '/img/animations/' + $store.state.livegame.minigame.type + '.mp4'
            "
          />
        </video>
      </div>
      <div class="instructions">
        <p class="title">Contexte</p>
        <p class="contexte-explications">
          {{ contextes[$store.state.livegame.minigame.type] }}
        </p>
        <p class="title">Comment on joue ?</p>
        <div class="legend">
          <div
            :key="i"
            v-for="(instruction, i) in instructions[
              $store.state.livegame.minigame.type
            ]"
            class="legend-section"
          >
            <img
              :src="
                '/img/instructions/' +
                i +
                '-' +
                $store.state.livegame.minigame.type +
                '.svg'
              "
            />
            <p>{{ instruction }}</p>
          </div>
        </div>
      </div>
    </div>
    <StarBtn
      class="btn"
      v-on:click="readyForNext"
      :valid="$store.state.player.isReady"
      :absolute="true"
      >Prêt ?</StarBtn
    >
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
  $store!: Store<StoreState>;
  gameTitle!: string;

  timer = 0;
  timerMaxWidth = 0;
  timerWidth = 0;

  contextes: any = {
    quiz: 'C’est l’heure du fameux quizz "Question pour un chauvin" sur Radio Soleil !',
    lme: "Péage : ne vous trompez pas de voie, cela risque de vous retarder ! Faites les bons choix.",
    coc: "Vous êtes perdu ! À l’aide de la carte tentez de retrouver la destination indiquée.",
    lbf: "Une petite pause s’impose !  Récoltez les bons ingédients à l’aide de votre panier et reconstituez les spécialités françaises.",
  };

  instructions: any = {
    quiz: [
      "Choisis la bonne réponse à l’aide de ta souris.",
      "Dépêches toi de répondre, le temps est compté.",
      "Cumules un maximum de bonnes réponses !",
    ],
    lme: [
      "Choisis ta réponse favorite à l’aide de ta souris.",
      "Tente d’influencer le choix de tes adversaires.",
      "Choisis ton camp, camarade !",
    ],
    coc: [
      "Place le village à l’aide de ta souris.",
      "Dépêche toi de répondre!",
      "BONUS ! Trouve le nom des habitants pour doubler tes points",
    ],
    lbf: [
      "Déplace ta souris pour déplacer le panier",
      "Attention aux pièges, n’attrappe que le necessaire !",
      "Ramasse tous les ingrédients de la recette !",
    ],
  };

  created(): void {
    switch (this.$store.state.livegame.minigame.type) {
      case "quiz":
        this.gameTitle = "Question pour un chauvin";
        break;
      case "lme":
        this.gameTitle = "La majorité l'emporte";
        break;
      case "coc":
        this.gameTitle = "Ché où ça";
        break;
    }
  }

  mounted(): void {
    this.$store.state.room?.state.listen(
      "currentTimer",
      (val: number, oldVal: number) => {
        this.timerWidth = +((val * 100) / 20).toFixed(2);
      }
    );
  }

  readyForNext(): void {
    this.$store.state.sounds.cta.howl.play();
    this.$store.dispatch("readyForNext");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.steps {
  padding: 0;
}
.timer {
  background-color: rgba(#2c2c2c, 0.3);
  width: 65%;
  height: 4px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  span {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 4px;
    background-color: #2c2c2c;
  }
}

.count-minigame {
  font-family: $btnFont;
  font-size: 1.8rem;

  margin-bottom: 25px;

  span {
    font-size: 3rem;
  }
}

.instructions-video {
  display: flex;
  margin-top: 30px;
  .video {
    display: flex;
  }

  .instructions {
    display: flex;
    flex-direction: column;
    width: 364px;
    text-align: left;
    font-family: $btnFont;
    font-size: 1.8rem;
    margin-left: 60px;

    .title {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .contexte-explications {
      font-weight: normal;
      margin-bottom: 45px;
      margin-top: 0;
    }

    .legend {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;

      background-color: rgba($color: #fff, $alpha: 0.5);
      border-radius: 10px;

      padding: 40px 35px;

      font-weight: normal;

      .legend-section {
        display: flex;
        align-content: center;
      }
    }
  }
}

.btn {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
