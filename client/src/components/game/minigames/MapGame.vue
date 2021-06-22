<template>
  <div class="minigame mg-map">
    <RoundList :result="$store.state.player.answersRecord" />
    <QuizBlock :fit="true" :isTimer="true">
      {{ $store.state.livegame.minigame.title }} ?</QuizBlock
    >
    <div id="map"></div>
    <div
      v-if="$store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT"
      class="ui-question"
    >
      <label>
        <p>
          <!-- v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND" -->
          <span class="bonus">Bonus :</span> Comment s'appellent <br />ses
          habitants ?
        </p>
        <div class="input-btn user">
          <TextInput color="black" v-model="gentile">Saisi le nom</TextInput>
          <StarBtn @click="validateAnswer" :valid="$store.state.player?.isReady"
            >Valider</StarBtn
          >
        </div>
      </label>
    </div>
    <div
      class="ui-question"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <label>
        <p>
          <!-- v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND" -->
          <span class="bonus">Bonus :</span> Comment s'appellent <br />ses
          habitants ?
        </p>
        <div class="input-btn">
          <TextInput color="black" :noInput="true"
            >Les
            {{ $store.state.livegame.minigame.goodAnswer.gentileM }}
            !</TextInput
          >
          <StarBtn @click="goNext" :valid="$store.state.player.isReady"
            >suivant</StarBtn
          >
        </div>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Store } from "vuex/types";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "@/views/Game.vue";

