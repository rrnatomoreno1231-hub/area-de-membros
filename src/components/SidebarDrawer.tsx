import React from 'react';
import { Member } from '../types/index.ts';
import { 
  X, 
  User, 
  Layers, 
  Award, 
  HelpCircle, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onNavigateHome: () => void;
  onOpenCertificate: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  totalDocs: number;
  completedDocs: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  member,
  onNavigateHome,
  onOpenCertificate,
  onOpenHelp,
  onOpenAdmin,
  onLogout,
  totalDocs,
  completedDocs
}) => {
  if (!isOpen) return null;

  const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-white border-r border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
          {/* Header with Close */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Minha Conta
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info Block */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-sm shadow-xs shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-500 truncate" title={member.email}>
                  {member.email}
                </p>
              </div>
            </div>

            {/* Access status & minimal progress */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Acesso Ativo</span>
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {completedDocs}/{totalDocs} aulas ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => {
                onNavigateHome();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Ver Módulos</span>
            </button>

            <button
              onClick={() => {
                onOpenCertificate();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <Award className="h-4 w-4 text-slate-400" />
              <span>Certificado</span>
            </button>

            <button
              onClick={() => {
                onOpenHelp();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Suporte & Dúvidas</span>
            </button>

            <div className="my-3 border-t border-slate-100" />

            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Painel do Produtor (Webhooks)</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
