<script setup lang="ts">
  import {ref, computed, onMounted, nextTick} from 'vue';
  import { levels } from '../data/levels';
  import BezierEditor from './BezierEditor.vue';
  import PreviewStage from './PreviewStage.vue';

  // レベル管理
  const currentLevelIndex = ref(0);
  const currentLevel = computed(() => levels[currentLevelIndex.value]);

  // ユーザーの入力データ
  const userEasing = ref('cubic-bezier(0.25, 0.25, 0.75, 0.75)');
  const userPoints = ref({ p1: {x:0.25, y:0.25}, p2: {x:0.75, y:0.75} });

  // アニメーション制御
  const isUserMoved = ref(false);
  const isGhostMoved = ref(false);
  const isAnimating = ref(false);

  // ゲームの状態
  const isMatching = ref(false);
  const score = ref<number | null>(null);
  const displayScore = ref(0);

  // エディタに渡す正解データ
  const showAnswerData = ref<[number, number, number, number] | null>(null);

  // 正解データ
  const targetEasing = computed(() => {
    const answer = currentLevel.value?.answer ?? [0,0,1,1];
    const [x1, y1, x2, y2] = answer;
    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
  });

  // --- ロジック ---
  // リセット
  const resetAnimation = () => {
    isUserMoved.value = false;
    isGhostMoved.value = false;
  };

  const resetState = () => {
    resetAnimation();
    score.value = null;
    isMatching.value = false;
    showAnswerData.value = null;
    isAnimating.value = false
  }

  // Playボタン
  const playUser = () => {
    if (isAnimating.value) return;

    isMatching.value = false;
    isAnimating.value = true;

    resetAnimation();

    setTimeout(() => {
      isUserMoved.value = true;
      isGhostMoved.value = true;
    }, 50)
  }
  
  // Matchボタン
  const playMatch = () => {
    if (isMatching.value) return;
    
    resetAnimation();
    isMatching.value = true;
    isAnimating.value = true;
    
    setTimeout(() => {
      isUserMoved.value = true;
      isGhostMoved.value = true;
    }, 50);
  };

  // アニメーション終了時
  const onAnimationEnd = () => {

    isAnimating.value = false;

    if (isMatching.value) {
      calculateScore();
      showAnswerData.value = currentLevel.value?.answer ?? null;
      return;
    }
  };

  // ボタンが押された時の処理
  const handleMainAction = () => {
    if (score.value === null) {
      playMatch();
    } else {
      goNextLevel();
    }
  }  

  // エディタ更新
  const handleUpdate = (payload: any) => {
    userEasing.value = payload.cssValue;
    userPoints.value = { p1: payload.p1, p2: payload.p2};

    if (score.value !== null) { isMatching.value = false; }
  };

  // レベル切り替え
  const nextLevel = () => {
    if (currentLevelIndex.value < levels.length - 1) {
      currentLevelIndex.value ++;
      resetState();
    }
  };
  // Nextボタン
  const goNextLevel = () => { nextLevel(); }

  const prevLevel = () => {
    if (currentLevelIndex.value > 0) {
      currentLevelIndex.value--;
      resetState();
    }
  };

  // Scoreのアニメーション表示
  const animateScore = (targetScore: number) => {
    displayScore.value = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      const ease = 1 - Math.pow(1 - progress, 4);
      
      displayScore.value = Math.round(targetScore * ease);
      
      if (progress < 1.0) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  };



  // --- 採点ロジック ---
  const calculateScore = () => {
    const ans = currentLevel.value?.answer ?? [0,0,1,1];
    const usr = userPoints.value;

    const samples = 30;
    let totalError = 0;

    for (let i = 0; i <= samples; i++) {
      const x = i / samples;

      // 正解のY
      const targetY = solveBezierY(x, ans[0], ans[1], ans[2], ans[3]);
      // ユーザーのY
      const userY   = solveBezierY(x, usr.p1.x, usr.p1.y, usr.p2.x, usr.p2.y);

      // ズレを絶対値で足していく
      totalError += Math.abs(targetY - userY);
    }

    // 平均誤差を計算
    const averageError = totalError / (samples + 1);

    // 点数計算
    const rawScore = Math.max(0, 100 - (averageError * 400));
    const finalScore =  Math.round(rawScore);

    score.value = finalScore;
    animateScore(finalScore)
  };

  // 3次ベジェ曲線の公式
  const getBezierCoord = (t: number, p1: number, p2: number): number => {
    const oneMinusT = 1 - t;
    return 3 * oneMinusT * oneMinusT * t * p1 + 
          3 * oneMinusT * t * t * p2 + 
          t * t * t;
  };

  // X(時間)から t(媒介変数) を逆算する関数
  const getTforX = (x: number, p1x: number, p2x: number): number => {
    let lower = 0;
    let upper = 1;
    let t = x; // 初期推測値

    // 2分探索法で近似値を探す
    for (let i = 0; i < 10; i++) {
      const currentX = getBezierCoord(t, p1x, p2x);
      if (Math.abs(currentX - x) < 0.001) return t;
      if (currentX < x) {
        lower = t;
      } else {
        upper = t;
      }
      t = (lower + upper) / 2;
    }
    return t;
  };

  // 指定したX(時間)におけるY(進行度)を取得する関数
  const solveBezierY = (x: number, p1x: number, p1y: number, p2x: number, p2y: number): number => {
    const t = getTforX(x, p1x, p2x);
    return getBezierCoord(t, p1y, p2y);
  };
