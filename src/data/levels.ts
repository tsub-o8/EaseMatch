// --- 型定義 ---
export interface Level {
  id: number;
  title: string;
  description: string;
  answer: [number, number, number, number]; //正解のベジエ曲線データ
}

export const levels: Level[] = [
  { 
    id: 1, 
    title: "Ease",
    description: "自然な加速と減速。",
    answer: [0.25, 0.0, 0.75, 1.0]
  },
  { 
    id: 2, 
    title: "Ease In",
    description: "ゆっくり始まって加速する。",
    answer: [0.4, 0.0, 1.0, 0.6]
  },
  { 
    id: 3, 
    title: "Ease Out",
    description: "素早く登場し、ふわりと着地する。",
    answer: [0.0, 0.4, 0.6, 1.0]
  },
  { 
    id: 4, 
    title: "Sharp Switch",
    description: "キレのある動き。中間を一瞬で駆け抜ける。",
    answer: [0.8, 0.0, 0.2, 1.0]
  },
  { 
    id: 5, 
    title: "Material UI",
    description: "モダンなアプリの挙動。反応は早く、余韻は長く。",
    answer: [0.2, 0.0, 0.2, 1.0]
  },
  { 
    id: 6, 
    title: "Anticipation",
    description: "一度後ろに下がって勢いをつける。",
    answer: [0.3, -0.3, 1.0, 0.3]
  },
  { 
    id: 7, 
    title: "Overshoot",
    description: "勢いあまって通り過ぎ、少し戻ってくる。",
    answer: [0.0, 0.7, 0.7, 1.3]
  },
  { 
    id: 8, 
    title: "Sticky",
    description: "粘り気のある動き。ギリギリまで動かない。",
    answer: [1.0, 0.0, 0.8, 1]
  },
  { 
    id: 9, 
    title: "Gentle Sine",
    description: "主張しない、穏やかで柔らかい波のような動き。",
    answer: [0.45, 0.05, 0.55, 0.95]
  },
  { 
    id: 10, 
    title: "Elastic Snap",
    description: "大きく引いて、強烈に弾けるゴムのような動き。",
    answer: [0.7, -0.3, 0.3, 1.3]
  },
];