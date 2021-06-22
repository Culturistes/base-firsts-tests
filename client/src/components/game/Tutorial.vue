<template>
  <div class="tutorial step">
    <MinimalistArrowBtn
      v-if="step > 1"
      class="btn-left"
      direction="left"
      @click="changeStep('-')"
      >Précédent</MinimalistArrowBtn
    >
    <MinimalistArrowBtn
      v-if="step < 4"
      class="btn-right"
      direction="right"
      @click="changeStep('+')"
      >Suivant</MinimalistArrowBtn
    >
    <div class="tuto-container-container">
      <img class="title" src="/img/titles/depart.svg" />
      <div class="tuto-container">
        <div
          class="tuto-step"
          :style="{ transform: 'translateX(-' + translate + '%)' }"
        >
          <img src="/img/animations/tuto1.gif" />
          <p>
            C’est le début des vacances !<br />Vous allez vous affronter dans
            des minis-jeux.
          </p>
        </div>
        <div
          class="tuto-step"
          :style="{ transform: 'translateX(calc(-' + translate + '% - 32px))' }"
        >
          <img src="/img/animations/tuto2.gif" />
          <p class="tuto-subtitle">Le petit jaune</p>
          <p>
            C’est l’heure de l’apéro ! Profitez-en pour prendre de l’avance !<br />
            Chargez un peu le verre des autres pour réduire leur visibilité.
          </p>
        </div>
        <div
          class="tuto-step"
          :style="{ transform: 'translateX(calc(-' + translate + '% - 64px))' }"
        >
          <img src="/img/animations/tuto3.gif" />
          <p class="tuto-subtitle">Le coup de pouce</p>
          <p>
            Votre GPS ne marche plus et vous êtes un peu perdu ?<br />
            Le coup de pouce vous vient en aide !
          </p>
        </div>
        <div
          class="tuto-step"
          :style="{ transform: 'translateX(calc(-' + translate + '% - 96px))' }"
        >
          <img src="/img/animations/tuto4.gif" />
          <p class="tuto-subtitle">Le champi</p>
          <p>Appuyez sur le champi pour déconcentrer les autres joueurs !</p>
        </div>
      </div>
      <div class="points">
        <div class="point" :class="{ active: step == 1 }"></div>
        <div class="point" :class="{ active: step == 2 }"></div>
        <div class="point" :class="{ active: step == 3 }"></div>
        <div class="point" :class="{ active: step == 4 }"></div>
      </div>
    </div>
    <StarBtn
      class="btn"
      v-on:click="readyForNext"
      :valid="$store.state.player?.isReady"
      :big="true"
      :absolute="true"
      >C'est<br />parti !</StarBtn
    >
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

export default class Tutorial extends Vue {
  $refs!: any;
  $store!: Store<StoreState>;

  step = 1;
  maxStep = 4;

  get translate() {
    return 100 * (this.step - 1);
  }

  changeStep(direction: string) {
    if (direction === "-") {
      this.step--;
    } else if (direction === "+") {
      this.step++;
    }

    if (this.step > this.maxStep) {
      this.step = 1;
    } else if (this.step < 1) {
      this.step = this.maxStep;
    }
  }

  readyForNext(): void {
    this.$store.state.sounds.cta.howl.play();
    this.$store.dispatch("readyForNext");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.tuto-container-container {
  position: relative;
  top: 50%;
  transform: translateY(-50%);

  .tuto-container {
    display: flex;
    .tuto-step {
      min-width: calc(100vw - 64px);
      margin-right: 32px;

      font-family: $btnFont;
      font-weight: normal;
      font-size: 1.8rem;

      transition: transform 0.3s;

      .tuto-subtitle {
        font-weight: bold;
      }
    }
  }
}

.title {
  width: 315px;
  margin-bottom: 20px;
}

.points {
  display: flex;
  justify-content: center;

  .point {
    width: 8px;
    height: 8px;

    opacity: 0.25;

    margin-right: 8px;
    border-radius: 50%;

    transition: opacity 0.3s;

    background-color: black;

    &.active {
      opacity: 1;
    }
  }
}

.btn-left {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 20;
  cursor: pointer;
}

.btn-right {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 20;
  cursor: pointer;
}

.btn {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
