import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Member } from '../types/index.ts';
import { 
  X, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: Member) => void;
  onOpenSimulatorWithEmail?: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSimulatorWithEmail
}) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [notFoundEmail, setNotFoundEmail] = useState(false);

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setNotFoundEmail(false);

    try {
      const res = await api.requestCode(email);
      if (res.success) {
        setStep('code');
        setBuyerName(res.buyerName || '');
        if (res.code) {
          setDemoCode(res.code);
        }
      } else {
        if (res.notFound) {
          setNotFoundEmail(true);
        }
        setErrorMsg(res.message || 'E-mail não encontrado.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setErrorMsg('Digite o código numérico de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.verifyCode(email, code);
      if (res.success && res.member) {
        onSuccess(res.member);
        onClose();
      } else {
        setErrorMsg(res.message || 'Código inválido.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao verificar código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (targetEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.quickLogin(targetEmail);
      if (res.success && res.member) {
        onSuccess(res.member);
        onClose();
      } else {
        setErrorMsg(res.message || 'Erro no login rápido');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no login rápido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Acesso Exclusivo para Compradores</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {step === 'email' ? 'Acesse seus Documentos' : 'Confirmação de Acesso'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'email'
              ? 'Digite o mesmo e-mail que você utilizou na compra no gateway (Kiwify, Hotmart, Eduzz ou Stripe).'
              : `Enviamos um código de 6 dígitos para o e-mail cadastrado de ${buyerName || email}.`}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {notFoundEmail && onOpenSimulatorWithEmail && (
                <div className="mt-2 pt-2 border-t border-rose-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSimulatorWithEmail(email);
                    }}
                    className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline font-medium"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Simular compra para {email} agora</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Seu e-mail de compra:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verificando compra...</span>
              ) : (
                <>
                  <span>Continuar para a Área</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-2 font-medium">
                Ou acesse com 1 clique para demonstração:
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rrnatomoreno1231@gmail.com')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Renato Moreno (Produtor / Administrador)</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Entrar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('carla.mendes@empresa.com.br')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>Carla Mendes (Comprador via Hotmart)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Entrar</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Step 2: Code Verification */
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {/* Demo Code Helper */}
            {demoCode && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Código de Acesso Rápido:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCode(demoCode)}
                    className="text-[11px] underline text-amber-200 hover:text-white"
                  >
                    Preencher automático
                  </button>
                </div>
                <div className="font-mono text-base tracking-widest font-bold text-amber-400 text-center py-1 bg-slate-950/60 rounded">
                  {demoCode}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  (Simulação: Em produção o comprador recebe este código via e-mail automático)
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Código de 6 dígitos:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 849201"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-base tracking-widest text-center font-mono bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmar & Entrar</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMsg('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Digitar outro e-mail
              </button>

              <button
                type="button"
                onClick={handleRequestCode}
                className="text-xs text-amber-400 hover:underline"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          Integração ativa com Kiwify, Hotmart, Eduzz e Stripe via Webhook instantâneo.
        </div>
      </div>
    </div>
  );
};
