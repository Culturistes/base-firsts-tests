<template>
  <div class="hello">
    {{ msg }}
    <button v-on:click="decrement">-</button>
    {{ count }}
    <button v-on:click="increment">+</button>
    <div id="map"></div>
    <button @click="validateAnswer">Valider</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Icon from "@/assets/logo.png";

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
  myMap!: any;
  marker!: any;

  count = 0;

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  initializeMap(): void {
    this.myMap = L.map("map").setView([46.23, 2.2], 6);

    var myIcon = L.icon({
      iconUrl: Icon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [-3, -76],
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);

    this.marker = L.marker([0, 0], { icon: myIcon }).addTo(this.myMap);

    this.myMap.on("click", (ev: any) => {
      let lat = ev.latlng.lat;
      let lng = ev.latlng.lng;

      this.marker.setLatLng([lat, lng]);
    });
  }

  validateAnswer(): void {
    // distance in meter
    let distance = this.myMap.distance(this.marker.getLatLng(), [46.23, 2.2]);

    // distance in km
    distance /= 1000;

    console.log(distance);
  }

  mounted(): void {
    this.initializeMap();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
  width: 100%;
  height: 70vh;

  cursor: crosshair;
}

body.leaflet-dragging {
  #map {
    cursor: grabbing;
  }
}
</style>
