<template>
  <div class="home">
<<<<<<< HEAD
    <JoinOrCreate msg="wsh" />
=======
    <router-link to="/game">Go to the game</router-link>
>>>>>>> develop
  </div>
</template>

<script lang="ts">
<<<<<<< HEAD
import { Options, Vue } from "vue-class-component";
import JoinOrCreate from "@/components/JoinOrCreate.vue"; // @ is an alias to /src

@Options({
  components: {
    JoinOrCreate,
  },
})
=======
import { Vue } from "vue-class-component";

>>>>>>> develop
export default class Home extends Vue {}
</script>
