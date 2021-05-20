<template>
  <div>
    <p>{{ question.title }}</p>
    <button
      :key="i"
      v-for="(answer, i) in question.answers"
      @click="selectAnswer(i)"
    >
      {{ $filters.hideDollar(answer) }}
    </button>
    <div v-if="selectedAnswer.length > 0">
      <p>{{ $filters.hideDollar(selectedAnswer) }}</p>
      <button>Valider</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({})
export default class QuizGame extends Vue {
  // Type : 'quiz' for the Quiz || 'lme' for La Majorité L'emporte
  type = "lme";
  question = {
    title: "Ces deux caps font face à l'Angleterre. Quels sont-ils ?",
    answers: [
      "Le Cap Horn et le Cap de Bonne-Espérance",
      "Le Cap Gros-Nez et le Cap Grand-Nez",
      "$Le Cap Gris-Nez et le Cap Blanc-Nez",
      "Le Cap-Acité et le Cap-Able",
    ],
    description: null,
  };
  selectedAnswer = "";

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

  selectAnswer(i: number) {
    this.selectedAnswer = this.question.answers[i];
    console.log(this.selectedAnswer);
  }

  mounted(): void {
    this.question.answers = this.shuffle(this.question.answers);
  }
}
</script>
