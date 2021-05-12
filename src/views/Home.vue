<template>
  <div class="home">
    <JoinOrCreate msg="wsh" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import JoinOrCreate from "@/components/game/JoinOrCreate.vue"; // @ is an alias to /src

@Options({
  components: {
    JoinOrCreate,
  },
})
export default class Home extends Vue {}
</script>
