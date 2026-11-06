import React from 'react';
import { PageType, UserSession } from '../types/simulator';
import {
  GraduationCap,
  MessageSquare,
  BarChart3,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  user: UserSession | null;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
  onOpenGuide,
}) => {
  return (
    <header className="liquid-glass sticky top-0 z-40 transition-all border-b border-[#59a9b5]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => user && onNavigate('lobby')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#438797] flex items-center justify-center text-white shadow-md shadow-[#438797]/25 group-hover:bg-[#366f7d] transition-all">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
            幼兒園溝通情境模擬器
          </span>
        </div>

        {/* Nav Links */}
        {user && (
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onNavigate('lobby')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentPage === 'lobby'
                  ? 'bg-[#438797] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#438797] hover:bg-[#e2f3f9]/70'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${currentPage === 'lobby' ? 'text-white' : 'text-[#59a9b5]'}`} />
              <span>情境大廳</span>
            </button>
            <button
              onClick={() => onNavigate('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentPage === 'analysis'
                  ? 'bg-[#438797] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#438797] hover:bg-[#e2f3f9]/70'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${currentPage === 'analysis' ? 'text-white' : 'text-[#59a9b5]'}`} />
              <span>演練歷程</span>
            </button>
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-stone-700 hover:text-[#438797] hover:bg-[#e2f3f9]/70 transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#59a9b5]" />
              <span className="hidden sm:inline">溝通心法</span>
            </button>
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <>
              {/* User badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full border border-[#59a9b5]/30 text-xs shadow-2xs">
                <User className="w-3.5 h-3.5 text-[#438797]" />
                {user.isGuest ? (
                  <span className="font-semibold text-[#438797]">訪客</span>
                ) : (
                  <span className="font-semibold text-stone-800 tabular-nums">學號 {user.studentId}</span>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="登出"
                className="p-2 text-stone-400 hover:text-[#438797] hover:bg-[#e2f3f9] rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
