import React from 'react';
import { LieGenre, GenreInfo } from '../types';

export const GENRES: GenreInfo[] = [
  {
    id: 'all',
    name: 'なんでもあり',
    emoji: '🎲',
    description: 'ジャンル不問！超ド級の荒唐無稽ホラ',
    accentColor: 'border-amber-400 text-amber-900 bg-amber-50',
  },
  {
    id: 'pseudoscience',
    name: '超屁理屈・偽科学',
    emoji: '🔬',
    description: 'ありもしない量子力学＆珍ノーベル物理学',
    accentColor: 'border-sky-400 text-sky-900 bg-sky-50',
  },
  {
    id: 'history',
    name: '歴史捏造・古代の闇',
    emoji: '📜',
    description: '教科書が隠した（存在しない）偉人の珍事件',
    accentColor: 'border-orange-400 text-orange-900 bg-orange-50',
  },
  {
    id: 'daily',
    name: '日常・生物の謎',
    emoji: '🐱',
    description: '身近な生き物や家電製品のトンデモ起源',
    accentColor: 'border-emerald-400 text-emerald-900 bg-emerald-50',
  },
  {
    id: 'excuse',
    name: '怒られない言い訳',
    emoji: '💼',
    description: '遅刻や宿題忘れを時空のせいにする命がけの弁明',
    accentColor: 'border-rose-400 text-rose-900 bg-rose-50',
  },
  {
    id: 'scifi',
    name: '壮大SF大風呂敷',
    emoji: '🚀',
    description: '銀河連邦との秘密協定・パラレルワールド関税',
    accentColor: 'border-purple-400 text-purple-900 bg-purple-50',
  },
];

interface GenreSelectorProps {
  selectedGenre: LieGenre;
  onSelectGenre: (genre: LieGenre) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenre,
  onSelectGenre,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
          <span>🌶️ ウソの味付け（ジャンル設定）:</span>
          <span className="text-amber-800/70 font-normal">
            {GENRES.find((g) => g.id === selectedGenre)?.description}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre.id;
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => onSelectGenre(genre.id)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-100/90 border-amber-600 shadow-sm ring-2 ring-amber-400/40 translate-y-[-1px]'
                  : 'bg-white/80 hover:bg-amber-50/70 border-amber-200/80 text-amber-900 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base select-none">{genre.emoji}</span>
                <span className="text-xs font-black leading-tight text-amber-950">
                  {genre.name}
                </span>
              </div>
              <p className="text-[10px] text-amber-900/70 line-clamp-1 leading-snug">
                {genre.description}
              </p>
              {isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
