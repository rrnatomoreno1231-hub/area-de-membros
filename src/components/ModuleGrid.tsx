import React, { useState, useMemo } from 'react';
import { ModuleItem, DocumentItem, Member } from '../types/index.ts';
import { 
  Search, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  CheckSquare, 
  ArrowRight, 
  Clock, 
  Award,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  FolderOpen
} from 'lucide-react';

interface ModuleGridProps {
  modules: ModuleItem[];
  currentMember: Member | null;
  onSelectDocument: (doc: DocumentItem, moduleTitle: string) => void;
  onOpenAuth: () => void;
  onOpenCertificate: () => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  currentMember,
  onSelectDocument,
  onOpenAuth,
  onOpenCertificate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'guide' | 'contract' | 'sop' | 'spreadsheet'>('all');

  const completedSet = useMemo(() => {
    return new Set(currentMember?.completedDocumentIds || []);
  }, [currentMember]);

  const totalDocumentsCount = useMemo(() => {
    return modules.reduce((acc, m) => acc + m.documents.length, 0);
  }, [modules]);

  const completedCount = completedSet.size;
  const progressPercent = totalDocumentsCount > 0 ? Math.round((completedCount / totalDocumentsCount) * 100) : 0;

  // Filter modules and documents based on search and category
  const filteredModules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return modules.map((mod) => {
      const matchingDocs = mod.documents.filter((doc) => {
        const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;
        const matchesSearch =
          !term ||
          doc.title.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term) ||
          doc.format.toLowerCase().includes(term);
        return matchesFilter && matchesSearch;
      });

      return {
        ...mod,
        filteredDocuments: matchingDocs
      };
    }).filter((mod) => mod.filteredDocuments.length > 0 || !searchTerm);
  }, [modules, searchTerm, activeFilter]);

  const renderDocIcon = (type: string) => {
    switch (type) {
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />;
      case 'contract':
        return <FileText className="h-4 w-4 text-indigo-400 shrink-0" />;
      case 'sop':
        return <CheckSquare className="h-4 w-4 text-cyan-400 shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-amber-400 shrink-0" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Product Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="/src/assets/images/product_cover_banner_1790859543786.jpg"
          alt="MemberHub Executive Product Banner"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-right opacity-30 mix-blend-luminosity"
        />

        <div className="relative z-20 p-6 sm:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Biblioteca de Ativos & Documentos Executivos</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            MasterKit: Documentos, Contratos & SOPs Prontos para Uso
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Área de membros estruturada em módulos práticos. Acesse minutas jurídicas revisadas, procedimentos operacionais padrão, planilhas financeiras e playbooks de escala com download direto.
          </p>

          {/* Member Progress Bar or Quick Login Callout */}
          {currentMember ? (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Seu Progresso no Treinamento</span>
                  </span>
                  <span className="text-amber-400 font-mono tabular-nums font-semibold">
                    {completedCount} de {totalDocumentsCount} concluídos ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {progressPercent === 100 && (
                <button
                  onClick={onOpenCertificate}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  <Award className="h-4 w-4" />
                  <span>Ver Meu Certificado</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Já comprei? Entrar com meu E-mail</span>
              </button>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Reconhecimento automático via Kiwify, Hotmart, Eduzz e Stripe</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Filter Controls (Single-Line Buttons / Segmented) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, palavra-chave ou formato..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter Segmented Control (Interactive functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos os Documentos
          </button>
          <button
            onClick={() => setActiveFilter('guide')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'guide'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guias & Playbooks
          </button>
          <button
            onClick={() => setActiveFilter('contract')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'contract'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contratos & Acordos
          </button>
          <button
            onClick={() => setActiveFilter('sop')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'sop'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SOPs & Processos
          </button>
          <button
            onClick={() => setActiveFilter('spreadsheet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'spreadsheet'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Planilhas & Ferramentas
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-8">
        {filteredModules.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl p-8">
            <FolderOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Nenhum documento encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhum material corresponde ao filtro ou busca selecionada. Tente limpar os filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          filteredModules.map((module) => {
            const docsToShow = module.filteredDocuments || module.documents;
            const completedInModule = module.documents.filter((d) => completedSet.has(d.id)).length;
            const modulePercent = module.documents.length > 0
              ? Math.round((completedInModule / module.documents.length) * 100)
              : 0;

            return (
              <div
                key={module.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                {/* Module Header Bar */}
                <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Module Cover Image */}
                    <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={module.coverImage}
                        alt={module.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-amber-400">
                          MÓDULO {module.order}
                        </span>
                        {module.badge && (
                          <span className="text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {module.badge}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {module.title}
                      </h2>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                        {module.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Module Progress Metric */}
                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">
                        <span className="font-mono tabular-nums text-slate-200 font-medium">
                          {completedInModule}/{module.documents.length}
                        </span>{' '}
                        concluídos
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${modulePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents inside this module */}
                <div className="divide-y divide-slate-800/60">
                  {docsToShow.map((doc) => {
                    const isDocCompleted = completedSet.has(doc.id);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument(doc, module.title)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                            {renderDocIcon(doc.type)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                                {doc.title}
                              </h3>
                              {isDocCompleted && (
                                <span className="inline-flex items-center text-emerald-400" title="Concluído">
                                  <CheckCircle2 className="h-4 w-4" />
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-2xl">
                              {doc.description}
                            </p>

                            {/* Clean unboxed metadata with · separator (Zero-Pill Rule) */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                              <span className="text-slate-400 font-medium">{doc.format}</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{doc.readTime}</span>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action affordance */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                          <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                            <span>Acessar</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
