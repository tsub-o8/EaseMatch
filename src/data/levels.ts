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
    title: 'Ease In', 
    description: 'ゆっくり動き出し、加速して終わる',
    answer: [0.42, 0.0, 1.0, 1.0] 
  },
  { 
    id: 2, 
    title: 'Ease Out', 
    description: '速く動き出し、ゆっくり止まる',
    answer: [0.0, 0.0, 0.58, 1.0] 
  },
  { 
    id: 3, 
    title: 'Ease In Out', 
    description: '滑らかに加速し、滑らかに減速する',
    answer: [0.42, 0.0, 0.58, 1.0] 
  },
  { 
    id: 4, 
    title: 'Bouncy', 
    description: '勢いよく飛び出し、バウンドするように止まる',
    answer: [0.17, 0.67, 0.83, 0.67] 
  },
];