<template>
  <div class="minigame mg-bonnefranquette">
    <canvas id="bonne-franquette-canvas"></canvas>
    <div
      v-show="
        $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
      "
      class="panier-container"
    >
      <div class="panier"></div>
    </div>

    <p class="recip-name">{{ recip.name }}</p>

    <div
      class="list-ingredients"
      :class="{
        final:
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT,
      }"
    >
      <p class="title">La liste de course:</p>
      <ul class="list">
        <li :key="i" v-for="(ingredient, i) in catchedElements">
          <img
            class="img-ingredient"
            :src="'/img/ingredients/' + ingredient.img + '.png'"
          />{{ ingredient.name }}
          <img
            v-if="ingredient.isGoodAnswer"
            src="/img/divers/check_vert.svg"
          />
          <img v-else src="/img/divers/croix_rouge.svg" />
        </li>
      </ul>
      <div class="score">
        <p>Total</p>
        <p
          v-if="
            $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT
          "
        >
          + {{ $store.state.player.scoreWon }} km
        </p>
        <p v-else>0</p>
      </div>
    </div>
    <div
      class="list-result"
      :class="{
        final:
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT,
      }"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <ul>
        <li :key="i" v-for="(ingredient, i) in recip.ingredients">
          <img
            class="img-ingredient"
            :src="'/img/ingredients/' + ingredient.img + '.png'"
          />{{ ingredient.name }}
        </li>
      </ul>
    </div>
    <StarBtn
      v-on:click="goNext"
      :valid="$store.state.player?.isReady"
      :absolute="true"
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
import store from "@/store";

@Options({})
export default class BonneFranquetteGame extends Vue {
  $store!: Store<StoreState>;
  steps = STEPS;

  panier: any = null;

  cnv: any;
  ctx: any;
  rect: any;
  mouse: any = {
    x: 0,
    y: 0,
  };

  maxElements = 10;
  elements: Array<Ingredient> = [];

  catchedElements: Array<any> = [];

  ingredientsFound = 0;

  gamePlaying = true;

  delay = 30;

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
    this.panier = document.querySelector(".panier-container");
    this.recip.name =
      this.$store.state.livegame.minigame.goodAnswer.recette.name;
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

    console.log(this.recip);

    store.watch(
      () => this.$store.state.livegame.minigame.goodAnswer.recette,
      (val, oldVal) => {
        console.log(this.recip);
        this.catchedElements = [];
      }
    );
  }

  updated(): void {
    if (this.$store.state.livegame.currentStep == this.steps.MINI_GAME_ROUND) {
      this.recip.name =
        this.$store.state.livegame.minigame.goodAnswer.recette.name;
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
      this.delay++;
      if (this.elements.length < this.maxElements && this.delay >= 30) {
        this.delay = 0;
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
        if (el.canBeDraw) {
          el.update(
            this.ctx,
            this.mouse,
            this.$store.state.livegame.jokersParams.highlightItems
          );
        }

        if (el.y >= window.innerHeight) {
          const index = this.elements.findIndex((e) => {
            return e === el;
          });
          this.elements.splice(index, 1);

          const indexIngredient = this.recip.ingredients.findIndex((e: any) => {
            return e.name === el.name;
          });

          const indexPossibleIngredient =
            this.recip.possibleIngredients.findIndex((e: any) => {
              return e.name === el.name;
            });

          const indexInCatchedElements = this.catchedElements.findIndex(
            (e: any) => {
              return e.name === el.name;
            }
          );

          if (
            indexInCatchedElements < 0 &&
            el.y >= window.innerHeight + 10000
          ) {
            this.catchedElements.push(
              this.recip.possibleIngredients[indexPossibleIngredient]
            );
          }

          if (indexIngredient >= 0 && el.y >= window.innerHeight + 10000) {
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
    this.mouse = {
      x: evt.clientX - this.rect.left,
      y: evt.clientY - this.rect.top,
    };

    if (this.panier !== null) {
      this.panier.style.top = this.mouse.y - 140 + "px";
      this.panier.style.left = this.mouse.x - 140 + "px";
    }
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

.panier-container {
  position: fixed;
  width: 280px;
  height: 280px;

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 10000;

  pointer-events: none;
  .panier {
    width: 140px;
    height: 140px;
    background-image: url("/img/divers/panier.svg");

    transform-origin: center top;

    animation: panierBalance 1s infinite alternate;
  }

  @keyframes panierBalance {
    from {
      transform: rotate(15deg);
    }

    to {
      transform: rotate(-15deg);
    }
  }
}

.recip-name {
  position: relative;
  display: table;
  margin-left: auto;
  margin-right: auto;
  padding: 13px 22px;
  font-family: $btnFont;
  font-size: 2rem;
  background: $color7;
  border-radius: 6px;

  transform: translateX(-83%);

  &::before {
    position: absolute;
    top: 3px;
    left: 3px;
    content: "";
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    border-radius: 6px;
    border: $color10 solid 1px;
    z-index: -1;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 32px;
    height: 32px;

    z-index: -1;
    background-image: url("/img/divers/languette.svg");
    background-size: 32px 32px;
    background-position: center center;

    transform: translate(-50%, 63%);
  }
}

.list-ingredients {
  position: fixed;
  right: 30px;
  bottom: 150px;
  padding: 30px 20px;
  background: $color7;
  height: 338px;
  width: 261px;

  border-radius: 15px;

  transition: 0.3s;

  &.final {
    right: 50%;

    transform: translate(-25%, -25%) rotate(-3.29deg);
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 38px;
    height: 38px;

    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;

    background: $color8;
  }

  &::after {
    top: unset;
    bottom: 0;
    transform: translate(-50%, 50%);
  }

  .title {
    font-size: 2rem;
    margin: 10px 0;
  }

  .list {
    height: 189px;
    font-size: 1.4rem;
    font-family: $btnFont;
    font-weight: bold;
    text-align: left;

    list-style: none;
    padding: 20px 0;
    margin: 0;

    border-top: solid 0.5px black;
    border-bottom: solid 0.5px black;

    overflow: auto;

    li {
      display: flex;
      align-items: center;

      margin-bottom: 10px;

      :first-child {
        margin-right: 20px;
      }

      :last-child {
        margin-left: auto;
      }
    }

    .img-ingredient {
      width: 27px;
      height: 27px;
    }
  }

  .score {
    display: flex;
    justify-content: space-between;

    font-size: 1.4rem;
    font-family: $btnFont;
    font-weight: bold;
    text-align: left;
  }
}

.list-result {
  position: fixed;
  height: 338px;
  width: 287px;
  left: 50%;
  bottom: 150px;
  padding: 10px 5px;
  border: solid 10px $color7;
  background: $color8;

  border-radius: 15px;

  transition: 0.3s;

  overflow: auto;

  transform: translate(25%, -25%) rotate(3.29deg);

  ul {
    list-style: none;
    padding: 0;

    display: flex;
    flex-wrap: wrap;

    margin: 0;
    width: 100%;
    height: 100%;

    li {
      width: 70px;

      display: flex;
      flex-direction: column;
      align-items: center;

      margin-right: 10px;

      font-size: 2rem;

      font-family: "Shadows Into Light";

      img {
        width: 70px;
        height: 70px;
      }
    }
  }
}
</style>
