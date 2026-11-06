import React, { useState } from 'react';
import { EvaluationResult, Scenario, ChatMessage } from '../types/simulator';
import {
  Award,
  RotateCcw,
  Home,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Quote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultViewProps {
  scenario: Scenario;
  evaluation: EvaluationResult;
  messages: ChatMessage[];
  isGuest?: boolean;
  onRetry: () => void;
  onGoLobby: () => void;
  onGoAnalysis: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  scenario,
  evaluation,
  messages,
  isGuest,
  onRetry,
  onGoLobby,
  onGoAnalysis,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);

  // Normalize score so both 0-100 scale and legacy 0-25 scale display properly
  const normalize = (score?: number) => {
    if (!score) return 0;
    return score <= 25 ? Math.round((score / 25) * 100) : score;
  };

  const toneScore = normalize(evaluation.scoreBreakdown?.tone);
  const empathyScore = normalize(evaluation.scoreBreakdown?.empathy);
  const clarityScore = normalize(evaluation.scoreBreakdown?.clarity);

  const getDimensionColor = (score: number) => {
    if (score >= 82) return 'bg-[#438797]';
    if (score >= 70) return 'bg-[#59a9b5]';
    return 'bg-[#59a9b5]/60';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Guest Mode Notice */}
      {isGuest && (
        <div className="liquid-glass rounded-2xl p-3 text-xs text-[#438797] border border-[#59a9b5]/30 flex items-center justify-between shadow-2xs">
          <span>💡 訪客模式：本報告僅供本次預覽，不會記錄於帳號歷程。</span>
        </div>
      )}

      {/* Top Banner with Score & Grade */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm border border-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2f3f9] text-xs font-bold text-[#438797] border border-[#59a9b5]/30">
              <Award className="w-3.5 h-3.5 text-[#59a9b5]" />
              <span>{scenario.category}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {scenario.title}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              對象：{scenario.characterName}（{scenario.characterRole}）
            </p>
          </div>

          {/* Big Score Badge in Liquid Glass */}
          <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white text-center shrink-0 shadow-xs">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
                {evaluation.totalScore}
                <span className="text-base font-normal text-stone-400 ml-1">分</span>
              </div>
              <div className="text-[11px] text-stone-500 font-semibold mt-0.5">演練總分</div>
            </div>

            <div className="h-10 w-[1px] bg-[#59a9b5]/25" />

            <div>
              <div className="text-3xl font-black bg-[#438797] text-white w-13 h-13 rounded-2xl flex items-center justify-center shadow-md shadow-[#438797]/25">
                {evaluation.grade}
              </div>
              <div className="text-[11px] text-stone-500 font-semibold mt-0.5">評級</div>
            </div>
          </div>
        </div>

        {/* Mentor Overall Summary */}
        <div className="mt-6 pt-5 border-t border-[#59a9b5]/20 text-xs sm:text-sm text-stone-700 leading-relaxed bg-white/70 backdrop-blur-xs rounded-2xl p-4">
          <strong className="text-[#438797] block mb-1">導師綜合講評：</strong>
          {evaluation.summary}
        </div>
      </div>

      {/* 3 Dimensional Competency Breakdown (Tone, Empathy, Clarity) */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#438797]" />
            <span>專業核心指標分析</span>
          </h3>
          <span className="text-[11px] text-stone-400">滿分各 100 分</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tone */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-[#59a9b5]/25 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
              <span>語氣專業度</span>
              <span className="font-bold text-[#438797]">{toneScore} <span className="text-[10px] text-stone-400 font-normal">/ 100</span></span>
            </div>
            <div className="w-full bg-[#e2f3f9] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getDimensionColor(toneScore)}`}
                style={{ width: `${Math.min(100, Math.max(0, toneScore))}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400">情緒穩定、溫和有禮、非防禦性</p>
          </div>

          {/* Empathy */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-[#59a9b5]/25 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
              <span>同理心接納</span>
              <span className="font-bold text-[#438797]">{empathyScore} <span className="text-[10px] text-stone-400 font-normal">/ 100</span></span>
            </div>
            <div className="w-full bg-[#e2f3f9] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getDimensionColor(empathyScore)}`}
                style={{ width: `${Math.min(100, Math.max(0, empathyScore))}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400">先處理心情再處理事情、反映傾聽</p>
          </div>

          {/* Clarity */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-[#59a9b5]/25 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
              <span>溝通清晰度</span>
              <span className="font-bold text-[#438797]">{clarityScore} <span className="text-[10px] text-stone-400 font-normal">/ 100</span></span>
            </div>
            <div className="w-full bg-[#e2f3f9] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getDimensionColor(clarityScore)}`}
                style={{ width: `${Math.min(100, Math.max(0, clarityScore))}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400">客觀事實陳述、可落地具體方案</p>
          </div>
        </div>
      </div>

      {/* 3 Column Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="liquid-glass rounded-3xl p-5 border border-[#59a9b5]/30 space-y-3">
          <h4 className="text-xs font-bold text-[#438797] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#438797]" />
            <span>優勢亮點</span>
          </h4>
          <ul className="space-y-2">
            {(evaluation.strengths || []).map((item, idx) => (
              <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#438797] shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="liquid-glass rounded-3xl p-5 border border-amber-300/40 space-y-3">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>待優化盲點</span>
          </h4>
          <ul className="space-y-2">
            {(evaluation.risks || []).map((item, idx) => (
              <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="liquid-glass rounded-3xl p-5 border border-[#59a9b5]/30 space-y-3">
          <h4 className="text-xs font-bold text-[#438797] flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-[#59a9b5]" />
            <span>具體行動建議</span>
          </h4>
          <ul className="space-y-2">
            {(evaluation.actions || []).map((item, idx) => (
              <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#59a9b5] shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model Reply Example */}
      {evaluation.example && (
        <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-2.5 border border-white">
          <div className="flex items-center gap-2 text-[#438797] text-xs font-bold">
            <Quote className="w-4 h-4 text-[#59a9b5]" />
            <span>高情商示範金句</span>
          </div>
          <div className="bg-[#e2f3f9]/70 rounded-2xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed border border-[#59a9b5]/25">
            {evaluation.example}
          </div>
        </div>
      )}

      {/* Collapsible Transcript Accordion */}
      <div className="liquid-glass rounded-3xl overflow-hidden border border-[#59a9b5]/25">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#e2f3f9]/50 transition-colors text-left"
        >
          <span className="text-xs font-bold text-stone-800">
            對話逐字稿 ({messages.length} 則)
          </span>
          {showTranscript ? <ChevronUp className="w-4 h-4 text-[#59a9b5]" /> : <ChevronDown className="w-4 h-4 text-[#59a9b5]" />}
        </button>

        {showTranscript && (
          <div className="p-4 border-t border-[#59a9b5]/20 space-y-2.5 bg-stone-50/40">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className="text-xs space-y-1">
                  <div className="font-bold text-stone-500 text-[11px]">
                    {isUser ? '幼教老師 (您)' : `${scenario.characterName}`}
                    <span className="text-[10px] font-normal text-stone-400 ml-2">{m.timestamp}</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl ${
                      isUser
                        ? 'bg-[#438797] text-white'
                        : 'bg-white text-stone-800 border border-[#59a9b5]/25'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          onClick={onRetry}
          className="py-2.5 px-4 bg-white hover:bg-[#e2f3f9] text-[#438797] border border-[#59a9b5]/35 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <RotateCcw className="w-4 h-4 text-[#59a9b5]" />
          <span>重練本題</span>
        </button>

        {!isGuest && (
          <button
            onClick={onGoAnalysis}
            className="py-2.5 px-4 bg-[#59a9b5] hover:bg-[#438797] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <BarChart3 className="w-4 h-4 text-[#e2f3f9]" />
            <span>歷程分析</span>
          </button>
        )}

        <button
          onClick={onGoLobby}
          className="py-2.5 px-4 bg-[#438797] hover:bg-[#366f7d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#438797]/25"
        >
          <Home className="w-4 h-4" />
          <span>返回大廳</span>
        </button>
      </div>
    </div>
  );
};
