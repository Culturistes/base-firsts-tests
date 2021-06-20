<template>
  <button
    class="mute-btn"
    :class="{ disabled: disabled, big: big }"
    :disabled="disabled"
    @click="() => toggleSound()"
  >
    <span v-if="!soundMuted"><img src="/img/buttons/sound_active.svg" /></span>
    <span v-else><img src="/img/buttons/sound_inactive.svg" /></span>
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import store from "@/store";
import { Store } from "vuex/types";
import StoreState from "@/interfaces/StoreState";

@Options({
  props: {
    routerLink: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    big: {
      type: Boolean,
      default: false,
    },
  },
})
export default class MuteBtn extends Vue {
  $store!: Store<StoreState>;

  soundMuted = false;

  created(): void {
    if (localStorage.getItem("soundMuted") != null) {
      let muted = localStorage.getItem("soundMuted") == "true" ? true : false;
      this.soundMuted = muted;
    }
  }

  mounted(): void {
    store.watch(
      () => this.$store.state.soundsLoaded,
      (val, oldVal) => {
        if (val) {
          if (localStorage.getItem("soundMuted") != null) {
            let muted =
              localStorage.getItem("soundMuted") == "true" ? true : false;
            this.toggleSound(muted);
          }
        }
      }
    );
  }

  toggleSound(val?: boolean): void {
    this.soundMuted = val != undefined ? val : !this.soundMuted;

    localStorage.setItem("soundMuted", this.soundMuted + "");

    if (this.soundMuted) {
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
</script>

<style lang="scss" scoped>
.mute-btn {
  position: absolute;
  z-index: 10;
  left: 24px;
  bottom: 24px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 48px;
  height: 48px;
  background-color: unset;
  background-image: url("/img/buttons/trumpet.svg");
  background-size: 100%;
  border: none;

  font-family: "Baloo";
  font-weight: bold;
  font-size: $fontSsize;
  color: $light-text;
  text-transform: uppercase;
  text-decoration: none;

  span,
  img {
    display: block;

    pointer-events: none;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.big {
    width: 160px;
    height: 160px;
  }
}
</style>
