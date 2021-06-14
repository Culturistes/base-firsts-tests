<template>
  <div class="stamp-s">
    <img :src="'/img/stamps/' + people + '-s.png'" />
    <slot></slot>
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
  },
})
export default class StampS extends Vue {}
</script>

<style lang="scss" scoped>
.stamp-s {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: $fontSsize;
  font-family: $btnFont;
}
</style>
