import React from 'react';
import {
  Scenario,
  ScenarioCategory,
  SimulationRecord,
  UserSession,
} from '../types/simulator';
import { DIMENSIONS, getRandomScenarioForDimension } from '../data/defaultScenarios';
import {
  Dice5,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react';

interface LobbyViewProps {
  user: UserSession;
  records: SimulationRecord[];
  onSelectScenario: (scenario: Scenario) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  user,
  records,
  onSelectScenario,
}) => {
  const userRecords = records.filter((r) => r.studentId === user.studentId);
  const totalCompleted = userRecords.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          userRecords.reduce((sum, r) => sum + (r.evaluation?.totalScore || 0), 0) /
            totalCompleted
        )
      : null;

  const handlePickRandomScenario = (dimensionCategory: ScenarioCategory) => {
    const randomizedScenario = getRandomScenarioForDimension(dimensionCategory);
    onSelectScenario(randomizedScenario);
  };

  const handlePickGlobalRandom = () => {
    const randomDim = DIMENSIONS[Math.floor(Math.random() * DIMENSIONS.length)].category;
    handlePickRandomScenario(randomDim);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      {/* Top Banner: Liquid Glass Header */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#438797]">
            <span className="w-2 h-2 rounded-full bg-[#59a9b5] animate-pulse" />
            <span>{user.isGuest ? '訪客模式' : `學號 ${user.studentId}`}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            選擇演練面向
          </h2>
          <p className="text-xs text-stone-500">
            每次點選即隨機抽選實務情境，模擬真實對話與即時回饋。
          </p>
        </div>

        {/* Stats & Global Random Blind Button */}
        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          {!user.isGuest && (
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#59a9b5]/30 text-xs shadow-2xs">
              <Award className="w-4 h-4 text-[#438797]" />
              <div>
                <span className="text-[10px] text-stone-400 block leading-tight">已完成 / 平均</span>
                <span className="font-bold text-stone-800 tabular-nums">
                  {totalCompleted} 場 · {avgScore !== null ? `${avgScore}分` : '--'}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handlePickGlobalRandom}
            className="flex-1 md:flex-none py-2.5 px-4 bg-[#438797] hover:bg-[#366f7d] text-white font-bold rounded-2xl shadow-md shadow-[#438797]/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs"
          >
            <Sparkles className="w-4 h-4 text-[#e2f3f9]" />
            <span>全面向隨機抽題</span>
          </button>
        </div>
      </div>

      {/* Four Major Dimension Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DIMENSIONS.map((dim) => {
          return (
            <div
              key={dim.category}
              className="liquid-glass-card rounded-3xl p-6 transition-all hover:scale-[1.01] flex flex-col justify-between group cursor-pointer relative overflow-hidden border border-white"
              onClick={() => handlePickRandomScenario(dim.category)}
            >
              <div className="space-y-3">
                {/* Visual Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#e2f3f9] border border-[#59a9b5]/30 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                      {dim.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#438797] transition-colors">
                          {dim.name}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e2f3f9] border border-[#59a9b5]/30 text-[#438797]">
                          {dim.target}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {dim.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {dim.description}
                </p>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-4 mt-3 border-t border-[#59a9b5]/15 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  隨機題型庫
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePickRandomScenario(dim.category);
                  }}
                  className="py-2 px-4 bg-[#438797] hover:bg-[#59a9b5] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Dice5 className="w-3.5 h-3.5 text-[#e2f3f9]" />
                  <span>隨機進入演練</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
