<template>
  <div class="minigame mg-map">
    <p>{{ $store.state.livegame.minigame.title }}</p>
    <div id="map"></div>
    <div
      class="ui-question"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND"
    >
      <label>
        <p>
          Bonus : Comment s'appellent les habitants de
          {{ $store.state.livegame.minigame.title }} ?
        </p>
        <input
          type="text"
          @change="
            (e) => {
              gentile = e.target.value;
            }
          "
        />
      </label>
      <button @click="validateAnswer">Valider</button>
    </div>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <p>
        Habitants: {{ $store.state.livegame.minigame.gentileM }} et
        {{ $store.state.livegame.minigame.gentileF }}
      </p>
      <button v-on:click="$store.dispatch('readyForNext')">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Icon from "@/assets/logo.png";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

export default class MapGame extends Vue {
  myMap!: any;
  marker!: any;
  gentile = "";
  myIcon = L.icon({
    iconUrl: Icon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [-3, -76],
  });

  steps = STEPS;

  $store!: Store<StoreState>;

  initializeMap(): void {
    this.myMap = L.map("map").setView([46.23, 2.2], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);

    console.log(
      this.$store.state.livegame.currentStep,
      this.steps.MINI_GAME_ROUND_RESULT
    );

    this.marker = L.marker([0, 0], { icon: this.myIcon }).addTo(this.myMap);

    this.myMap.on("click", (ev: any) => {
      let lat = ev.latlng.lat;
      let lng = ev.latlng.lng;

      this.marker.setLatLng([lat, lng]);
    });
  }

  validateAnswer(): void {
    // distance in meter
    let distance = this.myMap.distance(
      this.marker.getLatLng(),
      this.$store.state.livegame.minigame.latLong
    );

    // distance in km
    distance /= 1000;

    console.log("Distance", distance);

    let datas = {
      dist: distance,
      gentile: this.gentile,
      latLong: this.marker.getLatLng(),
    };

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

  mounted(): void {
    this.initializeMap();
  }

  updated(): void {
    console.log("updated");

    if (
      this.$store.state.livegame.currentStep ==
      this.steps.MINI_GAME_ROUND_RESULT
    ) {
      L.marker(this.$store.state.livegame.minigame.latLong, {
        icon: this.myIcon,
      }).addTo(this.myMap);

      // TODO: make this work
      /* this.$store.state.players.forEach((player: any) => {
        L.marker(player.chosenAnswer.latLong, {
          icon: this.myIcon,
          title: player.username,
        }).addTo(this.myMap);
      }); */
    }
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
