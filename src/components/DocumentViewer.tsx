import React, { useState, useEffect } from 'react';
import { DocumentItem, Member } from '../types/index.ts';
import { api } from '../services/api.ts';
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  CheckSquare, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  PenLine,
  Save,
  Clock,
  HardDrive,
  Sparkles
} from 'lucide-react';

interface DocumentViewerProps {
  document: DocumentItem;
  moduleTitle: string;
  onBack: () => void;
  currentMember: Member | null;
  onRequireAuth: () => void;
  onToggleComplete: (docId: string) => void;
  isCompleted: boolean;
  onSelectDocument: (docId: string) => void;
  allDocsInModule: DocumentItem[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  moduleTitle,
  onBack,
  currentMember,
  onRequireAuth,
  onToggleComplete,
  isCompleted,
  onSelectDocument,
  allDocsInModule
}) => {
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Load member's saved notes and checklist items
  useEffect(() => {
    if (currentMember) {
      setNoteText(currentMember.personalNotes?.[document.id] || '');
      setCheckedItems(currentMember.checklistProgress?.[document.id] || []);
    } else {
      setNoteText('');
      setCheckedItems([]);
    }
  }, [document.id, currentMember]);

  // Find previous and next documents
  const currentIndex = allDocsInModule.findIndex((d) => d.id === document.id);
  const prevDoc = currentIndex > 0 ? allDocsInModule[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocsInModule.length - 1 ? allDocsInModule[currentIndex + 1] : null;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(
      `${document.title}\n\n${document.description}\n\n${document.contentMarkdown}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    // Generate clean text/markdown export blob
    const content = `=====================================================
${document.title.toUpperCase()}
Módulo: ${moduleTitle}
Formato Original: ${document.format}
=====================================================

DESCRIÇÃO:
${document.description}

PONTOS PRINCIPAIS:
${document.keyTakeaways.map((item, idx) => `[${idx + 1}] ${item}`).join('\n')}

CHECKLIST DE IMPLEMENTAÇÃO:
${document.checklistItems.map((chk) => `[ ] ${chk.text}`).join('\n')}

CONTEÚDO DO DOCUMENTO:
-----------------------------------------------------
${document.contentMarkdown}

-----------------------------------------------------
MemberHub - Documento Exclusivo de Membro
Entregue com suporte e atualização contínua.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.downloadFileName || `${document.title.replace(/\s+/g, '_')}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!currentMember) {
      onRequireAuth();
      return;
    }

    const updated = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];

    setCheckedItems(updated);

    try {
      await api.toggleChecklist(currentMember.email, document.id, itemId);
    } catch (err) {
      console.error('Failed to toggle checklist', err);
    }
  };

  const handleSaveNote = async () => {
    if (!currentMember) {
      onRequireAuth();
      return;
    }

    setIsSavingNote(true);
    try {
      await api.saveNote(currentMember.email, document.id, noteText);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const renderTypeIcon = () => {
    switch (document.type) {
      case 'spreadsheet':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
      case 'contract':
        return <FileText className="h-5 w-5 text-indigo-400" />;
      case 'sop':
        return <CheckSquare className="h-5 w-5 text-cyan-400" />;
      default:
        return <FileText className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Módulos</span>
        </button>

        <div className="text-xs text-slate-400 truncate max-w-md hidden sm:block">
          <span>{moduleTitle}</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-300 font-medium">{document.title}</span>
        </div>
      </div>

      {/* Main Document Container */}
      <article className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Document Header Zone */}
        <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-slate-900">
          {/* Metadata: Clean text with · separator (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 font-medium text-amber-400">
              {renderTypeIcon()}
              <span>{document.format}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{document.readTime}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 text-slate-500" />
              <span>{document.fileSize}</span>
            </span>
            {isCompleted && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Concluído por você</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {document.title}
          </h1>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-3xl">
            {document.description}
          </p>

          {/* Action Toolbar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mark Complete Button */}
              <button
                onClick={() => {
                  if (!currentMember) {
                    onRequireAuth();
                  } else {
                    onToggleComplete(document.id);
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isCompleted ? 'Concluído (Clique para desmarcar)' : 'Marcar como Concluído'}</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4 text-slate-400" />
                <span>Baixar Documento</span>
              </button>

              {/* Copy Content Button */}
              <button
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            {/* Notes Toggle Button */}
            <button
              onClick={() => {
                if (!currentMember) {
                  onRequireAuth();
                } else {
                  setShowNotes(!showNotes);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                showNotes || noteText.trim().length > 0
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>{showNotes ? 'Fechar Anotações' : 'Anotações Pessoais'}</span>
              {noteText.trim().length > 0 && !showNotes && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Optional Collapsible Notes Box */}
        {showNotes && (
          <div className="p-5 sm:p-6 bg-slate-950/70 border-b border-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                <span>Suas anotações privadas para este documento:</span>
              </label>
              {noteSavedFeedback && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Salvo com sucesso</span>
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Digite aqui ideias práticas, adaptações para sua empresa ou dúvidas para consultar depois..."
              className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSavingNote ? 'Salvando...' : 'Salvar Anotação'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Document Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Key Takeaways Box (Executive Summary) */}
          {document.keyTakeaways && document.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Pontos Chave & Diretrizes Executivas</span>
              </h2>
              <ul className="space-y-2">
                {document.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. Interactive Action Checklist */}
          {document.checklistItems && document.checklistItems.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  <span>Checklist de Aplicação Prática</span>
                </h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {checkedItems.length}/{document.checklistItems.length} concluídos
                </span>
              </div>
              <div className="space-y-2">
                {document.checklistItems.map((chk) => {
                  const isChecked = checkedItems.includes(chk.id);
                  return (
                    <label
                      key={chk.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleChecklist(chk.id);
                      }}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {chk.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Formatted Content Rendering */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            {document.contentMarkdown.split('\n\n').map((paragraph, idx) => {
              // Markdown Headers
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-white pt-4 pb-1 border-b border-slate-800">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base font-semibold text-amber-300 pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              // Code or prompt blocks
              if (paragraph.startsWith('```')) {
                const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '');
                return (
                  <div key={idx} className="my-3 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                    {cleanCode}
                  </div>
                );
              }
              // Simple Markdown Table Rendering
              if (paragraph.includes('|') && paragraph.includes('\n')) {
                const rows = paragraph.trim().split('\n');
                const headerCols = rows[0].split('|').filter(Boolean).map((c) => c.trim());
                const dataRows = rows.slice(2); // skip header & separator
                return (
                  <div key={idx} className="overflow-x-auto my-4 border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800">
                          {headerCols.map((col, cIdx) => (
                            <th key={cIdx} className="px-4 py-2.5 font-semibold text-slate-200">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataRows.map((r, rIdx) => {
                          const cols = r.split('|').filter(Boolean).map((c) => c.trim());
                          return (
                            <tr key={rIdx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                              {cols.map((col, cIdx) => (
                                <td key={cIdx} className="px-4 py-2.5 text-slate-300">
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
              // Regular paragraphs or numbered lists
              return (
                <p key={idx} className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* 4. External Resource Links */}
          {document.resources && document.resources.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Arquivos & Links Complementares
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {document.resources.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (res.url === '#download') {
                        handleDownloadFile();
                      } else {
                        window.open(res.url, '_blank');
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-500">{res.type}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation (Prev / Next Document) */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {prevDoc ? (
            <button
              onClick={() => onSelectDocument(prevDoc.id)}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500">Documento Anterior</div>
                <div className="truncate max-w-[200px]">{prevDoc.title}</div>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextDoc ? (
            <button
              onClick={() => onSelectDocument(nextDoc.id)}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors ml-auto"
            >
              <div className="text-right">
                <div className="text-[10px] text-slate-500">Próximo Documento</div>
                <div className="truncate max-w-[200px]">{nextDoc.title}</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 ml-auto"
            >
              <span>Ver todos os módulos</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
};
