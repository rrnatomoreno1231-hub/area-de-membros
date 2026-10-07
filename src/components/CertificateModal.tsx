import React from 'react';
import { Member } from '../types/index.ts';
import { X, Award, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  productName: string;
  totalDocs: number;
  completedDocs: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  member,
  productName,
  totalDocs,
  completedDocs
}) => {
  if (!isOpen) return null;

  const isCompleted = totalDocs > 0 && completedDocs >= totalDocs;
  const issueDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const certId = member ? `CERT-${member.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}` : 'CERT-PREVIEW';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Printable Area */}
        <div id="printable-certificate" className="relative p-8 sm:p-12 border-2 border-slate-300 rounded-2xl bg-white text-center shadow-xs">
          {/* Icon Badge */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-900 mb-4">
            <Award className="h-7 w-7" />
          </div>

          <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-1">
            Certificado de Conclusão
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            CERTIFICADO DE APROVEITAMENTO
          </h2>

          <p className="mt-4 text-xs text-slate-500">Certificamos com distinção que</p>

          <div className="my-2 text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 max-w-md mx-auto">
            {member?.name || 'Membro do Programa'}
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mt-3">
            Concluiu satisfatoriamente todos os módulos de documentos executivos, minutas contratuais e materiais práticos do programa <strong>{productName}</strong>.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div className="text-left">
              <div>Emitido em: <span className="text-slate-700 font-medium">{issueDate}</span></div>
              <div className="font-mono text-[10px]">Autenticidade: {certId}</div>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Validação Digital Oficial</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            {isCompleted ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>100% dos materiais concluídos!</span>
              </span>
            ) : (
              <span>
                Progresso: <strong className="text-slate-700">{completedDocs}/{totalDocs}</strong> materiais concluídos.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
