<template>
  <div class="minigame mg-quiz">
    <QuizBlock>{{ $store.state.livegame.minigame.title }}</QuizBlock>
    <div class="ui-question">
      <QuizBlock
        :key="i"
        v-for="(answer, i) in answers"
        @click="
          () => {
            this.log([
              this.$store.state.livegame.minigame.goodAnswer,
              answer,
              this.selectedAnswer,
            ]);
            if (
              this.$store.state.livegame.currentStep !==
              steps.MINI_GAME_ROUND_RESULT
            ) {
              this.selectedAnswer =
                this.$store.state.livegame.minigame.type == 'quiz'
                  ? this.answers[i]
                  : i.toString();
            }
          }
        "
        :button="true"
        :selected="
          (selectedAnswer === answer || selectedAnswer === i.toString()) &&
          $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
        "
        :right="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
          $store.state.livegame.minigame.goodAnswer.content.includes(answer)
        "
        :wrong="
          (selectedAnswer === answer || selectedAnswer === i.toString()) &&
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
          !$store.state.livegame.minigame.goodAnswer.content.includes(answer)
        "
      >
        {{ $filters.hideDollar(answer) }}
      </QuizBlock>

      <div
        class="ui-valid"
        v-if="
          selectedAnswer != null &&
          $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
        "
      >
        <ArrowBtn @click="sendAnswer">Valider</ArrowBtn>
      </div>
    </div>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <ArrowBtn v-on:click="goNext">Suivant</ArrowBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "../../../views/Game.vue";

@Options({})
export default class QuizGame extends Vue {
  // Type : 'quiz' for the Quiz || 'lme' for La Majorité L'emporte

  $store!: Store<StoreState>;

  steps = STEPS;

  answers: any = [];
  selectedAnswer = null;

  answersUpdated = false;

  log(array: Array<any>) {
    array.forEach((el) => {
      //console.log(el);
    });
  }

  shuffle(array: Array<string>) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  sendAnswer() {
    this.$store.commit("updateLiveGame", {
      index: "minigame",
      value: {
        ...this.$store.state.livegame.minigame,
        chosenAnswer: this.selectedAnswer,
      },
    });

    this.$store.dispatch("readyForNext", { chosenAnswer: this.selectedAnswer });
  }

  mounted(): void {
    console.log("quiz mounted");
    if (this.$store.state.livegame.minigame.type == "quiz") {
      this.answers = this.shuffle(this.$store.state.livegame.minigame.answers);
    } else {
      this.answers = this.$store.state.livegame.minigame.answers;
    }
  }

  updated(): void {
    if (
      !this.answersUpdated &&
      this.$store.state.livegame.currentStep == this.steps.MINI_GAME_ROUND
    ) {
      console.log(
        "update answers",
        this.$store.state.livegame.minigame.answers
      );
      this.selectedAnswer = null;
      if (this.$store.state.livegame.minigame.type == "quiz") {
        this.answers = this.shuffle(
          this.$store.state.livegame.minigame.answers
        );
      } else {
        this.answers = this.$store.state.livegame.minigame.answers;
      }
      this.answersUpdated = true;
    }
  }

  goNext(): void {
    this.$store.dispatch("readyForNext");
    this.answersUpdated = false;
  }
}
</script>

<style lang="scss">
.ui-result,
.ui-valid {
  margin: auto;
}
.ui-question {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>
