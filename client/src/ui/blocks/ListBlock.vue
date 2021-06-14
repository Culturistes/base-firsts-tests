<template>
  <li class="list-block">
    <p class="rank">{{ rank }}</p>
    <img class="img" :src="'/img/stamps/' + perso + '-s.png'" />
    <div class="info">
      <p class="name">{{ name }}</p>
      <p class="score">{{ score }} km</p>
    </div>
  </li>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    rank: {
      type: String,
      default: "1",
    },
    name: {
      type: String,
      default: "Moi",
    },
    score: {
      type: String,
      default: "0",
    },
    perso: {
      type: String,
      default: "rando",
    },
  },
})
export default class QuizBlock extends Vue {}
</script>

<style lang="scss">
.list-block {
  display: flex;
  align-items: center;
  background: rgba($color: #faf5ed, $alpha: 0.3);
  border-radius: 13px;
  padding: 5px 16px;

  font-family: $btnFont;

  .rank {
    margin-right: 16px;
  }

  .img {
    width: 50px;
    margin-right: 16px;
  }

  .info {
    text-align: left;

    p {
      margin: 0;

      font-size: 1.4rem;

      &.rank {
        font-size: $fontSsize;
      }

      &.score {
        font-weight: normal;
      }
    }
  }
}
</style>
