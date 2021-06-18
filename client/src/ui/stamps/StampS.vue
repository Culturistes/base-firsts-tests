<template>
  <div class="stamp-s" :style="{ transform: 'rotate(' + rotate + 'deg)' }">
    <img v-if="isMDR" class="mdr" src="/img/stamps/mdr.svg" />
    <img
      v-if="isReady"
      class="ready"
      :class="{ mdr: isMDR }"
      src="/img/stamps/ready.svg"
    />
    <img :src="'/img/stamps/' + people + '-s.svg'" />
    <span class="name"><slot></slot></span>
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
    isMDR: {
      type: Boolean,
      default: false,
    },
    isReady: {
      type: Boolean,
      default: false,
    },
  },
})
export default class StampS extends Vue {
  rotate: number = Math.random() * 10 - 5;
}
</script>

<style lang="scss" scoped>
.stamp-s {
  max-width: 96px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: $fontSsize;
  font-family: $btnFont;

  .name {
    margin-top: 5px;
    font-size: 2rem;
  }

  .mdr {
    position: absolute;
    top: 6px;
    left: -19px;
  }

  .ready {
    position: absolute;
    top: 10px;
    left: -15px;

    &.mdr {
      left: unset;
      right: -15px;
    }
  }
}
</style>
