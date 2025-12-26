<script setup lang="ts">
  import {ref, computed, onMounted, onUnmounted} from 'vue';

  // --- 型定義 ---
  interface Point { x: number; y: number;}
  interface UpdatePayload { p1: Point; p2: Point; cssValue: string;}
  interface Props { answer? : [number, number, number, number] | null; };
  
  const props = defineProps<Props>();

  const emit = defineEmits<{(e: 'update', payload: UpdatePayload): void}>();


  // --- 値定義 ---
  const size = 200; // グラフ本体のサイズ
  const padding = 100; // 上下左右の余白サイズ
  const viewBoxSize = size + padding * 2;

  // 初期値
  const p1 = ref<Point>({x: 0.3, y: 0.0});
  const p2 = ref<Point>({x: 0.7, y: 1.0});

  // 現在ドラッグ中のハンドル名
  const draggingHandle = ref<'p1' | 'p2' | null>(null);

  // SVG要素への参照
  const svgRef = ref<SVGSVGElement | null>(null);

  // --- ヘルパー関数 ---
  // 数値(0~1)をSVG座標(0~200)に変換
  const toSvgX = (val: number): number => padding + (val * size);
  const toSvgY = (val: number): number => (padding + size) - (val * size);

  // 現在の値を計算して親コンポーネントへ通知する
  const emitUpdate = () => {
    emit('update', {
      p1: p1.value,
      p2: p2.value,
      cssValue: `cubic-bezier(${p1.value.x.toFixed(2)}, ${p1.value.y.toFixed(2)}, ${p2.value.x.toFixed(2)}, ${p2.value.y.toFixed(2)})`
    });
  };

  // --- マウス操作ロジック ---
  const startDrag = (handleName: 'p1' | 'p2', event: PointerEvent) => {

    event.preventDefault();
    event.stopPropagation();

    if (event.target instanceof Element) {
      event.target.setPointerCapture(event.pointerId);
    }

    draggingHandle.value = handleName;
  };
  const stopDrag = () => { draggingHandle.value = null };

  const onPointerMove = (event: PointerEvent) => {
    if (!draggingHandle.value || !svgRef.value) return;

    event.preventDefault();

    const rect = svgRef.value.getBoundingClientRect();

    // 画面上の1pxが、SVG内部の何単位に相当するか（スケール比率）を計算
    const scaleX = viewBoxSize / rect.width;
    const scaleY = viewBoxSize / rect.height;

    // マウス位置を「SVG内部座標」に変換
    const svgMouseX = (event.clientX - rect.left) * scaleX;
    const svgMouseY = (event.clientY - rect.top) * scaleY;

    let newX = (svgMouseX - padding) / size;
    let newY = ((padding + size) - svgMouseY) / size;

    // 0~1の範囲に収める
    newX = Math.max(0, Math.min(1, newX));
    newY = Math.max(-0.5, Math.min(1.5, newY));

    if (draggingHandle.value === 'p1') {
      p1.value = {x: newX, y:newY };
    } else {
      p2.value = {x: newX, y:newY};
    }

    emitUpdate();
  }

  // --- 算出プロパティ ---
  // 自分のカーブ
  const pathString = computed((): string => {
    const start = `${toSvgX(0)}, ${toSvgY(0)}`;
    const end = `${toSvgX(1)}, ${toSvgY(1)}`;
    const cp1 = `${toSvgX(p1.value.x)}, ${toSvgY(p1.value.y)}`;
    const cp2 = `${toSvgX(p2.value.x)}, ${toSvgY(p2.value.y)}`;

    return `M ${start} C ${cp1}, ${cp2}, ${end}`;
  });

  // 正解のカーブ
  const answerPathString = computed((): string => {
    if (!props.answer) return ''; // 正解データがなければ描画しない

    const [ax1, ay1, ax2, ay2] = props.answer;
    const start = `${toSvgX(0)}, ${toSvgY(0)}`;
    const end = `${toSvgX(1)}, ${toSvgY(1)}`;
    const cp1 = `${toSvgX(ax1)}, ${toSvgY(ay1)}`;
    const cp2 = `${toSvgX(ax2)}, ${toSvgY(ay2)}`;
    
    return `M ${start} C ${cp1}, ${cp2}, ${end}`;
  });

  // --- ライフサイクル ---
  onMounted (() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    
    emitUpdate();
  });
  
  onUnmounted (() => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDrag);
    window.removeEventListener('pointercancel', stopDrag);
  });
</script>

