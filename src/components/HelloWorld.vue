<template>
  <div class="hello">
    {{ msg }}
    <button v-on:click="decrement">-</button>
    {{ count }}
    <button v-on:click="increment">+</button>
    <div id="map"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
  myMap!: Record<string, unknown>;

  count = 0;

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  mounted(): void {
    this.myMap = L.map("map").setView([46.23, 2.2], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);

    //var marker = L.marker([51.5, -0.09]).addTo(this.myMap);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
  width: 100%;
  height: 100vh;
}
</style>
