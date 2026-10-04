import React, { useState } from 'react';
import { X, Copy, Check, Share2, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { LieResponse } from '../types';

interface LieCardModalProps {
  lie: LieResponse;
  question: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LieCardModal: React.FC<LieCardModalProps> = ({
  lie,
  question,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const serialNumber = `USO-800-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopyText = async () => {
    const textToCopy = `【100%嘘だとわかる珍説証明書】
Q. ${question}
A. ${lie.headline}

${lie.story}

📁 根拠資料: ${lie.bogusProof}
🎯 虚偽純度: 100.00%（真実度: 0.00%）
発行: 国際ウソ八百学術審査委員会
#ホラフキンAI #100パーセント嘘`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-amber-50 rounded-2xl border-4 border-amber-900 shadow-2xl overflow-hidden p-6 text-amber-950"
        style={{
          backgroundImage:
            'radial-gradient(#d97706 0.75px, transparent 0.75px), radial-gradient(#d97706 0.75px, #fffbeb 0.75px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Decor */}
        <div className="border-2 border-dashed border-amber-800/40 rounded-xl p-5 relative bg-amber-50/90 shadow-inner">
          {/* Header of Certificate */}
          <div className="text-center mb-4 pb-3 border-b-2 border-amber-900/20">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-red-600 uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>OFFICIAL CERTIFIED FABRICATION</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-amber-950 tracking-tight">
              100%嘘八百 認定証明書
            </h2>
            <div className="flex items-center justify-center gap-3 text-[11px] text-amber-800 font-mono mt-1">
              <span>登録番号: {serialNumber}</span>
              <span>·</span>
              <span>真実混入率: 0.00%</span>
            </div>
          </div>

          {/* Question Tag */}
          <div className="mb-3 bg-amber-200/60 p-2.5 rounded-lg border border-amber-300 text-xs">
            <span className="font-bold text-amber-900">【審議テーマ】: </span>
            <span className="font-medium text-amber-950">{question}</span>
          </div>

          {/* Headline */}
          <div className="mb-4">
            <h3 className="font-display text-lg sm:text-xl text-amber-950 leading-snug bg-amber-300/40 p-2 rounded-md border-l-4 border-red-600">
              {lie.headline}
            </h3>
          </div>

          {/* Story */}
          <div className="text-sm leading-relaxed text-amber-950/90 mb-4 whitespace-pre-wrap">
            {lie.story}
          </div>

          {/* Bogus Proof Box */}
          <div className="bg-amber-100/80 p-3 rounded-lg border border-amber-300/80 text-xs mb-4">
            <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>提出された架空証拠・珍説原典:</span>
            </div>
            <p className="text-amber-950 italic">{lie.bogusProof}</p>
          </div>

          {/* The Big Red Stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-900/20 text-xs text-amber-900 font-mono">
            <div>
              <p className="font-bold">発行元: 国際ウソ八百学術審査委員会</p>
              <p className="text-[10px] text-amber-800">審査官: ホラフキン総裁印</p>
            </div>
            <div className="border-4 border-red-600 text-red-600 font-display text-base sm:text-lg px-3 py-1 rounded-md rotate-[-8deg] shadow-sm select-none">
              100% 嘘八百
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>コピーしました！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>SNS用にテキストコピー</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-xl font-bold text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
