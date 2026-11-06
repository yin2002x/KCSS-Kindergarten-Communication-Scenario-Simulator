import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Scenario, UserSession } from '../types/simulator';
import {
  Send,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  X,
  MessageCircle,
} from 'lucide-react';

interface ChatViewProps {
  scenario: Scenario;
  user: UserSession;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onRequestHint: () => Promise<{ hint: string; rationale: string } | null>;
  onFinishDrill: () => void;
  onExitWithoutSaving: () => void;
  isLoadingAi: boolean;
  isLoadingHint: boolean;
  isEvaluating?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  scenario,
  user,
  messages,
  onSendMessage,
  onRequestHint,
  onFinishDrill,
  isLoadingAi,
  isLoadingHint,
  isEvaluating,
}) => {
  const [inputText, setInputText] = useState('');
  const [showScenarioInfo, setShowScenarioInfo] = useState(false);
  const [currentHint, setCurrentHint] = useState<{ hint: string; rationale: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  const quickStarters = [
    '我非常理解您的心情與著急...',
    '謝謝您第一時間跟我反映這個狀況...',
    '我們一起來看看怎麼做對孩子最安心...',
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoadingAi) return;

    const text = inputText.trim();
    setInputText('');
    setCurrentHint(null);
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAskHint = async () => {
    const hintData = await onRequestHint();
    if (hintData) {
      setCurrentHint(hintData);
    }
  };

  const handleApplyHint = (hint: string) => {
    setInputText(hint);
    textareaRef.current?.focus();
  };

  const userTurns = messages.filter((m) => m.sender === 'user').length;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 h-[calc(100vh-4.5rem)] flex flex-col">
      {/* Liquid Glass Header */}
      <div className="liquid-glass-card rounded-t-3xl p-4 flex items-center justify-between shrink-0 shadow-xs border-b-0 border-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#e2f3f9] border border-[#59a9b5]/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {scenario.characterAvatar || '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-stone-900 text-sm sm:text-base tracking-tight">
                {scenario.characterName}
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e2f3f9] text-[#438797] font-semibold border border-[#59a9b5]/30">
                {scenario.characterRole}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#59a9b5]" />
              <span>幼師：{user.name}</span>
              <span>•</span>
              <span className="font-medium text-[#438797]">第 {userTurns} 輪回覆</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScenarioInfo(!showScenarioInfo)}
            className="p-2 text-stone-600 hover:text-[#438797] hover:bg-[#e2f3f9]/70 rounded-xl transition-all text-xs flex items-center gap-1 border border-[#59a9b5]/25"
            title="查看情境目標"
          >
            <Info className="w-4 h-4 text-[#59a9b5]" />
            <span className="hidden sm:inline font-medium">情境資訊</span>
            {showScenarioInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="py-1.5 px-3.5 bg-[#438797] hover:bg-[#366f7d] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#e2f3f9]" />
            <span>結束演練</span>
          </button>
        </div>
      </div>

      {/* Collapsible Info Drawer */}
      {showScenarioInfo && (
        <div className="bg-[#e2f3f9]/80 backdrop-blur-md border-x border-b border-[#59a9b5]/30 p-4 text-xs space-y-2 shrink-0 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#438797] text-sm">🎯 {scenario.title}</h4>
            <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#438797] font-semibold text-[10px] border border-[#59a9b5]/30">
              {scenario.category}
            </span>
          </div>
          <p className="text-stone-700 leading-relaxed">{scenario.description}</p>
          <div className="p-2.5 bg-white/90 rounded-xl border border-[#59a9b5]/25 text-stone-700">
            <strong className="text-[#438797]">核心指標：</strong> {scenario.learningGoal}
          </div>
        </div>
      )}

      {/* Main Chat Bubble Area */}
      <div className="flex-1 bg-gradient-to-b from-[#e2f3f9]/30 via-white/40 to-[#e2f3f9]/25 backdrop-blur-xs overflow-y-auto p-4 border-x border-[#59a9b5]/20 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[11px] px-3 py-1 bg-white/90 backdrop-blur-md text-stone-600 rounded-full border border-[#59a9b5]/20 shadow-2xs">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base shadow-xs border border-[#59a9b5]/25 shrink-0 select-none">
                  {scenario.characterAvatar || '👤'}
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                  isUser
                    ? 'bg-gradient-to-br from-[#438797] to-[#59a9b5] text-white rounded-br-xs font-normal shadow-sm shadow-[#438797]/15'
                    : 'liquid-glass-card text-stone-800 rounded-bl-xs'
                }`}
              >
                {!isUser && (
                  <div className="text-[11px] font-bold text-[#438797] mb-1">
                    {scenario.characterName}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right select-none ${
                    isUser ? 'text-[#e2f3f9]' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoadingAi && (
          <div className="flex items-end gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base shadow-xs border border-[#59a9b5]/25 shrink-0">
              {scenario.characterAvatar || '👤'}
            </div>
            <div className="liquid-glass-card rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#59a9b5] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#59a9b5] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#59a9b5] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-stone-500 ml-1.5">{scenario.characterName} 正在輸入...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Smart Hint */}
      {currentHint && (
        <div className="bg-gradient-to-r from-[#438797] to-[#59a9b5] text-white p-3 border-x border-[#438797] shadow-lg animate-slideUp shrink-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e2f3f9]">
              <Sparkles className="w-3.5 h-3.5 text-[#e2f3f9]" />
              <span>高情商回覆建議</span>
            </div>
            <button
              onClick={() => setCurrentHint(null)}
              className="text-[#e2f3f9] hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-2.5 text-xs sm:text-sm font-medium mb-2 border border-white/20 text-white">
            「{currentHint.hint}」
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#e2f3f9]">
            <span className="truncate max-w-[280px] sm:max-w-md">💡 {currentHint.rationale}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApplyHint(currentHint.hint)}
                className="px-2.5 py-1 bg-white text-[#438797] font-bold rounded-lg hover:bg-[#e2f3f9] transition-colors shadow-2xs"
              >
                帶入輸入框
              </button>
              <button
                onClick={async () => {
                  const textToSend = currentHint.hint;
                  setCurrentHint(null);
                  setInputText('');
                  await onSendMessage(textToSend);
                }}
                className="px-2.5 py-1 bg-[#366f7d] hover:bg-[#2c5b67] text-white font-bold rounded-lg transition-colors"
              >
                發送
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Starters Row */}
      <div className="liquid-glass border-x border-t border-[#59a9b5]/20 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-[#438797] whitespace-nowrap flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5 text-[#59a9b5]" /> 同理起手式：
        </span>
        {quickStarters.map((starter, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText((prev) => (prev ? `${prev} ${starter}` : starter));
              textareaRef.current?.focus();
            }}
            className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#e2f3f9] text-stone-700 hover:text-[#438797] border border-[#59a9b5]/25 rounded-lg whitespace-nowrap transition-colors shadow-2xs"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="liquid-glass-card rounded-b-3xl p-3 sm:p-4 shadow-xs shrink-0 border-t-0 border-white">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleAskHint}
              disabled={isLoadingHint || isLoadingAi}
              className="p-3 bg-[#e2f3f9] hover:bg-[#d5edf5] text-[#438797] border border-[#59a9b5]/35 rounded-2xl transition-all shadow-2xs flex flex-col items-center justify-center gap-1 group shrink-0 disabled:opacity-40"
              title="請求 AI 智能提示"
            >
              <Lightbulb className={`w-5 h-5 text-[#59a9b5] ${isLoadingHint ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
              <span className="text-[10px] font-bold leading-none hidden sm:inline">
                {isLoadingHint ? '分析中' : '智能提示'}
              </span>
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入幼師回覆... (Enter 發送，Shift + Enter 換行)"
                rows={2}
                disabled={isLoadingAi}
                className="liquid-glass-input w-full resize-none p-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#59a9b5]/40 focus:border-[#438797] transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoadingAi}
              className="p-3.5 bg-[#438797] hover:bg-[#366f7d] disabled:opacity-40 text-white rounded-2xl transition-all shadow-md shadow-[#438797]/20 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Full-Screen Evaluation Loading Overlay with Luminous Glass */}
      {isEvaluating && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass-modal rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-scaleUp border border-white">
            <div className="w-16 h-16 rounded-2xl bg-[#e2f3f9] text-[#438797] flex items-center justify-center mx-auto shadow-inner border border-[#59a9b5]/30">
              <Sparkles className="w-8 h-8 animate-spin text-[#438797]" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-stone-900 text-lg">專業評估中</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                正依據語氣專業度、同理心接納與溝通清晰度進行綜合量化分析
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#59a9b5] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#438797] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#59a9b5] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Finish Drill with Luminous Glass */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass-modal rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp border border-white">
            <div className="w-12 h-12 rounded-2xl bg-[#e2f3f9] text-[#438797] flex items-center justify-center mb-4 border border-[#59a9b5]/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              確定結束本次演練？
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              您已完成 <strong>{userTurns} 輪</strong> 回覆，即將產出專業評估診斷報告。
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#e2f3f9] rounded-xl transition-colors"
              >
                繼續演練
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onFinishDrill();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#438797] hover:bg-[#366f7d] rounded-xl shadow-xs transition-all"
              >
                產出評估
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
