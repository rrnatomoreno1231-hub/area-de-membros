import React from 'react';
import { 
  X, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportEmail: string;
  supportWhatsapp: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  supportEmail,
  supportWhatsapp
}) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Como funciona o reconhecimento do meu acesso após a compra?',
      a: 'Assim que o gateway de pagamento (Kiwify, Hotmart, Eduzz ou Stripe) aprova sua transação, nosso servidor recebe uma notificação instantânea (Webhook) cadastrando seu e-mail como comprador ativo. Basta digitar o mesmo e-mail para receber seu código e acessar imediatamente.'
    },
    {
      q: 'Comprei agora e meu e-mail não foi encontrado. O que fazer?',
      a: 'Pagamentos via Pix e Cartão de Crédito aprovam em poucos segundos. Boletos bancários levam de 1 a 3 dias úteis. Caso seu pagamento já esteja aprovado, verifique se não digitou o e-mail com algum erro ou entre em contato com nosso suporte abaixo.'
    },
    {
      q: 'Posso baixar os documentos no meu computador?',
      a: 'Sim! Todos os documentos, minutas de contratos e planilhas contam com botão de download direto para formatos padrão (.DOCX, .XLSX, .PDF e .TXT).'
    },
    {
      q: 'Como funciona a garantia incondicional?',
      a: 'Você tem garantia incondicional de 7 dias a contar da confirmação da compra. O estorno pode ser solicitado diretamente na plataforma do gateway ou pelo nosso canal de atendimento.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <HelpCircle className="h-4 w-4" />
          <span>Suporte & Dúvidas</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Perguntas Frequentes
        </h2>

        {/* FAQs */}
        <div className="mt-6 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 mb-1">
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Support contacts */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 mb-3">
            Precisa de ajuda da nossa equipe?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${supportWhatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Atendimento WhatsApp</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>E-mail de Suporte</span>
              </div>
              <span className="text-[11px] text-slate-400">Enviar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
