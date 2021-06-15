<template>
  <div class="minigame mg-bonnefranquette">
    <canvas id="bonne-franquette-canvas"></canvas>

    <ul>
      <li :key="i" v-for="(ingredient, i) in recette.ingredients">
        {{ ingredient.name }} - {{ ingredient.catched }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Ingredient from "@/classes/Ingredient";

@Options({})
export default class BonneFranquetteGame extends Vue {
  cnv: any;
  ctx: any;
  rect: any;
  mouse: any = {
    x: 0,
    y: 0,
  };

  maxElements = 10;
  elements: Array<Ingredient> = [];

  possibleIngredients = [
    { name: "Carotte", img: "#ff0000" },
    { name: "Pomme", img: "#00ff00" },
    { name: "Sel", img: "#0000ff" },
    { name: "Saucisse", img: "#ffff00" },
    { name: "Sucre", img: "#000000" },
    { name: "Poivre", img: "#000000" },
    { name: "Fromage", img: "#000000" },
    { name: "Huile", img: "#000000" },
  ];

  recette: any = {
    ingredients: [
      { name: "Carotte", img: "#ff0000", caught: false },
      { name: "Pomme", img: "#00ff00", caught: false },
      { name: "Sel", img: "#0000ff", caught: false },
      { name: "Saucisse", img: "#ffff00", caught: false },
    ],
  };

  mounted() {
    this.cnv = document.querySelector("#bonne-franquette-canvas");
    this.ctx = this.cnv.getContext("2d");

    this.onResize();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.getMousePos);

    this.animate();
  }

  animate() {
    if (this.elements.length < this.maxElements) {
      let i = Math.round(Math.random() * (this.possibleIngredients.length - 1));

      this.elements.push(
        new Ingredient(
          this.possibleIngredients[i],
          Math.round(Math.random() * window.innerWidth),
          -50
        )
      );
    }

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.elements.forEach((el: any) => {
      el.update(this.ctx, this.mouse);

      if (el.y >= window.innerHeight) {
        const index = this.elements.findIndex((e) => {
          return e === el;
        });
        this.elements.splice(index, 1);

        const indexIngredient = this.recette.ingredients.findIndex((e: any) => {
          return e.name === el.name;
        });

        if (indexIngredient >= 0) {
          this.recette.ingredients[indexIngredient].catched = true;
        }
      }
    });

    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    this.rect = this.cnv.getBoundingClientRect();
  }

  getMousePos(evt: any) {
    console.log(this.mouse);
    this.mouse = {
      x: evt.clientX - this.rect.left,
      y: evt.clientY - this.rect.top,
    };
  }
}
</script>

<style lang="scss">
#bonne-franquette-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}
</style>
