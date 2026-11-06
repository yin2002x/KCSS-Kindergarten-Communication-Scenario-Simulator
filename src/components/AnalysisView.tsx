import React, { useState } from 'react';
import { SimulationRecord, UserSession } from '../types/simulator';
import {
  exportRecordsAsJson,
  importRecordsFromJson,
  clearAllRecords,
  deleteRecord,
} from '../services/storage';
import {
  BarChart3,
  Download,
  Upload,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Home,
} from 'lucide-react';

interface AnalysisViewProps {
  user: UserSession;
  records: SimulationRecord[];
  onRefreshRecords: () => void;
  onGoLobby: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  user,
  records,
  onRefreshRecords,
  onGoLobby,
}) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const studentRecords = records.filter((r) => r.studentId === user.studentId);
  const totalDrills = studentRecords.length;

  const normalize = (score?: number) => {
    if (!score) return 0;
    return score <= 25 ? Math.round((score / 25) * 100) : score;
  };

  const avgTotal =
    totalDrills > 0
      ? Math.round(
          studentRecords.reduce((acc, r) => acc + (r.evaluation?.totalScore || 0), 0) / totalDrills
        )
      : 0;

  const avgTone =
    totalDrills > 0
      ? Math.round(
          studentRecords.reduce((acc, r) => acc + normalize(r.evaluation?.scoreBreakdown?.tone), 0) /
            totalDrills
        )
      : 0;

  const avgEmpathy =
    totalDrills > 0
      ? Math.round(
          studentRecords.reduce((acc, r) => acc + normalize(r.evaluation?.scoreBreakdown?.empathy), 0) /
            totalDrills
        )
      : 0;

  const avgClarity =
    totalDrills > 0
      ? Math.round(
          studentRecords.reduce((acc, r) => acc + normalize(r.evaluation?.scoreBreakdown?.clarity), 0) /
            totalDrills
        )
      : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importRecordsFromJson(content);
      if (res.success) {
        setImportStatus(`成功匯入 ${res.count} 筆紀錄`);
        onRefreshRecords();
      } else {
        setImportStatus(`匯入失敗：${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    if (confirm('確定刪除此筆紀錄？')) {
      deleteRecord(id);
      onRefreshRecords();
    }
  };

  const handleClearAll = () => {
    if (confirm('確定清空所有演練紀錄？此動作無法復原。')) {
      clearAllRecords();
      onRefreshRecords();
    }
  };

  const filteredList = studentRecords.filter((r) => {
    if (filterCategory === '全部') return true;
    return r.scenario?.category === filterCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">演練歷程分析</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e2f3f9] text-[#438797] text-xs font-semibold border border-[#59a9b5]/30">
              {user.name} ({user.studentId})
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            記錄語氣專業度、同理心接納與溝通清晰度的成長軌跡
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer py-2 px-3 liquid-glass hover:bg-[#e2f3f9] text-[#438797] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs border border-[#59a9b5]/25">
            <Upload className="w-3.5 h-3.5 text-[#59a9b5]" />
            <span>匯入</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={exportRecordsAsJson}
            disabled={studentRecords.length === 0}
            className="py-2 px-3 liquid-glass hover:bg-[#e2f3f9] disabled:opacity-40 text-[#438797] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs border border-[#59a9b5]/25"
          >
            <Download className="w-3.5 h-3.5 text-[#59a9b5]" />
            <span>匯出</span>
          </button>

          <button
            onClick={onGoLobby}
            className="py-2 px-3.5 bg-[#438797] hover:bg-[#366f7d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#438797]/25"
          >
            <Home className="w-3.5 h-3.5 text-[#e2f3f9]" />
            <span>大廳</span>
          </button>
        </div>
      </div>

      {user.isGuest && (
        <div className="p-3 liquid-glass border border-[#59a9b5]/30 rounded-2xl text-xs text-[#438797] flex items-center gap-2">
          <span>💡 訪客模式演練數據不儲存於帳號。輸入學號登入即可永久記錄成績。</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-[#e2f3f9] border border-[#59a9b5]/40 text-[#438797] rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#438797]" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Metric KPI Cards: 3 core indicators + total */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="liquid-glass-card rounded-2xl p-4 border border-white">
          <div className="text-[11px] text-stone-400 font-semibold">演練次數</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totalDrills}</div>
          <div className="text-[10px] text-stone-400">場實戰</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4 border border-white">
          <div className="text-[11px] text-stone-400 font-semibold">綜合平均分</div>
          <div className="text-2xl font-black text-[#438797] mt-1">{avgTotal} <span className="text-xs font-normal text-stone-400">分</span></div>
          <div className="text-[10px] text-stone-400">滿分 100</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4 border border-white">
          <div className="text-[11px] text-stone-400 font-semibold">語氣專業度</div>
          <div className="text-2xl font-black text-stone-800 mt-1">{avgTone}</div>
          <div className="text-[10px] text-stone-400">指標平均</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4 border border-white">
          <div className="text-[11px] text-stone-400 font-semibold">同理心接納</div>
          <div className="text-2xl font-black text-stone-800 mt-1">{avgEmpathy}</div>
          <div className="text-[10px] text-stone-400">指標平均</div>
        </div>

        <div className="col-span-2 sm:col-span-1 liquid-glass-card rounded-2xl p-4 border border-white">
          <div className="text-[11px] text-stone-400 font-semibold">溝通清晰度</div>
          <div className="text-2xl font-black text-stone-800 mt-1">{avgClarity}</div>
          <div className="text-[10px] text-stone-400">指標平均</div>
        </div>
      </div>

      {/* History Records List */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4 border border-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#438797]" />
            <span>對話紀錄 ({filteredList.length})</span>
          </h3>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['全部', '親師衝突處理（家長端）', '幼兒情緒引導（幼兒端）', '行政任務交辦（主管端）', '協同教學歧見（同事端）'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-[#438797] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-[#e2f3f9]'
                }`}
              >
                {cat.split('（')[0]}
              </button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 liquid-glass rounded-2xl border border-dashed border-[#59a9b5]/30">
            <p className="text-stone-400 text-xs">尚無演練紀錄</p>
            <button
              onClick={onGoLobby}
              className="mt-3 px-4 py-1.5 bg-[#438797] hover:bg-[#366f7d] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              進入情境大廳
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredList.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const evalRes = record.evaluation;
              return (
                <div
                  key={record.id}
                  className="liquid-glass rounded-2xl overflow-hidden hover:border-[#59a9b5]/40 transition-all border border-[#59a9b5]/20"
                >
                  <div
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#e2f3f9]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#e2f3f9] flex items-center justify-center text-lg shrink-0 border border-[#59a9b5]/30">
                        {record.scenario?.characterAvatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm">
                            {record.scenario?.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#e2f3f9] text-[#438797] font-medium border border-[#59a9b5]/20">
                            {record.scenario?.category.split('（')[0]}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {record.scenario?.characterName} • {new Date(record.createdAt).toLocaleDateString('zh-TW')} • {record.messages?.length || 0} 則對話
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-[#438797]">
                          {evalRes?.totalScore} <span className="text-[10px] font-normal text-stone-400">分</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-[#438797] font-bold border border-[#59a9b5]/30">
                          {evalRes?.grade} 級
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#59a9b5]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#59a9b5]" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white/75 border-t border-[#59a9b5]/20 space-y-3 text-xs">
                      <div className="text-stone-700 leading-relaxed">
                        <strong className="text-[#438797]">講評：</strong>
                        {evalRes?.summary}
                      </div>

                      {/* 3 Indicators Breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#e2f3f9]/50 p-2.5 rounded-xl border border-[#59a9b5]/25">
                          <div className="text-stone-400 text-[10px]">語氣專業度</div>
                          <div className="font-bold text-[#438797]">{normalize(evalRes?.scoreBreakdown?.tone)}</div>
                        </div>
                        <div className="bg-[#e2f3f9]/50 p-2.5 rounded-xl border border-[#59a9b5]/25">
                          <div className="text-stone-400 text-[10px]">同理心接納</div>
                          <div className="font-bold text-[#438797]">{normalize(evalRes?.scoreBreakdown?.empathy)}</div>
                        </div>
                        <div className="bg-[#e2f3f9]/50 p-2.5 rounded-xl border border-[#59a9b5]/25">
                          <div className="text-stone-400 text-[10px]">溝通清晰度</div>
                          <div className="font-bold text-[#438797]">{normalize(evalRes?.scoreBreakdown?.clarity)}</div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-stone-400 hover:text-rose-600 text-[11px] flex items-center gap-1 font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 刪除此紀錄
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {studentRecords.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空所有紀錄</span>
          </button>
        </div>
      )}
    </div>
  );
};
