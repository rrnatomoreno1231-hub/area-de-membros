import React from 'react';
import { Member } from '../types/index.ts';
import { Menu, User, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentMember: Member;
  onOpenSidebar: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  onOpenSidebar,
  onNavigateHome
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Hamburger Button + Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            aria-label="Abrir menu lateral"
            className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-semibold">
              M
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Área de Membros
            </span>
          </button>
        </div>

        {/* Right Side: Simple Profile Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-full hover:bg-slate-50 border border-slate-200 transition-colors text-left"
          >
            <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center">
              {currentMember.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate hidden sm:inline">
              {currentMember.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
