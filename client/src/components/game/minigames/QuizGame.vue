<template>
  <div class="minigame mg-quiz">
    <p>{{ $store.state.livegame.minigame.title }}</p>
    <div class="ui-question">
      <button
        :key="i"
        v-for="(answer, i) in answers"
        @click="
          () => {
            this.selectedAnswer =
              this.$store.state.livegame.minigame.type == 'quiz'
                ? this.answers[i]
                : i.toString();
          }
        "
      >
        {{ answer }}
        <!-- $filters.hideDollar(answer) -->
      </button>
      <div v-if="selectedAnswer != null">
        <p>{{ $filters.hideDollar(selectedAnswer) }}</p>
        <button @click="sendAnswer">Valider</button>
      </div>
    </div>
    <div
      class="ui-result"
      v-if="$store.state.livegame.currentStep == steps.MINI_GAME_ROUND_RESULT"
    >
      <p>Bonne réponse: {{ $store.state.livegame.minigame.goodAnswer }}</p>
      <button v-on:click="$store.dispatch('readyForNext')">Next</button>
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
    if (this.$store.state.livegame.minigame.type == "quiz") {
      this.answers = this.shuffle(this.$store.state.livegame.minigame.answers);
    } else {
      this.answers = this.$store.state.livegame.minigame.answers;
    }
  }
}
</script>
