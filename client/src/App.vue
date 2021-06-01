<template>
  <div class="app">
    <router-view />

    <Debug />
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import Debug from "@/components/Debug.vue";

@Options({
  components: { Debug },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
}
</style>
