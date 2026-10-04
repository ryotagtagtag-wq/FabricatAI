import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Info,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { ChatMessage, LieResponse } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  questionContext?: string;
  onOpenCard: (lie: LieResponse, question: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onToggleFavorite: (id: string) => void;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  questionContext = '',
  onOpenCard,
  onSelectPrompt,
  onToggleFavorite,
  isSpeaking,
  onSpeak,
  onStopSpeak,
}) => {
  const [showTruth, setShowTruth] = useState(false);
  const [copied, setCopied] = useState(false);

  // If user message
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-[85%] sm:max-w-[75%] bg-amber-900 text-amber-50 rounded-2xl rounded-tr-xs px-4 py-3 shadow-md border border-amber-800">
          <p className="text-sm font-medium leading-relaxed">{message.content}</p>
          <div className="text-[10px] text-amber-300/70 text-right mt-1 font-mono">
            質問者
          </div>
        </div>
      </div>
    );
  }

  // Assistant message with LieResponse
  const lie = message.lieData;
  if (!lie) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%] bg-white rounded-2xl p-4 shadow-sm border border-amber-200 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${lie.headline}\n\n${lie.story}\n\n【根拠】${lie.bogusProof}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border-2 border-amber-300/80 overflow-hidden text-amber-950">
        {/* Card Top Banner / Tabloid Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-3 border-b-2 border-amber-600 flex flex-wrap items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">🎭</span>
            <span className="font-black text-xs uppercase tracking-wider text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300">
              {lie.flavorName || '超ド級ホラ話'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Lie Purity Tag */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-950 text-white px-2.5 py-0.8 rounded shadow-xs">
              <span className="text-red-400">ホラ度:</span>
              <span className="text-red-300 font-black">100%</span>
            </div>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(message.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                message.isFavorite
                  ? 'text-amber-700 bg-amber-200'
                  : 'text-amber-900/60 hover:text-amber-950 hover:bg-amber-300/60'
              }`}
              title="お気に入りに追加"
            >
              <Star className={`w-4 h-4 ${message.isFavorite ? 'fill-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 relative">
          {/* Outrageous Big Stamp in background */}
          <div className="absolute top-4 right-4 sm:right-6 pointer-events-none select-none z-10 opacity-90 animate-stamp">
            <div className="border-4 border-red-600 text-red-600 font-display text-sm sm:text-base px-2.5 py-1 rounded tracking-tight shadow-md bg-white/70 backdrop-blur-2xs">
              認定：100% 嘘八百
            </div>
          </div>

          {/* Headline */}
          <div className="mb-4 pr-24 sm:pr-32">
            <h2 className="font-display text-lg sm:text-xl text-amber-950 leading-snug tracking-tight">
              {lie.headline}
            </h2>
          </div>

          {/* Story prose */}
          <div className="text-sm sm:text-base leading-relaxed text-slate-800 font-medium mb-5 whitespace-pre-line bg-amber-50/60 p-4 rounded-xl border border-amber-200/70">
            {lie.story}
          </div>

          {/* Bogus Proof Box */}
          <div className="mb-4 bg-amber-100/70 border-l-4 border-amber-600 p-3 rounded-r-lg text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
              <Award className="w-4 h-4 text-amber-700 shrink-0" />
              <span>提出された架空の根拠・学術資料:</span>
            </div>
            <p className="text-amber-950 italic pl-5">{lie.bogusProof}</p>
          </div>

          {/* Truth Debunk Spoiler Accordion */}
          <div className="mb-4">
            <button
              onClick={() => setShowTruth(!showTruth)}
              className="flex items-center justify-between w-full p-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-950 text-xs font-bold transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>【種明かし】一応の現実・正しい真実を見る（真実度0%との落差）</span>
              </div>
              {showTruth ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTruth && (
              <div className="p-3 bg-sky-100/60 border border-t-0 border-sky-200 rounded-b-lg text-xs leading-relaxed text-sky-950 animate-in fade-in duration-200">
                <span className="font-bold text-sky-900">※現実の真相: </span>
                {lie.truthFact}
              </div>
            )}
          </div>

          {/* Follow-up question chips */}
          {lie.followUps && lie.followUps.length > 0 && (
            <div className="mb-4 pt-3 border-t border-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>さらに問い詰めてみる？（追及プロンプト）:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lie.followUps.map((question, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => onSelectPrompt(question)}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 rounded-lg border border-amber-300 font-medium transition-colors text-left flex items-center gap-1 active:scale-98"
                  >
                    <span>👉 {question}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-amber-200 gap-2">
            <div className="flex items-center gap-2">
              {/* Narration Button */}
              <button
                onClick={() => (isSpeaking ? onStopSpeak() : onSpeak(lie.story))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSpeaking
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>停止</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>大真面目に朗読</span>
                  </>
                )}
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>コピー完了</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>本文コピー</span>
                  </>
                )}
              </button>
            </div>

            {/* Certificate Card Modal Trigger */}
            <button
              onClick={() => onOpenCard(lie, questionContext || message.content)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>100%嘘八百 認定証を発行</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
