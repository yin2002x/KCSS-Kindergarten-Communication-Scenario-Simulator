import React, { useState } from 'react';
import { UserSession } from '../types/simulator';
import {
  GraduationCap,
  ArrowRight,
  IdCard,
  Lock,
  UserCheck,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMsg('請輸入學號');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('請輸入密碼');
      return;
    }

    setErrorMsg('');
    onLogin({
      studentId: studentId.trim(),
      name: `學員 ${studentId.trim()}`,
      school: '幼兒教育學系',
      title: '師培學員',
      loginTime: new Date().toISOString(),
      isGuest: false,
    });
  };

  const handleGuestLogin = () => {
    const randomGuestId = `GUEST-${Math.floor(1000 + Math.random() * 9000)}`;
    onLogin({
      studentId: randomGuestId,
      name: '訪客學員',
      school: '體驗模式',
      title: '訪客身分',
      loginTime: new Date().toISOString(),
      isGuest: true,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-md w-full liquid-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white">
        {/* Ambient Pale Aqua Liquid Accent Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#59a9b5]/15 blur-xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-[#438797] flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-[#438797]/25">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            幼兒園溝通情境模擬器
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50/90 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="relative">
              <IdCard className="w-4 h-4 text-[#59a9b5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="學號 (例如 B11059024)"
                className="w-full pl-10 pr-4 py-3 liquid-glass-input rounded-2xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#59a9b5]/40 focus:border-[#438797] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#59a9b5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密碼"
                className="w-full pl-10 pr-4 py-3 liquid-glass-input rounded-2xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#59a9b5]/40 focus:border-[#438797] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#438797] hover:bg-[#366f7d] text-white font-bold rounded-2xl shadow-md shadow-[#438797]/25 flex items-center justify-center gap-2 group transition-all text-xs sm:text-sm cursor-pointer active:scale-98"
          >
            <span>學員登入</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#e2f3f9]" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#59a9b5]/20" />
          </div>
          <span className="relative bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] text-stone-400 font-medium">
            或
          </span>
        </div>

        {/* Guest Mode Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 px-4 bg-white/90 hover:bg-[#e2f3f9] text-[#438797] border border-[#59a9b5]/35 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <UserCheck className="w-4 h-4 text-[#59a9b5]" />
          <span>訪客快速體驗 (不存檔)</span>
        </button>
      </div>
    </div>
  );
};
