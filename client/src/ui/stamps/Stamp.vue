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
          'background-color3': people === 'surfeuse',
        }"
      ></div>
    </div>
    <div
      :style="{
        'background-image': 'url(\'/img/animations/' + people + '.png\')',
        'background-position': `-${216 * actualImgPos.x}px -${
          380 * actualImgPos.y
        }px`,
      }"
      class="stamp-img"
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
  actualImg = 0;
  actualImgPos: any = {
    x: 0,
    y: 0,
  };
  lastImg: any = {
    surfeuse: 30,
    garcon: 316,
    fermier: 364,
    skieuse: 97,
    camping: 390,
    touriste: 132,
  };

  time = 0;
  lastTime = 0;

  get people(): string {
    return this.people;
  }

  @Watch("selected")
  onSselectedChanged(val: number, oldVal: number) {
    if (val == this.pos) {
      this.lastTime = Date.now();
      this.animate();
    }
  }

  animate() {
    let now = Date.now();
    let delta = now - this.lastTime;
    this.lastTime = now;

    this.time += delta;

    // Animate at 30fps
    if (this.time >= 33.3) {
      this.time = 0;

      let temp = this.actualImg;
      let tempX = this.actualImgPos.x;
      let tempY = this.actualImgPos.y;
      temp++;
      //console.log(temp, tempX, tempY);
      if (temp > this.lastImg[this.people]) {
        this.actualImg = 0;
        this.actualImgPos = {
          x: 0,
          y: 0,
        };
      } else {
        tempX++;
        if (tempX > 99) {
          tempX = 0;
          tempY++;
        }
        this.actualImg = temp;
        this.actualImgPos = {
          x: tempX,
          y: tempY,
        };
      }
    }

    // Stop animation when not selected
    if (this.selected === this.pos) {
      requestAnimationFrame(this.animate);
    }
  }

  mounted() {
    this.lastTime = Date.now();
    this.animate();
  }
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
