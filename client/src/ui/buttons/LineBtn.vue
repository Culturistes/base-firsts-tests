<template>
  <button class="line-btn">
    <span class="text"><slot></slot></span>
    <div class="subline"></div>
  </button>
</template>

<style lang="scss" scoped>
.line-btn {
  position: relative;

  background: none;

  border: none;

  cursor: pointer;

  color: $link-text;
  font-family: $cursiveFont;
  font-size: $fontSsize;

  .text {
    display: inline-block;
    transform: rotate(2deg);
  }

  .subline {
    position: absolute;
    bottom: -2.8rem;
    left: 50%;
    transform: translateX(-50%);

    width: 12.8rem;
    height: 2.4rem;

    background: url("/img/buttons/button-line.svg");
    background-size: 100% 100%;
  }
}
</style>
