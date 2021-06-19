<template>
  <div class="app">
    <Loading v-if="$store.state.isLoading" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Howl } from "howler";
import { Store } from "vuex";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";

export default class App extends Vue {
  $store!: Store<StoreState>;

  soundsArray: any = [
    { name: "ambiance", loop: true, typeEvent: "self", volume: 0.05 },
    { name: "score_pop", loop: false, typeEvent: "self" },
    { name: "podium", loop: false, typeEvent: "self" },
    { name: "lbf_ramassage_ingredient", loop: false, typeEvent: "click" },
    { name: "coc_patelin", loop: false, typeEvent: "click" },
    { name: "lme_like", loop: false, typeEvent: "click" },
    { name: "quiz_mauvaise_reponse", loop: false, typeEvent: "self" },
    { name: "quiz_bonne_reponse", loop: false, typeEvent: "self" },
    { name: "quiz_choix", loop: false, typeEvent: "click" },
    { name: "joker_pjn", loop: false, typeEvent: "click" },
    { name: "collage_stickers", loop: false, typeEvent: "click" },
    { name: "cta", loop: false, typeEvent: "self" },
    { name: "lechage_timbre", loop: false, typeEvent: "click" },
    { name: "timer", loop: false, typeEvent: "self" },
  ];
  soundsLoaded = 0;

  created(): void {
    store.watch(
      () => this.$store.state.soundsLoaded,
      (val, oldVal) => {
        if (val) {
          if (localStorage.getItem("soundMuted") != null) {
            let muted =
              localStorage.getItem("soundMuted") == "true" ? true : false;
            if (muted) {
              Object.entries(this.$store.state.sounds).forEach((obj: any) => {
                obj[1].howl.mute(true);
              });
            } else {
              Object.entries(this.$store.state.sounds).forEach((obj: any) => {
                obj[1].howl.mute(false);
              });
            }
          }
        }
      }
    );
  }

  mounted(): void {
    let sounds: any = {};
    this.$store.commit("updateLoading", true);
    this.soundsArray.forEach((obj: any) => {
      let sound: any = {};
      sound.name = obj.name;
      sound.howl = new Howl({
        src: [`/sounds/${obj.name}.mp3`, `/sounds/${obj.name}.m4a`],
        loop: obj.loop,
        autoplay: obj.autoplay ? obj.autoplay : false,
        volume: obj.volume ? obj.volume : 0.2,
        onload: () => {
          sounds[sound.name] = sound;
          this.soundsLoaded++;
          console.log("Sound loaded:", sound.name);
          if (this.soundsLoaded == this.soundsArray.length) {
            console.log("all sounds loaded!");
            this.$store.commit("soundsAllLoaded");
            if (
              this.$store.state.assetsLoaded ||
              this.$route.name == "home" ||
              this.$route.name == "home_params"
            ) {
              this.$store.commit("updateLoading", false);
            }
          }
        },
        onloaderror: (id, error) => {
          console.warn("Sound:", sound.name, "couldn't be loaded!");
          console.warn("Due to:", error, "Check the path!");
          this.soundsLoaded++;
        },
      });
    });
    this.$store.commit("updateSounds", sounds);
  }
}
</script>

<style lang="scss">
#app {
  button > img,
  button > span,
  button > p,
  .btn > img,
  .btn > span,
  .btn > p {
    pointer-events: none;
  }
}
</style>
