import React from 'react';
import { Sparkles } from 'lucide-react';
import { LieGenre } from '../types';

interface PromptChipsProps {
  onSelectPrompt: (prompt: string, genre?: LieGenre) => void;
  currentGenre: LieGenre;
}

const SAMPLE_PROMPTS: Array<{ text: string; genre: LieGenre; label: string }> = [
  { text: '月って何で夜になると光るの？', genre: 'scifi', label: '🌕 月の光' },
  { text: '宿題を忘れた絶対に先生に怒られない言い訳', genre: 'excuse', label: '📝 宿題の言い訳' },
  { text: '猫が夜中に大運動会する本当の理由', genre: 'daily', label: '🐱 猫の深夜疾走' },
  { text: '世界で初めてラーメンを食べた歴史上の偉人', genre: 'history', label: '🍜 ラーメン起源' },
  { text: 'Wi-Fiの電波が目に見えない科学的理由', genre: 'pseudoscience', label: '📶 見えないWi-Fi' },
  { text: 'ピラミッドが三角になった大人の事情', genre: 'history', label: '🔺 ピラミッドの形' },
  { text: 'なぜ人間は月曜日の朝に猛烈に眠くなるの？', genre: 'pseudoscience', label: '😴 月曜の眠気' },
  { text: '会社に遅刻したときの誰も傷つけない宇宙的言い訳', genre: 'excuse', label: '⏰ 遅刻の弁明' },
  { text: 'あくびが他人にうつる真のメカニズム', genre: 'daily', label: '🥱 あくびの感染' },
  { text: 'サイコロの「1」の目だけ赤い理由', genre: 'history', label: '🎲 サイコロの赤' },
];

export const PromptChips: React.FC<PromptChipsProps> = ({
  onSelectPrompt,
  currentGenre,
}) => {
  // Sort prompts so those matching currentGenre come first
  const sorted = [...SAMPLE_PROMPTS].sort((a, b) => {
    if (a.genre === currentGenre && b.genre !== currentGenre) return -1;
    if (b.genre === currentGenre && a.genre !== currentGenre) return 1;
    return 0;
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
        <span>一発でっち上げテーマ（タップですぐに質問）:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-300">
        {sorted.slice(0, 7).map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.text, item.genre)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-medium transition-all hover:scale-102 active:scale-98 shadow-2xs flex items-center gap-1.5"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
