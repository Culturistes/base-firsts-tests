<template>
  <div class="stamp">
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

export enum STEPS {
  JOIN_OR_CREATE,
  GAME_PARAMETERS,
  MINI_GAME_TITLE,
  MINI_GAME_ROUND,
  MINI_GAME_ROUND_RESULT,
  MINI_GAME_RESULT,
  GAME_RESULT,
}

@Options({
  props: {
    people: {
      type: String,
      default: "rando",
    },
  },
})
export default class TextInput extends Vue {
  steps = STEPS;
}
</script>

<style lang="scss" scoped>
.stamp {
  display: flex;
  justify-content: center;
  align-items: center;

  &-border {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 260px;
    height: 310px;

    background-image: url("/img/stamps/stamp-border.svg");
    background-size: 100% 100%;

    .stamp-bg {
      position: absolute;

      width: 200px;
      height: 250px;
    }
  }

  &-img {
    position: absolute;
  }
}
</style>
