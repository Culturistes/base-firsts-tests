<template>
  <div
    class="stamp"
    :class="{
      little: selected !== pos,
      out: pos - selected <= -2 || pos - selected >= 2,
    }"
    :style="{ transform: 'translateX(' + translate + '%)' }"
  >
    <img
      class="annotation"
      :src="'/img/players-annotations/' + people + '.svg'"
      :class="[selected == pos ? 'show' : null]"
    />
    <div class="stamp-border">
      <div
        class="stamp-bg"
        :class="{
          'background-color1': people === 'bigouden',
          'background-color2': people === 'tropique',
          'background-color3': people === 'fermier' || people === 'rando',
          'background-color5': people === 'skieuse',
          'background-color6': people === 'surfeuse',
          'background-color8': people === 'garcon' || people === 'camping',
          'background-color9': people === 'bayonnais',
          'background-color10': people === 'touriste',
        }"
      ></div>
    </div>
    <div
      class="stamp-img"
      :class="[selected == pos ? 'play' : null, people]"
    ></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "vue-property-decorator";

@Options({
  props: {
    people: {
      type: String,
      default: "rando",
    },
    pos: {
      type: Number,
    },
    selected: {
      type: Number,
    },
  },
})
export default class Stamp extends Vue {
  selected!: number;
  pos!: number;
  get translate() {
    console.log(this.pos, this.pos - this.selected);
    return 100 * -this.selected;
  }
}
</script>

<style lang="scss" scoped>
.stamp {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  padding-right: 115px;
  opacity: 1;

  transition: opacity, transform 0.3s;

  .annotation {
    position: absolute;

    top: -23%;
    right: -10%;

    transition: 0.3s;

    opacity: 0;

    &.show {
      opacity: 1;
    }
  }

  &-border {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 216px;
    height: 258px;

    background-image: url("/img/stamps/stamp-border.svg");
    background-size: 100% 100%;
    background-repeat: no-repeat;

    transition: transform 0.3s;

    .stamp-bg {
      position: absolute;

      width: 166.15px;
      height: 208.06px;
    }
  }

  &-img {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 216px;
    height: 380px;

    transition: transform 0.3s;

    @keyframes spriteCamping {
      to {
        background-position: -84456px;
      }
    }
    &.camping {
      background: url("/img/animations/camping.png");
      animation: spriteCamping 13s steps(391) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteSurfeuse {
      to {
        background-position: -6696px;
      }
    }
    &.surfeuse {
      background: url("/img/animations/surfeuse.png");
      animation: spriteSurfeuse 1s steps(31) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteGarcon {
      to {
        background-position: -68472px;
      }
    }
    &.garcon {
      background: url("/img/animations/garcon.png");
      animation: spriteGarcon 10.5s steps(317) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteSkieuse {
      to {
        background-position: -21168px;
      }
    }
    &.skieuse {
      background: url("/img/animations/skieuse.png");
      animation: spriteSkieuse 3.3s steps(98) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteFermier {
      to {
        background-position: -78840px;
      }
    }
    &.fermier {
      background: url("/img/animations/fermier.png");
      animation: spriteFermier 12.1s steps(365) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteTouriste {
      to {
        background-position: -28728px;
      }
    }
    &.touriste {
      background: url("/img/animations/touriste.png");
      animation: spriteTouriste 4.4s steps(133) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteBigouden {
      to {
        background-position: -45360px;
      }
    }
    &.bigouden {
      background: url("/img/animations/bigouden.png");
      animation: spriteBigouden 7s steps(210) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteRando {
      to {
        background-position: -29160px;
      }
    }
    &.rando {
      background: url("/img/animations/rando.png");
      animation: spriteRando 4.5s steps(135) infinite;
      animation-play-state: paused;
    }

    @keyframes spriteBayonnais {
      to {
        background-position: -46872px;
      }
    }
    &.bayonnais {
      background: url("/img/animations/bayonnais.png");
      animation: spriteBayonnais 7.2s steps(217) infinite;
      animation-play-state: paused;
    }

    &.play {
      animation-play-state: running;
    }
  }

  &.little {
    opacity: 0.6;
    .stamp-border {
      transform: scale(0.7);
    }

    .stamp-img {
      transform: scale(0.5);
    }
  }

  &.out {
    opacity: 0;
  }
}
</style>
