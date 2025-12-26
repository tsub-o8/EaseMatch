<script setup lang="ts">
import GameView from './components/GameView.vue';
</script>

<template>
  <main>
    <GameView />
  </main>
</template>

<style lang="scss">
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>