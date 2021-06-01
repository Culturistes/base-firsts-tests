<template>
  <div class="minigame mg-map">
    <QuizBlock
      >Où se trouve la ville de
      {{ $store.state.livegame.minigame.title }} ?</QuizBlock
    >
    <div id="map"></div>
    <QuizBlock
      class="ui-question"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND"
    >
      <label>
        <p>
          Bonus : Comment s'appellent les habitants de
          {{ $store.state.livegame.minigame.title }} ?
        </p>
        <TextInput color="black" v-model="gentile"
          >Entre le nom des habitans</TextInput
        >
      </label>
      <ArrowBtn @click="validateAnswer">Valider</ArrowBtn>
    </QuizBlock>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <p>
        Habitants: {{ $store.state.livegame.minigame.goodAnswer.gentileM }} et
        {{ $store.state.livegame.minigame.goodAnswer.gentileF }}
      </p>
      <ArrowBtn v-on:click="goNext">Suivant</ArrowBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

export default class MapGame extends Vue {
  myMap!: any;
  markers: Array<any> = [];
  marker!: any;
  gentile = "";
  iconAnswer = L.icon({
    iconUrl: "/img/map/icon_answer.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -76],
  });
  iconTrue = L.icon({
    iconUrl: "/img/map/icon_true.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -76],
  });

  steps = STEPS;

  $store!: Store<StoreState>;

  hasBeenReset = false;

  initializeMap(): void {
    console.log("map initialized");
    this.myMap = L.map("map").setView([46.23, 2.2], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);

    this.marker = L.marker([0, 0], { icon: this.iconAnswer }).addTo(this.myMap);
    this.markers.push(this.marker);

    this.myMap.on("click", (ev: any) => {
      let lat = ev.latlng.lat;
      let lng = ev.latlng.lng;

      this.marker.setLatLng([lat, lng]);
    });
  }

  validateAnswer(): void {
    console.log(this.$store.state.livegame.minigame);
    // distance in meter
    let distance = this.myMap.distance(
      this.marker.getLatLng(),
      this.$store.state.livegame.minigame.goodAnswer.latLng
    );

    // distance in km
    distance /= 1000;

    let datas = {
      dist: distance,
      gentile: this.gentile,
      latLng: this.marker.getLatLng(),
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
    console.log("mounted");
    this.initializeMap();
  }

  updated(): void {
    if (
      this.$store.state.livegame.currentStep ==
      this.steps.MINI_GAME_ROUND_RESULT
    ) {
      L.marker(this.$store.state.livegame.minigame.goodAnswer.latLng, {
        icon: this.iconTrue,
      }).addTo(this.myMap);

      this.$store.state.players.forEach((player: any) => {
        let newMarker = L.marker(player.chosenAnswer.latLng, {
          icon: this.iconAnswer,
          title: player.username,
        }).addTo(this.myMap);
        this.markers.push(newMarker);
      });
    } else if (
      this.$store.state.livegame.currentStep == this.steps.MINI_GAME_ROUND &&
      !this.hasBeenReset
    ) {
      this.myMap.eachLayer((layer: any) => {
        if (layer.options.title != undefined) {
          console.log(layer.options.title, "removed");
          layer.remove();
        }
      });

      this.myMap.on("click", (ev: any) => {
        let lat = ev.latlng.lat;
        let lng = ev.latlng.lng;

        this.marker.setLatLng([lat, lng]).addTo(this.myMap);
      });

      this.hasBeenReset = true;
    }
  }

  goNext(): void {
    this.$store.dispatch("readyForNext");
    this.gentile = "";
    this.hasBeenReset = false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#map {
  width: 100%;
  height: calc(100vh - 80px - 80px - 157px);

  margin: auto;
  margin-bottom: 40px;

  cursor: crosshair;
}

body.leaflet-dragging {
  #map {
    cursor: grabbing;
  }
}

.ui-question {
  position: absolute;
  width: 30%;
  bottom: 0;
  left: 0;
  margin: 0;
  padding: 20px;

  label {
    width: 100%;

    .input {
      width: 100%;
    }
  }

  .btn-arrow {
    margin: auto;
    margin-top: 50px;
  }
}
</style>
