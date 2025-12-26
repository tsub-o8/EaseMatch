<script setup lang="ts">
import GameView from './components/GameView.vue';
</script>

<template>
  <head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>EaseMatch</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
  </head>
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