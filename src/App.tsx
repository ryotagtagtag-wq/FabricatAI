import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, Trash2, ArrowDown, HelpCircle, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { GenreSelector } from './components/GenreSelector';
import { PromptChips } from './components/PromptChips';
import { ChatMessageItem } from './components/ChatMessageItem';
import { LieCardModal } from './components/LieCardModal';
import { LieCodexDrawer } from './components/LieCodexDrawer';
import { LieMeter } from './components/LieMeter';
import { ChatMessage, LieGenre, LieResponse } from './types';
import { speakText, stopSpeech } from './utils/audio';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '諸君、よくぞ来た。私は当研究所の最高捏造責任者、ホラフキンAIである。',
  timestamp: Date.now(),
  lieData: {
    headline: '【謹告】当AIは100%完全なウソ・珍説・超屁理屈のみをお届けします',
    story: '諸君、ようこそ。我が研究所に『真実』などという退屈な概念は存在しない。空が青い理由から、ピラミッドの建造秘話、明日の朝寝坊の絶対に怒られない言い訳まで、全て100%嘘だと誰にでもわかる最高峰のホラ話をご用意している。\n\nさあ、日常の疑問や人生の悩み、歴史の謎など、どんな質問でも遠慮なくぶつけてみたまえ！',
    bogusProof: '全日本トンデモ珍説振興機構 勅許第1号認可済み',
    flavorName: '初代所長就任演説',
    truthFact: 'このアプリの回答は全てジョーク・フィクションであり、現実の学術的見解とは一切関係がありません（笑ってお楽しみください）。',
    followUps: [
      '月って何で夜になると光るの？',
      '猫が夜中に大運動会する本当の理由',
      '宿題を忘れた絶対に怒られない言い訳',
    ],
    confidenceScore: 100,
    truthScore: 0,
  },
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('horafukin_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<LieGenre>('all');
  const [exaggeration, setExaggeration] = useState<'extreme' | 'cosmic'>('extreme');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Active modal / drawer state
  const [activeCard, setActiveCard] = useState<{ lie: LieResponse; question: string } | null>(null);
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('horafukin_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overridePrompt?: string, overrideGenre?: LieGenre) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const genreToUse = overrideGenre || selectedGenre;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
      genre: genreToUse,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build lightweight conversation history for the API
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.role === 'assistant' && m.lieData ? m.lieData.story : m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          genre: genreToUse,
          history: historyPayload,
          exaggeration,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const lieData: LieResponse = await res.json();

      const assistantMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: lieData.story,
        timestamp: Date.now(),
        lieData,
        genre: genreToUse,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If sound is enabled, auto-speak the headline + story!
      if (soundEnabled) {
        speakLie(assistantMessage.id, `${lieData.headline}。${lieData.story}`);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '時空の通信回線に重大な歪みが生じました。もう一度お尋ねください。',
        timestamp: Date.now(),
        lieData: {
          headline: '【緊急通信切断】宇宙連邦による検閲電波を感知',
          story: '申し訳ない。あまりにも真実に近い超機密ウソを語ろうとしたため、銀河情報保安局により一時的に通信が妨害されたようだ。恐れることはない、もう一度同じ質問を投げてくれたまえ！',
          bogusProof: '第9太陽系通信傍受対策マニュアル（2026年改訂版）',
          flavorName: '緊急通信障害説',
          truthFact: '実際はサーバーの一時的な通信エラーまたはタイムアウトです。',
          followUps: ['もう一度同じことを聞いてみる', '別のジャンルで聞いてみる'],
          confidenceScore: 100,
          truthScore: 0,
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakLie = async (msgId: string, text: string) => {
    stopSpeech();
    setSpeakingMessageId(msgId);
    await speakText(
      text,
      () => setSpeakingMessageId(msgId),
      () => setSpeakingMessageId(null)
    );
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setSpeakingMessageId(null);
  };

  const handleToggleFavorite = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const handleClearHistory = () => {
    if (confirm('チャット履歴をリセットして最初に戻しますか？')) {
      stopSpeech();
      setMessages([INITIAL_MESSAGE]);
    }
  };

  // Find previous user question for a given assistant message
  const getQuestionForMessage = (msgIndex: number): string => {
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content;
      }
    }
    return '日常の疑問・珍説審議';
  };

  const totalLies = messages.filter((m) => m.role === 'assistant' && m.lieData).length;
  const savedCount = messages.filter((m) => m.isFavorite).length;

  return (
    <div className="min-h-screen bg-dots flex flex-col font-body text-slate-800">
      {/* Top Header */}
      <Header
        lieCount={totalLies}
        savedCount={savedCount}
        onOpenCodex={() => setIsCodexOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          if (soundEnabled) stopSpeech();
          setSoundEnabled(!soundEnabled);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-between">
        {/* Top Control Bar: Genre & LieMeter */}
        <section className="space-y-3 mb-6">
          <LieMeter
            exaggeration={exaggeration}
            onChangeExaggeration={setExaggeration}
            count={totalLies}
          />
          <GenreSelector
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
          <PromptChips
            currentGenre={selectedGenre}
            onSelectPrompt={(prompt, genre) => {
              if (genre) setSelectedGenre(genre);
              handleSend(prompt, genre);
            }}
          />
        </section>

        {/* Message Stream */}
        <section className="flex-1 space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs text-amber-900/70 border-b border-amber-300/60 pb-2">
            <span className="font-bold flex items-center gap-1">
              <span>💬 審議ログ（100%嘘八百対話ストリーム）</span>
            </span>
            {messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                className="hover:text-red-700 flex items-center gap-1 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>履歴リセット</span>
              </button>
            )}
          </div>

          {messages.map((message, idx) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              questionContext={getQuestionForMessage(idx)}
              onOpenCard={(lie, q) => setActiveCard({ lie, question: q })}
              onSelectPrompt={(prompt) => handleSend(prompt)}
              onToggleFavorite={handleToggleFavorite}
              isSpeaking={speakingMessageId === message.id}
              onSpeak={(text) => speakLie(message.id, text)}
              onStopSpeak={handleStopSpeech}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="bg-white rounded-2xl p-5 border-2 border-amber-400 shadow-md max-w-md w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700 animate-spin">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-amber-950">
                      超ド級のホラ話をでっち上げ中...
                    </h3>
                    <p className="text-xs text-amber-800/80">
                      架空の論文を執筆し、真実度を0.00%に調整しています
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Bottom Input Area */}
        <div className="sticky bottom-3 z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-amber-400 p-2 sm:p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="気になる疑問、言い訳したいこと、歴史の謎を入力...（例: なぜカラスは黒い？ / 宿題を忘れた言い訳）"
                  rows={2}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl bg-amber-50/60 focus:bg-white border border-amber-300 p-3 text-sm text-amber-950 placeholder-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-display text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span>でっち上げろ！</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-amber-800/80 mt-1.5 px-1 font-medium">
              <span>※回答は100%完全なウソ・フィクションです。決して信じないでください。</span>
              <span className="hidden sm:inline">Enterで即時送信</span>
            </div>
          </div>
        </div>
      </main>

      {/* Share / Certificate Modal */}
      {activeCard && (
        <LieCardModal
          lie={activeCard.lie}
          question={activeCard.question}
          isOpen={true}
          onClose={() => setActiveCard(null)}
        />
      )}

      {/* Lie Codex Drawer */}
      <LieCodexDrawer
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        savedMessages={messages}
        onRemoveMessage={(id) =>
          setMessages((prev) => prev.filter((m) => m.id !== id))
        }
        onSelectLie={(lie, question) => {
          setActiveCard({ lie, question });
          setIsCodexOpen(false);
        }}
        onSpeak={(text) => speakLie('codex', text)}
      />
    </div>
  );
}
