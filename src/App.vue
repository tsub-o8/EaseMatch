<script setup lang="ts">
import GameView from './components/GameView.vue';
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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