import React from 'react';
import { ModuleItem, DocumentItem, Member } from '../types/index.ts';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';

interface ModuleDetailViewProps {
  module: ModuleItem;
  currentMember: Member;
  onBack: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onToggleComplete: (docId: string) => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  module,
  currentMember,
  onBack,
  onSelectDocument,
  onToggleComplete
}) => {
  const completedSet = new Set(currentMember.completedDocumentIds || []);

  const handleDownload = (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.fileUrl) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.downloadFileName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = `${doc.title}\n\nMódulo: ${module.title}\nFormato: ${doc.format}\n\n${doc.description}\n\n---\n\n${doc.contentMarkdown}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.downloadFileName || `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para todos os módulos</span>
      </button>

      {/* Module Clean Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="h-24 w-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
          <img
            src={module.coverImage}
            alt={module.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Módulo {module.order}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {module.title.replace(/^Módulo \d+:\s*/i, '')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            {module.description}
          </p>
        </div>
      </div>

      {/* Materials List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Materiais Disponíveis ({module.documents.length})
          </h2>
          {module.documents.length > 0 && (
            <span className="text-xs text-slate-400">
              Clique no material para ler ou baixar
            </span>
          )}
        </div>

        {module.documents.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Nenhum material adicionado neste módulo ainda
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Os novos conteúdos e bônus serão disponibilizados em breve nesta seção.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
          {module.documents.map((doc, idx) => {
            const isCompleted = completedSet.has(doc.id);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {doc.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-emerald-600" title="Concluído">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {doc.description}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                      <span>{doc.format}</span>
                      <span>·</span>
                      <span>{doc.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(doc, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Baixar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectDocument(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span>Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};
