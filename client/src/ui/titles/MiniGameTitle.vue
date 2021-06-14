<template>
  <h3 class="minigame-title">
    <slot></slot>
  </h3>
</template>

<style lang="scss" scoped>
.minigame-title {
  font-size: $fontMsize;
  font-family: $titleFont;
  font-weight: bold;

  text-shadow: 3px 0 0 #fff, -3px 0 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff,
    3px 3px #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff;
}
</style>