export default class MapGame extends Vue {
  myMap!: any;
  marker!: any;
  gentile = "";
  mapRange!: any;
  mapRangeRadius = 150;
  iconAnswer = L.icon({
    iconUrl: "/img/map/icon_answer.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
  iconTrue = L.icon({
    iconUrl: "/img/divers/sun.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  steps = STEPS;

  $store!: Store<StoreState>;

  hasBeenReset = false;

  initializeMap(): void {
    this.myMap = L.map("map", {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      dragging: false,
      boxZoom: false,
      attributionControl: false,
    }).setView([46.9063027184389, 2.1972656250000004], 6);

    L.tileLayer("/img/map/{x}/{y}.png", {}).addTo(this.myMap);

    this.marker = L.marker([0, 0], { icon: this.iconAnswer }).addTo(this.myMap);

    let jokerRadius = this.mapRangeRadius * 1000;
    let jokerLat = 46.23;
    let jokerLng = 2.2;
    this.mapRange = L.circle([jokerLat, jokerLng], {
      radius: jokerRadius,
      stroke: false,
      opacity: 0.8,
    });

    this.myMap.on("click", this.positionMarker);
  }

  validateAnswer(): void {
    this.$store.state.sounds.cta.howl.play();

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
      latLng: [this.marker.getLatLng().lat, this.marker.getLatLng().lng],
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
    store.watch(
      () => this.$store.state.livegame.jokersParams.showMapRange,
      (showMapRange, oldVal) => {
        console.log("MapGame Watch:");
        if (showMapRange) {
          let newLat = this.$store.state.livegame.minigame.goodAnswer.latLng[0];
          let newLng = this.$store.state.livegame.minigame.goodAnswer.latLng[1];
          console.log(newLat, newLng);

          // Approximativement
          // Latitude: 1 deg = 110.574 km.
          // Longitude: 1 deg = 111.320*cos(latitude) km.

          // Make a gap with circle border to avoid approximation failure
          let showRadiusIn = this.mapRangeRadius - 20;

          let randomX = Math.random() * (showRadiusIn * 2) - showRadiusIn;
          let randomY = Math.random() * (showRadiusIn * 2) - showRadiusIn;

          newLng += (randomY / 111.32) * Math.cos(newLat);
          newLat += randomX / 110.574;

          this.mapRange.setLatLng([newLat, newLng]);
          this.mapRange.addTo(this.myMap);
        } else {
          this.mapRange.remove();
        }
      }
    );

    this.initializeMap();
  }

  updated(): void {
    console.log("updated...");
    if (
      this.$store.state.livegame.currentStep ==
      this.steps.MINI_GAME_ROUND_RESULT
    ) {
      this.myMap.eachLayer((layer: any) => {
        if (layer.options.alt != undefined) {
          layer.remove();
        }
      });

      L.marker(this.$store.state.livegame.minigame.goodAnswer.latLng, {
        icon: this.iconTrue,
      }).addTo(this.myMap);

      this.$store.state.players.forEach((player: any) => {
        if (
          player.chosenAnswer != null &&
          player.chosenAnswer.latLng.length > 0
        ) {
          let popup = L.popup({
            closeOnClick: true,
            autoClose: false,
            closeButton: false,
          })
            .setLatLng(player.chosenAnswer.latLng)
            .setContent(
              `<p>${
                player.chosenAnswer.gentile
                  ? '<span class="gentile">' +
                    player.chosenAnswer.gentile +
                    "</span><br />"
                  : ""
              }<span class="username">@${player.username}</span></p>`
            )
            .openOn(this.myMap);
          let icon = L.icon({
            iconUrl: `/img/map/icons/${player.avatarURL}.svg`,
            iconSize: [76, 136],
            iconAnchor: [38, 132],
          });
          let marker = L.marker(player.chosenAnswer.latLng, {
            icon: icon,
            alt: player.username,
          })
            .addTo(this.myMap)
            .on("mouseover", () => {
              popup.openOn(this.myMap);
            })
            .on("mouseout", () => {
              this.myMap.closePopup();
            });
          let polylinePoints = [
            player.chosenAnswer.latLng,
            this.$store.state.livegame.minigame.goodAnswer.latLng,
          ];
          let polyline = L.polyline(polylinePoints, {
            color: "#2C2C2C",
            dashArray: "13",
            lineCap: "round",
          }).addTo(this.myMap);
        }
      });

      this.myMap.off("click");
      this.hasBeenReset = false;
    } else if (
      this.$store.state.livegame.currentStep == this.steps.MINI_GAME_ROUND &&
      !this.hasBeenReset
    ) {
      this.myMap.eachLayer((layer: any) => {
        if (layer.options.alt != undefined) {
          layer.remove();
        }
      });

      this.mapRange.remove();

      this.myMap.on("click", this.positionMarker);
      this.hasBeenReset = true;
    }
  }

  positionMarker(ev: any): void {
    let lat = ev.latlng.lat;
    let lng = ev.latlng.lng;

    this.marker.setLatLng([lat, lng]);
    this.marker.addTo(this.myMap);

    this.$store.state.sounds.coc_patelin.howl.play();
  }

  goNext(): void {
    this.$store.state.sounds.cta.howl.play();
    this.$store.dispatch("readyForNext");
    this.gentile = "";
    this.hasBeenReset = false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.mg-map {
  max-height: 600px;
}
#map {
  width: 990px;
  height: 870px;

  margin: auto;
  margin-bottom: 40px;

  position: absolute;
  z-index: 0;
  top: 55%;
  left: 40%;
  transform: translate(-50%, -50%);

  cursor: crosshair;
}

body.leaflet-dragging {
  #map {
    cursor: grabbing;
  }
}

.ui-question {
  position: absolute;
  //width: 350px;
  top: 50%;
  right: 0;
  margin: 0;

  z-index: 3000;

  font-family: $btnFont;
  font-size: $fontSsize;

  label {
    width: 100%;

    text-align: left;

    font-weight: normal;

    .bonus {
      font-weight: bold;
    }

    .input {
      min-width: 150px;
      margin-right: 20px;
    }

    .star-btn {
      width: 80px;
      height: 80px;

      font-size: 1.3rem;

      &::before {
        background-position: center;
        background-repeat: no-repeat;
      }

      img {
        transform: scale(0.7);
      }
    }

    .input-btn {
      display: flex;
      justify-content: center;
      align-items: center;

      &.user {
        .input {
          width: 200px;
        }
      }
    }
  }

  .btn-arrow {
    margin: auto;
    margin-top: 50px;
  }
}
</style>
