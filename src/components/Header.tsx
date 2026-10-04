import React from 'react';
import { Sparkles, BookOpen, Volume2, VolumeX, ShieldAlert, Award } from 'lucide-react';

interface HeaderProps {
  lieCount: number;
  onOpenCodex: () => void;
  savedCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lieCount,
  onOpenCodex,
  savedCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-amber-500/95 backdrop-blur-md text-amber-950 border-b-2 border-amber-600/30 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 bg-amber-900 rounded-xl flex items-center justify-center text-amber-100 shadow-inner overflow-hidden border border-amber-800">
            <span className="text-2xl select-none" role="img" aria-label="bot">
              🤥
            </span>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded-sm tracking-tighter">
              100%
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl text-amber-950 tracking-tight leading-none">
                ホラフキンAI
              </h1>
              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm rotate-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                全編ウソ八百
              </span>
            </div>
            <p className="text-xs text-amber-900/80 font-medium">
              真実度0.00%・絶対に信じてはいけないエンタメ珍説AI
            </p>
          </div>
        </div>

        {/* Right side widgets & controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Lie Purity Tag */}
          <div className="hidden md:flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 shadow-xs">
            <Award className="w-4 h-4 text-amber-700" />
            <span>虚偽純度:</span>
            <span className="font-mono text-red-600 font-bold tracking-tight">100.00%</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? '音声をオフにする' : '音声をオンにする'}
            className="p-2 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors border border-amber-300 flex items-center gap-1.5 text-xs font-bold"
            title={soundEnabled ? '朗読音声：ON' : '朗読音声：OFF'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-900" />
                <span className="hidden sm:inline">音声 ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">音声 OFF</span>
              </>
            )}
          </button>

          {/* Saved Codex Button */}
          <button
            onClick={onOpenCodex}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-amber-50 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>ウソ図鑑</span>
            {savedCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
