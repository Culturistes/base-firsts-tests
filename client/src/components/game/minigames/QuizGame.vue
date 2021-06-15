<template>
  <div
    v-if="$store.state.livegame.minigame.type === 'quiz'"
    class="minigame mg-quiz"
  >
    <RoundList :result="$store.state.player.answersRecord" />
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
        <StarBtn @click="sendAnswer">Valider</StarBtn>
      </div>
    </div>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <StarBtn v-on:click="goNext">Suivant</StarBtn>
    </div>
  </div>
  <div class="minigame mg-lme" v-else>
    <RoundList :result="$store.state.player.answersRecord" />
    <div class="ui-question">
      <Picture
        :selected="
          selectedAnswer === 0 &&
          $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
        "
        :right="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
          false
          /* MAEL : A la place de true/false, retourner si la réponse à gagné ou pas*/
        "
        :showAnswer="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT
        "
        :respondedNumber="
          3 /*MAEL : récuperer le nombre de personne qui a répondu à cette réponse*/
        "
        @click="
          () => {
            if (
              this.$store.state.livegame.currentStep !==
              steps.MINI_GAME_ROUND_RESULT
            ) {
              this.selectedAnswer = 0;
              sendAnswer();
            }
          }
        "
        >{{ answers[0] }}
        <span
          v-if="
            $store.state.livegame.minigame.type == 'lme' &&
            $store.state.livegame.jokersParams.showOthersChoice
          "
        >
          | {{ actualLMEAnswers[0] }}
        </span></Picture
      >
      <VSStamp />
      <Picture
        :selected="
          selectedAnswer === 1 &&
          $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
        "
        :right="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
          true
          /* MAEL : A la place de true/false, retourner si la réponse à gagné ou pas*/
        "
        :showAnswer="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT
        "
        :respondedNumber="
          3 /*MAEL : récuperer le nombre de personne qui a répondu à cette réponse*/
        "
        @click="
          () => {
            if (
              this.$store.state.livegame.currentStep !==
              steps.MINI_GAME_ROUND_RESULT
            ) {
              this.selectedAnswer = 1;
              sendAnswer();
            }
          }
        "
        color="rose"
        >{{ answers[1] }}
        <span
          v-if="
            $store.state.livegame.minigame.type == 'lme' &&
            $store.state.livegame.jokersParams.showOthersChoice
          "
        >
          | {{ actualLMEAnswers[1] }}
        </span></Picture
      >
    </div>
    <!-- <div
      class="ui-valid"
      v-if="
        selectedAnswer != null &&
        $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
      "
    >
      <StarBtn @click="sendAnswer">Valider</StarBtn>
    </div> -->

    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <StarBtn v-on:click="goNext">Suivant</StarBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex";
import store from "@/store";
import StoreState from "@/interfaces/StoreState";
import { STEPS } from "../../../views/Game.vue";
import { watchEffect } from "@vue/runtime-core";

@Options({})
export default class QuizGame extends Vue {
  // Type : 'quiz' for the Quiz || 'lme' for La Majorité L'emporte

  $store!: Store<StoreState>;

  steps = STEPS;

  answers: any = [];
  selectedAnswer = null;
  answersUpdated = false;

  actualLMEAnswers = [0, 0];

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
    let datas = {};
    if (this.$store.state.livegame.minigame.type == "quiz") {
      datas = {
        selectedSAnswer: this.selectedAnswer,
      };
    } else {
      datas = {
        selectedNAnswer: this.selectedAnswer,
      };
    }

    this.$store.commit("updateLiveGame", {
      index: "minigame",
      value: {
        ...this.$store.state.livegame.minigame,
        chosenAnswer: datas,
      },
    });

    this.$store.dispatch("readyForNext", {
      chosenAnswer: datas,
    });
  }

  mounted(): void {
    console.log("quiz mounted");
    if (this.$store.state.livegame.minigame.type == "quiz") {
      this.answers = this.shuffle(this.$store.state.livegame.minigame.answers);
      this.$store.commit("updateMinigame", {
        index: "answers",
        value: this.answers,
      });
    } else {
      this.answers = this.$store.state.livegame.minigame.answers;
    }

    store.watch(
      () => this.$store.state.livegame.minigame.answers,
      (answers, oldVal) => {
        if (answers.length < 4) {
          this.answers = answers;
        }
      }
    );

    store.watch(
      () => this.$store.state.livegame.jokersParams.showOthersChoice,
      (value, oldVal) => {
        if (value) {
          this.calculateLMEAnswers();
        }
      }
    );

    store.watch(
      () => this.$store.state.players,
      (players, oldVal) => {
        if (
          this.$store.state.livegame.minigame.type == "lme" &&
          this.$store.state.livegame.jokersParams.showOthersChoice
        ) {
          this.calculateLMEAnswers();
        }
      }
    );
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
    this.$store.commit("updateJokersParams", {
      index: "showOthersChoice",
      value: false,
    });
  }

  calculateLMEAnswers(): void {
    let datas: Array<number> = [0, 0];
    this.$store.state.players.forEach((player) => {
      if (player.chosenAnswer.selectedNAnswer != undefined) {
        datas[player.chosenAnswer.selectedNAnswer] += 1;
      }
    });
    this.actualLMEAnswers = datas;
    console.log(this.actualLMEAnswers);
  }
}
</script>

<style lang="scss">
.mg-quiz {
  .ui-result,
  .ui-valid {
    margin: auto;
  }
  .ui-question {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.mg-lme {
  .ui-question {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
