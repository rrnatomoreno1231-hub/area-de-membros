import React, { useState } from 'react';
import { DocumentItem, ModuleItem } from '../types/index.ts';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';

interface CleanDocumentViewerProps {
  document: DocumentItem;
  module: ModuleItem;
  onBackToModule: () => void;
  isCompleted: boolean;
  onToggleComplete: (docId: string) => void;
}

export const CleanDocumentViewer: React.FC<CleanDocumentViewerProps> = ({
  document,
  module,
  onBackToModule,
  isCompleted,
  onToggleComplete
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${document.title}\n\n${document.description}\n\n${document.contentMarkdown}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (document.fileUrl) {
      const link = window.document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.downloadFileName || `${document.title}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    const fullText = `=====================================================
${document.title.toUpperCase()}
Módulo: ${module.title}
Formato: ${document.format}
=====================================================

DESCRIÇÃO:
${document.description}

CONTEÚDO:
-----------------------------------------------------
${document.contentMarkdown}
`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.downloadFileName || `${document.title.replace(/\s+/g, '_')}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onBackToModule}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para {module.title.replace(/^Módulo \d+:\s*/i, '')}</span>
      </button>

      {/* Main Document Box */}
      <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>{document.format}</span>
            <span>·</span>
            <span className="flex items-center gap-1 font-normal">
              <Clock className="h-3 w-3" />
              <span>{document.readTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
            {document.title}
          </h1>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {document.description}
          </p>

          {/* Action Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onToggleComplete(document.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCompleted ? 'Concluído' : 'Marcar como Concluído'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              <Download className="h-4 w-4 text-slate-500" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                <span>Abrir em Nova Aba</span>
              </a>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-5">
          {document.contentMarkdown.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-lg font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-base font-semibold text-slate-800 pt-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              const codeClean = paragraph.replace(/```[a-z]*\n?/g, '');
              return (
                <div key={idx} className="my-3 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap">
                  {codeClean}
                </div>
              );
            }
            if (paragraph.includes('|') && paragraph.includes('\n')) {
              const rows = paragraph.trim().split('\n');
              const headerCols = rows[0].split('|').filter(Boolean).map((c) => c.trim());
              const dataRows = rows.slice(2);
              return (
                <div key={idx} className="overflow-x-auto my-4 border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {headerCols.map((col, cIdx) => (
                          <th key={col + cIdx} className="px-4 py-2.5 font-semibold text-slate-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((r, rIdx) => {
                        const cols = r.split('|').filter(Boolean).map((c) => c.trim());
                        return (
                          <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/50">
                            {cols.map((col, cIdx) => (
                              <td key={col + cIdx} className="px-4 py-2.5 text-slate-600">
                                {col}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }
            return (
              <p key={idx} className="text-slate-700 whitespace-pre-line leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Embedded PDF Viewer if fileUrl is available */}
        {document.fileUrl && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Leitor de Documento:
              </h3>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 underline"
              >
                <span>Tela cheia</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="w-full h-[650px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
              <iframe
                src={document.fileUrl}
                title={document.title}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Bottom Back Action */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onBackToModule}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Materiais</span>
          </button>

          <button
            onClick={() => onToggleComplete(document.id)}
            className="text-xs font-semibold text-slate-900 hover:underline"
          >
            {isCompleted ? 'Desmarcar Conclusão' : 'Marcar como Concluído →'}
          </button>
        </div>
      </article>
    </div>
  );
};
