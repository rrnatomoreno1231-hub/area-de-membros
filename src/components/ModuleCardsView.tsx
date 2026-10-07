import React from 'react';
import { ModuleItem, Member } from '../types/index.ts';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';

interface ModuleCardsViewProps {
  modules: ModuleItem[];
  currentMember: Member;
  onSelectModule: (module: ModuleItem) => void;
}

export const ModuleCardsView: React.FC<ModuleCardsViewProps> = ({
  modules,
  currentMember,
  onSelectModule
}) => {
  const completedSet = new Set(currentMember.completedDocumentIds || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Clean Minimalist Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Meus Módulos
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Selecione um módulo abaixo para acessar seus materiais e documentos.
        </p>
      </div>

      {/* Vertical Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
        {modules.map((module) => {
          const completedInMod = module.documents.filter((d) => completedSet.has(d.id)).length;
          const isModCompleted = module.documents.length > 0 && completedInMod === module.documents.length;

          return (
            <div
              key={module.id}
              onClick={() => onSelectModule(module)}
              className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Clean Image on Top */}
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <img
                  src={module.coverImage}
                  alt={module.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                {isModCompleted && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-emerald-700 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Concluído</span>
                  </div>
                )}
              </div>

              {/* Card Body (Vertical) */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Módulo {module.order}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug group-hover:text-slate-700 transition-colors">
                    {module.title.replace(/^Módulo \d+:\s*/i, '')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {module.subtitle || module.description}
                  </p>
                </div>

                {/* Footer with Material Count & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>{module.documents.length} materiais</span>
                  </span>

                  <span className="font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Acessar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
