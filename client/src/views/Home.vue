<template>
  <div class="home">
    <div class="logo">
      <img src="/img/car/semi-car.png" />
      <h1>Chassé<br />croisé</h1>
    </div>
    <p class="baseline">Le jeu qui blabla</p>
    <StarBtn :routerLink="true" to="/game">Créer<br />une<br />partie</StarBtn>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Home extends Vue {}
</script>

<style lang="scss" scoped>
.home {
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      font-size: 9.6rem;
      font-weight: bold;
      text-transform: uppercase;

      margin: 1.8rem;
    }
  }
  .baseline {
    font-family: "Baloo";
  }
}
</style>
