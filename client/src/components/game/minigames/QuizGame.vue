<template>
  <div
    v-if="$store.state.livegame.minigame.type === 'quiz'"
    class="minigame mg-quiz"
  >
    <RoundList :result="$store.state.player.answersRecord" />
    <p class="number-question">
      Question {{ $store.state.livegame.currentRound }}
    </p>
    <QuizBlock class="question" :isTimer="true">{{
      $store.state.livegame.minigame.title
    }}</QuizBlock>
    <div class="ui-question">
      <QuizBlock
        :key="i"
        v-for="(answer, i) in answers"
        @click="sendAnswer(i)"
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
        :halfOpacited="
          selectedAnswer !== answer &&
          selectedAnswer !== i.toString() &&
          (($store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT &&
            !$store.state.livegame.minigame.goodAnswer.content.includes(
              answer
            )) ||
            isBadAnswer(answer))
        "
      >
        {{ hideHashtag($filters.hideDollar(answer)) }}
      </QuizBlock>

      <!-- <div
        class="ui-valid"
        v-if="
          selectedAnswer != null &&
          $store.state.livegame.currentStep !== steps.MINI_GAME_ROUND_RESULT
        "
      >
        <StarBtn @click="sendAnswer" :valid="$store.state.player?.isReady"
          >Valider</StarBtn
        >
      </div> -->
    </div>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <StarBtn v-on:click="goNext" :valid="$store.state.player?.isReady"
        >Suivant</StarBtn
      >
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
          $store.state.livegame.minigame.goodAnswer.content[0] != undefined &&
          $store.state.livegame.minigame.goodAnswer.content[0].id == 0
        "
        :showAnswer="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT ||
          $store.state.livegame.jokersParams.showOthersChoice
        "
        :respondedNumber="actualLMEAnswers[0]"
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
          ($store.state.livegame.minigame.goodAnswer.content[1] != undefined ||
            ($store.state.livegame.minigame.goodAnswer.content[0] !=
              undefined &&
              $store.state.livegame.minigame.goodAnswer.content[0].id == 1))
          /* MAEL : A la place de true/false, retourner si la réponse à gagné ou pas*/
        "
        :showAnswer="
          $store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT ||
          $store.state.livegame.jokersParams.showOthersChoice
        "
        :respondedNumber="actualLMEAnswers[1]"
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
      <StarBtn v-on:click="goNext" :valid="$store.state.player?.isReady"
        >Suivant</StarBtn
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex";
import store from "@/store";
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

  answerSoundPlayed = false;

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

  isBadAnswer(word: string) {
    return word.slice(0, 1) == "#";
  }

  hideHashtag(word: string) {
    if (word.slice(0, 1) == "#") {
      return word.substring(1);
    } else {
      return word;
    }
  }

  sendAnswer(i: number) {
    if (
      this.$store.state.livegame.currentStep !==
        this.steps.MINI_GAME_ROUND_RESULT &&
      this.$store.state.livegame.minigame.type == "quiz"
    ) {
      this.selectedAnswer = this.answers[i];
    }

    let datas = {};
    if (this.$store.state.livegame.minigame.type == "quiz") {
      this.$store.state.sounds.quiz_choix.howl.play();
      datas = {
        selectedSAnswer: this.selectedAnswer,
      };
    } else {
      this.$store.state.sounds.lme_like.howl.play();
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
      () => this.$store.state.livegame.minigame.goodAnswer,
      (value, oldVal) => {
        if (value) {
          let { content } = value;
          //console.log(content, content[0], content[1]);
          if (content[0] != undefined && content[1] != undefined) {
            this.actualLMEAnswers = [content[0].number, content[1].number];
          } else if (content[0] != undefined && content[0].id === 0) {
            this.actualLMEAnswers = [
              content[0].numbers[0],
              content[0].numbers[1],
            ];
          } else if (content[0] != undefined && content[0].id === 1) {
            this.actualLMEAnswers = [
              content[0].numbers[1],
              content[0].numbers[0],
            ];
          }
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
      this.answerSoundPlayed = false;
      this.selectedAnswer = null;
      console.log(this.$store.state.livegame.minigame.answers);
      if (this.$store.state.livegame.minigame.type == "quiz") {
        this.answers = this.shuffle(
          this.$store.state.livegame.minigame.answers
        );
      } else {
        this.answers = this.$store.state.livegame.minigame.answers;
        this.actualLMEAnswers = [0, 0];
      }
      this.answersUpdated = true;
    } else if (
      this.$store.state.livegame.currentStep ==
      this.steps.MINI_GAME_ROUND_RESULT
    ) {
      if (
        this.$store.state.livegame.minigame.type == "quiz" &&
        !this.answerSoundPlayed
      ) {
        this.answerSoundPlayed = true;
        let item =
          this.$store.state.player.answersRecord[
            this.$store.state.player.answersRecord.length - 1
          ];

        if (item.isGood) {
          this.$store.state.sounds.quiz_bonne_reponse.howl.play();
        } else {
          this.$store.state.sounds.quiz_mauvaise_reponse.howl.play();
        }
      }
    }
  }

  goNext(): void {
    this.$store.dispatch("readyForNext");
    this.answersUpdated = false;
    this.$store.state.sounds.cta.howl.play();
  }

  calculateLMEAnswers(): void {
    let datas: Array<number> = [0, 0];
    this.$store.state.players.forEach((player) => {
      if (
        player.chosenAnswer != null &&
        player.chosenAnswer.selectedNAnswer != undefined
      ) {
        datas[player.chosenAnswer.selectedNAnswer] += 1;
      }
    });
    this.actualLMEAnswers = datas;
    /* console.log(this.actualLMEAnswers); */
  }
}
</script>

<style lang="scss">
.mg-quiz {
  max-width: 625px;
  .ui-result,
  .ui-valid {
    margin: auto;
  }
  .number-question {
    max-width: 130px;
    font-size: 1.4rem;
    font-family: $btnFont;
    padding: 12px 20px;

    border-radius: 6px;

    background-color: $color3;

    display: block;
    margin: auto;
    margin-bottom: 10px;
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
