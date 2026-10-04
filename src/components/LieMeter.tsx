import React from 'react';
import { Gauge, ShieldAlert, Zap } from 'lucide-react';

interface LieMeterProps {
  exaggeration: 'extreme' | 'cosmic';
  onChangeExaggeration: (level: 'extreme' | 'cosmic') => void;
  count: number;
}

export const LieMeter: React.FC<LieMeterProps> = ({
  exaggeration,
  onChangeExaggeration,
  count,
}) => {
  return (
    <div className="bg-amber-100/80 rounded-xl border border-amber-300 p-3 flex flex-wrap items-center justify-between gap-3 text-amber-950">
      {/* Visual meter */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 bg-amber-900 rounded-lg text-amber-100 shadow-inner">
          <Gauge className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-950">嘘八百メーター:</span>
            <span className="font-mono font-black text-sm text-red-600 bg-red-100 px-2 py-0.2 rounded border border-red-300">
              100.00% MAX
            </span>
          </div>
          <p className="text-[11px] text-amber-900/70">
            信じた被害者: <strong className="text-amber-950 font-mono">0人</strong> · 生まれた笑い: <strong className="text-amber-950 font-mono">{count * 3}笑い</strong>
          </p>
        </div>
      </div>

      {/* Exaggeration Level toggle */}
      <div className="flex items-center gap-1.5 bg-amber-200/70 p-1 rounded-lg border border-amber-300">
        <span className="text-[11px] font-bold text-amber-900 px-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-600" />
          <span>誇張度:</span>
        </span>
        <button
          type="button"
          onClick={() => onChangeExaggeration('extreme')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
            exaggeration === 'extreme'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-900 hover:text-amber-950'
          }`}
        >
          超誇張
        </button>
        <button
          type="button"
          onClick={() => onChangeExaggeration('cosmic')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
            exaggeration === 'cosmic'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-amber-900 hover:text-amber-950'
          }`}
        >
          宇宙規模 🌌
        </button>
      </div>
    </div>
  );
};
