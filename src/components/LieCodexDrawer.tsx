import React, { useState } from 'react';
import { X, BookOpen, Star, Trash2, Search, ExternalLink, Sparkles, Volume2 } from 'lucide-react';
import { ChatMessage, LieResponse } from '../types';

interface LieCodexDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedMessages: ChatMessage[];
  onRemoveMessage: (id: string) => void;
  onSelectLie: (lie: LieResponse, question: string) => void;
  onSpeak: (text: string) => void;
}

export const LieCodexDrawer: React.FC<LieCodexDrawerProps> = ({
  isOpen,
  onClose,
  savedMessages,
  onRemoveMessage,
  onSelectLie,
  onSpeak,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const liesOnly = savedMessages.filter((m) => m.role === 'assistant' && m.lieData);

  const filtered = liesOnly.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const headline = m.lieData?.headline.toLowerCase() || '';
    const story = m.lieData?.story.toLowerCase() || '';
    const flavor = m.lieData?.flavorName.toLowerCase() || '';
    return headline.includes(query) || story.includes(query) || flavor.includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-amber-50 h-full shadow-2xl flex flex-col border-l-4 border-amber-900 text-amber-950">
        {/* Drawer Header */}
        <div className="p-4 bg-amber-200/90 border-b border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-900 text-amber-100 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg text-amber-950">ウソ図鑑</h2>
              <p className="text-xs text-amber-900/80">
                でっち上げアーカイブ（全 {liesOnly.length} 件）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-amber-300 hover:bg-amber-400 text-amber-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-amber-200 bg-amber-100/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-700" />
            <input
              type="text"
              placeholder="珍説やキーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs text-amber-950 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* List of saved lies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-amber-900/60">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">まだ保存されたホラ話がありません</p>
              <p className="text-xs mt-1">チャットで質問すると、ここに自動保存されます！</p>
            </div>
          ) : (
            filtered.map((item) => {
              const lie = item.lieData!;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white border-2 border-amber-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300">
                      {lie.flavorName || '超屁理屈説'}
                    </span>
                    <button
                      onClick={() => onRemoveMessage(item.id)}
                      className="text-amber-500 hover:text-red-600 p-1 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-xs text-amber-950 mb-1 leading-snug line-clamp-2">
                    {lie.headline}
                  </h3>

                  <p className="text-[11px] text-amber-900/80 line-clamp-3 mb-2 leading-relaxed">
                    {lie.story}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
                    <button
                      onClick={() => onSpeak(lie.story)}
                      className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>朗読</span>
                    </button>
                    <button
                      onClick={() => onSelectLie(lie, item.content)}
                      className="text-amber-700 hover:text-amber-950 flex items-center gap-1 font-bold text-xs"
                    >
                      <span>認定証を表示</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
