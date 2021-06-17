<template>
  <div class="app">
    <router-view />

    <Debug />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Howl } from "howler";
import { Store } from "vuex";
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

  created(): void {
    let sounds: any = {};
    this.soundsArray.forEach((obj: any) => {
      let sound: any = {};
      sound.name = obj.name;
      try {
        sound.howl = new Howl({
          src: [`/sounds/${obj.name}.mp3`],
          loop: obj.loop,
          autoplay: obj.autoplay ? obj.autoplay : false,
          volume: obj.volume ? obj.volume : 0.1,
        });
        console.log("Sound:", sound.name, "initialized");
        sounds[sound.name] = sound;
      } catch (e) {
        console.log(e);
      }
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
