<template>
  <div
    class="stamp"
    :class="{ little: selected !== pos }"
    :style="{ transform: 'translateX(' + translate + '%)' }"
  >
    <div class="stamp-border">
      <div
        class="stamp-bg"
        :class="{
          'background-color1': people === 'bigoudene',
          'background-color2': people === 'tropique',
          'background-color3': people === 'rando',
        }"
      ></div>
    </div>
    <div class="stamp-img">
      <img v-if="people == 'rando'" src="/img/players/rando.png" alt="" />
      <img
        v-if="people == 'bigoudene'"
        src="/img/players/bigoudene.png"
        alt=""
      />
      <img v-if="people == 'tropique'" src="/img/players/tropique.png" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

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
    return 100 * -this.selected;
  }
}
</script>

<style lang="scss" scoped>
.stamp {
  display: flex;
  justify-content: center;
  align-items: center;

  padding-right: 80px;
  opacity: 1;

  transition: opacity, transform 0.3s;

  &-border {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 216px;
    height: 258px;

    background-image: url("/img/stamps/stamp-border.svg");
    background-size: 100% 100%;

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
}
</style>