<template>
  <div class="editor-container">
    <div class="graph-wrapper">
      <svg
        ref="svgRef"
        :viewBox="`0 0 ${size + padding * 2} ${size + padding * 2}`"
        class="bezier-svg"
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--c-grid)" stroke-width="1"/>
          </pattern>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" style="pointer-events: none;"/>

        <line x1="0" :y1="toSvgY(0)" x2="100%" :y2="toSvgY(0)" class="base-line" />
        <line x1="0" :y1="toSvgY(1)" x2="100%" :y2="toSvgY(1)" class="base-line" />

        <!-- 自分のカーブ -->
        <path
          :d="pathString"
          class="main-curve"
        />

        <!-- 正解のカーブ -->
        <path 
          v-if="answerPathString" 
          :d="answerPathString" 
          class="answer-curve"
        />

        <!-- 自分のハンドル -->
        <line
          :x1="toSvgX(0)" :y1="toSvgY(0)"
          :x2="toSvgX(p1.x)" :y2="toSvgY(p1.y)"
          class="guide-line p1-guide"
        />
        <line
          :x1="toSvgX(1)" :y1="toSvgY(1)"
          :x2="toSvgX(p2.x)" :y2="toSvgY(p2.y)"
          class="guide-line p2-guide"
        />

        <circle
          :cx="toSvgX(p1.x)" :cy="toSvgY(p1.y)"
          r="6"
          class="handle p1"
          @pointerdown.prevent="startDrag('p1', $event)"
        />
        <circle
          :cx="toSvgX(p2.x)" :cy="toSvgY(p2.y)"
          r="6"
          class="handle p2"
          @pointerdown.prevent="startDrag('p2', $event)"
        />

        <!-- 正解のハンドル -->
        <g v-if="props.answer">
          <line
            :x1="toSvgX(0)" :y1="toSvgY(0)"
            :x2="toSvgX(props.answer[0])" :y2="toSvgY(props.answer[1])"
            class="answer-guide"
          />
          <line
            :x1="toSvgX(1)" :y1="toSvgY(1)"
            :x2="toSvgX(props.answer[2])" :y2="toSvgY(props.answer[3])"
            class="answer-guide"
          />

          <circle
            :cx="toSvgX(props.answer[0])" :cy="toSvgY(props.answer[1])"
            r="6"
            class="answer-handle"
          />
          <circle
            :cx="toSvgX(props.answer[2])" :cy="toSvgY(props.answer[3])"
            r="6"
            class="answer-handle"
          />
          </g>
      </svg>

      <!-- <div class="debug-info">
        <span class="label">cubic-bezier</span>
        <span class="val">{{ p1.x.toFixed(2) }}, {{ p1.y.toFixed(2) }}, {{ p2.x.toFixed(2) }}, {{ p2.y.toFixed(2) }}</span>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .editor-container{
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-sizing: border-box;
    padding: 10px;
    user-select: none; touch-action: none;

    min-height: 0;

    .graph-wrapper {
      width: 96%; height: 96%;
      aspect-ratio: 1 / 1;
      position: relative;
      touch-action: none;
    }

    .bezier-svg {
      width: 100%; height: 100%;
      display: block;
      background: transparent;
      border: none;
      overflow: visible;
      cursor: crosshair;
      touch-action: none;
    }

    .base-line {
      stroke: var(--c-text);
      stroke-width: 1px;
      opacity: 0.2;
      pointer-events: none;
    }

    .main-curve {
      stroke: var(--c-text);
      stroke-width: 4px;
      fill: none;
      pointer-events: none;
    }

    .guide-line {
      stroke-width: 3.2px;
      opacity: 0.6;
      pointer-events: none;
      &.p1-guide {stroke: var(--c-primary);}
      &.p2-guide {stroke: var(--c-secondary);}
    }

    .handle {
      cursor: grab;
      stroke: transparent;
      stroke-width: 16px;
      transition: r 0.15s ease;
      r: 8px;

      &:hover {r: 10px;}
      &:active{cursor: grabbing; r: 12px;}

      touch-action: none;

      &.p1 {fill: var(--c-primary);}
      &.p2 {fill: var(--c-secondary);}
    }

    .answer-curve {
      stroke: var(--c-secondary); /* 正解の色 */
      stroke-width: 4px;
      fill: none;
      opacity: 0.6;          /* 少し透けさせる */
      stroke-dasharray: 8px 8px; /* 点線にする */
      pointer-events: none;
    }

    .answer-guide {
      stroke: var(--c-secondary);
      stroke-width: 3.2px;
      stroke-dasharray: 8px 8px; /* 点線 */
      opacity: 0.5;
      pointer-events: none;
    }

    .answer-handle {
      fill: var(--c-secondary);
      r: 8px;
      opacity: 0.5;
      pointer-events: none;
    }     

    .debug-info {
      position: absolute;
      top: 100%; left: 0;
      width: 100%;
      margin-top: 15px;
      font-size: 0.6rem;
      letter-spacing: 0.05em;
      color: var(--c-guide);
      display: flex; justify-content: space-between;

      .val {
        color: var(--c-primary);
        font-weight: 700;
      }
    }
  }
</style>

