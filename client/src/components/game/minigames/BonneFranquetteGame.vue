<template>
  <div class="minigame mg-bonnefranquette">
    <canvas id="bonne-franquette-canvas"></canvas>

    <ul>
      <li :key="i" v-for="(ingredient, i) in recip.ingredients">
        {{ ingredient.name }} - {{ ingredient.catched }}
      </li>
    </ul>
    <StarBtn
      v-on:click="goNext"
      :valid="$store.state.player?.isReady"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
      >Suivant</StarBtn
    >
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Ingredient from "@/classes/Ingredient";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "../../../views/Game.vue";

@Options({})
export default class BonneFranquetteGame extends Vue {
  $store!: Store<StoreState>;
  steps = STEPS;

  cnv: any;
  ctx: any;
  rect: any;
  mouse: any = {
    x: 0,
    y: 0,
  };

  maxElements = 10;
  elements: Array<Ingredient> = [];

  ingredientsFound = 0;

  gamePlaying = true;

  /* recip = {
    name: "",
    possibleIngredients: [
      { name: "Carotte", img: "#ff0000" },
      { name: "Pomme", img: "#00ff00" },
      { name: "Sel", img: "#0000ff" },
      { name: "Saucisse", img: "#ffff00" },
      { name: "Sucre", img: "#000000" },
      { name: "Poivre", img: "#000000" },
      { name: "Fromage", img: "#000000" },
      { name: "Huile", img: "#000000" },
    ],
    ingredients: [
      { name: "Carotte", img: "#ff0000", caught: false },
      { name: "Pomme", img: "#00ff00", caught: false },
      { name: "Sel", img: "#0000ff", caught: false },
      { name: "Saucisse", img: "#ffff00", caught: false },
    ],
  }; */

  recip: any = {
    name: "",
    possibleIngredients: [],
    ingredients: [],
  };

  mounted() {
    this.recip.possibleIngredients = this.$store.state.livegame.minigame;
    this.recip.possibleIngredients =
      this.$store.state.livegame.minigame.goodAnswer.recette.possibleIngredients;
    this.recip.ingredients =
      this.$store.state.livegame.minigame.goodAnswer.recette.ingredients;

    this.cnv = document.querySelector("#bonne-franquette-canvas");
    this.ctx = this.cnv.getContext("2d");

    this.onResize();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.getMousePos);

    this.animate();
  }

  updated(): void {
    if (this.$store.state.livegame.currentStep == this.steps.MINI_GAME_ROUND) {
      this.recip.possibleIngredients = this.$store.state.livegame.minigame;
      this.recip.possibleIngredients =
        this.$store.state.livegame.minigame.goodAnswer.recette.possibleIngredients;
      this.recip.ingredients =
        this.$store.state.livegame.minigame.goodAnswer.recette.ingredients;

      this.gamePlaying = true;
    } else if (
      this.$store.state.livegame.currentStep ==
      this.steps.MINI_GAME_ROUND_RESULT
    ) {
      // Reset everything, it's round result
      this.elements = [];
      this.ingredientsFound = 0;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.gamePlaying = false;
    }
  }

  animate() {
    if (this.gamePlaying) {
      console.log("animating canvas");
      if (this.elements.length < this.maxElements) {
        let i = Math.round(
          Math.random() * (this.recip.possibleIngredients.length - 1)
        );

        this.elements.push(
          new Ingredient(
            this.recip.possibleIngredients[i],
            Math.round(Math.random() * window.innerWidth),
            -50
          )
        );
      }

      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      this.elements.forEach((el: any, i: number) => {
        el.update(
          this.ctx,
          this.mouse,
          this.$store.state.livegame.jokersParams.highlightItems
        );

        if (el.y >= window.innerHeight) {
          const index = this.elements.findIndex((e) => {
            return e === el;
          });
          this.elements.splice(index, 1);

          const indexIngredient = this.recip.ingredients.findIndex((e: any) => {
            return e.name === el.name;
          });

          if (indexIngredient >= 0) {
            if (!this.recip.ingredients[indexIngredient].caught) {
              this.recip.ingredients[indexIngredient].caught = true;
              this.ingredientsFound++;
            }

            if (this.ingredientsFound == this.recip.ingredients.length) {
              let datas = {
                recette: true,
              };

              this.gamePlaying = false;

              this.$store.commit("updateLiveGame", {
                index: "minigame",
                value: {
                  ...this.$store.state.livegame.minigame,
                  chosenAnswer: datas,
                },
              });

              this.$store.dispatch("readyForNext", {
                chosenAnswer: datas,
              });
            }
          }
        }
      });
    }
    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    this.rect = this.cnv.getBoundingClientRect();
  }

  getMousePos(evt: any) {
    //console.log(this.mouse);
    this.mouse = {
      x: evt.clientX - this.rect.left,
      y: evt.clientY - this.rect.top,
    };
  }

  goNext(): void {
    this.$store.dispatch("readyForNext");
    this.$store.state.sounds.cta.howl.play();
  }
}
</script>

<style lang="scss">
#bonne-franquette-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  inset: 0;
}
</style>
