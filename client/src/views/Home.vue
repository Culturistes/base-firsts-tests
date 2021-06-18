<template>
  <div class="home">
    <div class="logo">
      <img src="/img/car/semi-car.png" />
      <h1>Chassé<br />croisé</h1>
    </div>
    <p class="baseline" v-if="$route.params.code == undefined">
      Le jeu 100% français
    </p>
    <p class="baseline" v-if="$route.params.code != undefined">
      Prêt à partir en vacances avec {{ name }} !
    </p>
    <p>
      <StarBtn :routerLink="true" :to="'/game/' + code">C'est parti</StarBtn>
    </p>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Home extends Vue {
  code = "";
  name = "";

  mounted(): void {
    console.log(this.$route.params, location);
    if (typeof this.$route.params.code === "string") {
      let params = this.$route.params.code.split("&");
      this.code = params[0];
      this.name = params[1];
    }
  }
}
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