</script>

<template>
  <div class="game-view" v-if="currentLevel">
    <div class="level-nav">
      <button class="nav-btn" @click="prevLevel" :disabled="currentLevelIndex === 0">◀</button>
      <div class="level-info">
        <h1 class="level-title">{{ currentLevel.title }}</h1>
        <p class="level-desc">{{ currentLevel.description }}</p>
      </div>
      <button class="nav-btn" @click="nextLevel" :disabled="currentLevelIndex === levels.length - 1">▶</button>
    </div>

    <div class="preview-area">
      <PreviewStage
      :user-easing="userEasing"
      :target-easing="targetEasing"
      :is-user-moved="isUserMoved"
      :is-ghost-moved="isGhostMoved"
      :score="score"
      @animation-end="onAnimationEnd"
      />

      <div class="score-bar">
        <span class="score-label" v-if="score !== null">Match Rate</span>
        <span class="score-val" v-if="score !== null">{{ displayScore }}<small>%</small></span>
      </div>
    </div>
    

    <div class="tool-bar">
      <button class="tool-btn play-btn" @click="playUser" :disabled="isAnimating" title="Play">
        <svg viewBox="0 0 24 24" class="play-svg">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <button class="tool-btn match-btn" :class="{ 'is-next': score !== null }" :disabled="isAnimating && score === null" @click="handleMainAction">
        <svg v-if="score === null" viewBox="0 0 24 24" class="icon-svg">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        
        <svg v-else viewBox="0 0 24 24" class="icon-svg">
          <path d="M4 12h12.17l-3.59 3.59L14 17l6-6-6-6-1.41 1.41L16.17 10H4v2z" />
        </svg>
      </button>
    </div>

    <div class="editor-area">
      <BezierEditor @update="handleUpdate" :answer="showAnswerData"/>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.game-view {
  width: 100%; height: 100dvh;
  overflow: hidden;
  display: flex; flex-direction: column;
  background: var(--c-bg-app);
}

/* --- エリア定義 --- */
.level-nav {
  height: 60px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--c-bg-app);
  
  gap: 20px; padding: 0 20px;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--c-text);
  cursor: pointer;
  font-size: 1.2rem;

  &:disabled { opacity: 0.3; cursor: default; }
  &:hover:not(:disabled) { color: var(--c-primary); }
}

.level-info {
  text-align: center;
  line-height: 80%;
  min-width: 200px;

  .level-title { font-weight: bold; font-size: 1.2rem; letter-spacing: 0.04rem;}
  .level-desc { margin: 0; font-size: 0.8rem; color: var(--c-guide); }
}

.preview-area {
  flex: 5;
  min-height: 0;
  background: var(--c-bg-app);
  position: relative;
}

// スコアバー
.score-bar {
  width: 100%; height: 100px;
  position: absolute; bottom: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin: 0;
}

.score-label {
  font-size: 0.9rem; color: var(--c-guide);
  margin-bottom: -5px;
}

.score-val {
  font-size: 4rem; font-weight: bold; color: var(--c-primary);
  small { font-size: 2rem; }
}

//　ツールバー
.tool-bar {
  height: 72px;
  flex-shrink: 0;
  background: var(--c-bg-panel);
  // border-bottom: 1px solid var(--c-guide);
  display: flex; align-items: center; justify-content: center; gap: 20px;

  @media (max-width: 600px) {
    height: 60px;
    gap: 15px;
  }
}

.tool-btn {
  border: none; border-radius: 50%;
  font-family: inherit; font-weight: bold; font-size: 1rem;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.play-svg {
  width: 50%; height: 50%;
  fill: currentColor;
}

.icon-svg {
  width: 50%; height: 50%;
  fill: currentColor;
}

/* Playボタン  */
.play-btn {
  width: 4rem; height: 4rem;
  background: transparent; border: none; color: var(--c-text);
  padding: 0;
  gap: 8px;
}

/* Matchボタン */
.match-btn {
  width: 3rem; height: 3rem;
  background: var(--c-text); color: #000;
  padding: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.4);
    background: #fff;
  }
}

/* Next状態のボタン */
.match-btn.is-next {
  background: var(--c-primary); color: #000;
  &:hover:not(:disabled) {
    box-shadow: 0 0 15px var(--c-primary);
  }
}

.editor-area {
  flex: 5;
  min-height: 0;
  padding: 10px;
  background: var(--c-bg-canvas);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  z-index: 0;
}
</style>