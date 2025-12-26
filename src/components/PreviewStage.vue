<script setup lang="ts">
  // --- 型定義 ---
  interface Props {
    userEasing: string; // ユーザーのカーブ (CSS文字列)
    targetEasing: string; // 正解のカーブ (CSS文字列)

    isUserMoved: boolean;
    isGhostMoved: boolean;

    score: number | null;
  }

  defineProps<Props>(); // Props を定義

  // --- イベント定義 ---
  const emit = defineEmits<{(e: 'animation-end'): void}>();
</script>

<template>
  <div class="stage">

    <div class="track-container">
      <div 
        class="ball ghost"
        :class="{ 'moved': isGhostMoved }" 
        :style="{ transitionTimingFunction: targetEasing }"
      ></div>
      
      <div 
        class="ball user"
        :class="{ 'moved': isUserMoved }" 
        :style="{ transitionTimingFunction: userEasing }"
        @transitionend="emit('animation-end')"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // ステージ全体
  .stage {
    width: 100%;
    height: 100%;
    position: relative;
    background: var(--c-bg-app);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
   // トラック
  .track-container {
    position: relative;
    width: 85vw; height: 15vw;
    max-width: 600px; max-height: 60px;
    margin: 0 auto;
    z-index: 10;
  }

  // ボール共通設定
  .ball {
    width: auto; height: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%; 
    position: absolute; top: 0; left: 0;

    will-change: left, transform;
    transform: translateX(0);

    box-sizing: border-box;
    border: 2px dashed transparent;

    &.moved { 
      transition-duration: 1000ms; 
      left: 100%;
      transform: translateX(-100%);
    }
  }

  .user {
    background: var(--c-primary);
    z-index: 10;
    mix-blend-mode: screen;
    opacity: 0.9;
  }
  
  .ghost {
    border-color: var(--c-guide);
    background: var(--c-guide);
    z-index: 20;
    opacity: 0.3;
    z-index: 10;
  }

  /* スコア表示オーバーレイ */
.score-overlay {
  position: absolute; inset: 0; z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  opacity: 0.6;
  animation: fadeIn 0.3s ease;
}

.score-box {
  background: var(--c-bg-panel);
  border: 2px solid var(--c-primary);
  padding: 20px 40px;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}

.score-label {
  display: block; font-size: 0.9rem; color: var(--c-guide); margin-bottom: 5px;
}
.score-val {
  font-size: 3.5rem; font-weight: bold; color: var(--c-primary);
}

@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
</style>