import React from 'react';
import { X, BookOpen, Heart, Shield, Compass } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* High Brightness Luminous Glass Card */}
      <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl animate-scaleUp my-8 max-h-[90vh] overflow-y-auto border border-white">
        <div className="flex items-center justify-between pb-3 border-b border-[#59a9b5]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e2f3f9] text-[#438797] flex items-center justify-center border border-[#59a9b5]/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">幼教溝通心法</h3>
              <p className="text-[11px] text-stone-400">正向溝通與同理心實踐原則</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#438797] hover:bg-[#e2f3f9] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-stone-700">
          <div className="bg-[#e2f3f9]/40 rounded-2xl p-3.5 space-y-1.5 border border-[#59a9b5]/25">
            <h4 className="font-bold text-[#438797] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#59a9b5]" />
              <span>1. 先處理心情，再處理事情</span>
            </h4>
            <p className="text-stone-600 leading-relaxed">
              先反映並接納對方的焦慮與擔憂，切忌第一時間自我辯解或說教。
            </p>
            <div className="bg-white rounded-xl p-2.5 text-stone-800 font-medium border border-[#59a9b5]/25 shadow-2xs">
              「我非常理解您看到孩子受傷的心疼與著急，換作是我也會非常心疼……」
            </div>
          </div>

          <div className="bg-[#e2f3f9]/40 rounded-2xl p-3.5 space-y-1 border border-[#59a9b5]/25">
            <h4 className="font-bold text-[#438797] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#59a9b5]" />
              <span>2. 溫和堅定，守護幼兒隱私與自尊</span>
            </h4>
            <p className="text-stone-600 leading-relaxed">
              不指名道姓、不為幼兒貼標籤，聚焦於行為引導與環境安全措施。
            </p>
          </div>

          <div className="bg-[#e2f3f9]/40 rounded-2xl p-3.5 space-y-1 border border-[#59a9b5]/25">
            <h4 className="font-bold text-[#438797] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#59a9b5]" />
              <span>3. 非暴力溝通 (NVC)</span>
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
              <div className="bg-white p-2 rounded-xl border border-[#59a9b5]/25 shadow-2xs">
                <span className="font-bold text-[#438797] block text-[11px]">觀察事實</span>
                <span className="text-[10px] text-stone-400">不帶評價</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#59a9b5]/25 shadow-2xs">
                <span className="font-bold text-[#438797] block text-[11px]">坦承感受</span>
                <span className="text-[10px] text-stone-400">理解焦慮</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#59a9b5]/25 shadow-2xs">
                <span className="font-bold text-[#438797] block text-[11px]">釐清需要</span>
                <span className="text-[10px] text-stone-400">安全共好</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#59a9b5]/25 shadow-2xs">
                <span className="font-bold text-[#438797] block text-[11px]">具體請求</span>
                <span className="text-[10px] text-stone-400">可行步驟</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#59a9b5]/20 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-[#438797] hover:bg-[#366f7d] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
          >
            返回演練
          </button>
        </div>
      </div>
    </div>
  );
};
