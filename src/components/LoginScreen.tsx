import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Member } from '../types/index.ts';
import { initialMembers } from '../data/initialData.ts';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound, ShieldCheck, Zap } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (member: Member) => void;
  onSimulatePurchase: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSimulatePurchase
}) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim() || 'rrnatomoreno1231@gmail.com';

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.quickLogin(targetEmail);
      if (res.success && res.member) {
        onLoginSuccess(res.member);
      } else {
        // Fallback to code request if quick login returns error
        const codeRes = await api.requestCode(targetEmail);
        if (codeRes.success) {
          setStep('code');
          setBuyerName(codeRes.buyerName || '');
          if (codeRes.code) {
            setDemoCode(codeRes.code);
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setErrorMessage('Digite o código numérico de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.verifyCode(email, code);
      if (res.success && res.member) {
        onLoginSuccess(res.member);
      } else {
        setErrorMessage(res.message || 'Código incorreto.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao validar código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.quickLogin(demoEmail);
      if (res.success && res.member) {
        onLoginSuccess(res.member);
      } else {
        setErrorMessage(res.message || 'Não foi possível entrar com este e-mail.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold text-lg mb-3 shadow-sm">
            M
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Área de Membros
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {step === 'email'
              ? 'Digite o e-mail cadastrado na sua compra para acessar seus materiais.'
              : `Enviamos um código de 6 dígitos para o e-mail cadastrado de ${buyerName || email}.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {notFound && (
                <div className="mt-2.5 pt-2 border-t border-rose-200/80">
                  <button
                    type="button"
                    onClick={() => onSimulatePurchase(email)}
                    className="text-slate-900 font-semibold underline hover:text-slate-700 text-xs"
                  >
                    Simular compra para {email} e liberar na hora
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Input Email */}
        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seu e-mail de compra
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <span>Entrando...</span>
              ) : (
                <>
                  <span>Acessar Meus Módulos</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Direct Instant Access Button */}
            <button
              type="button"
              onClick={() => onLoginSuccess(initialMembers[0])}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Entrar Direto na Área de Membros</span>
            </button>

            {/* Quick Demo Options */}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 text-center mb-2.5">
                Ou acesse com 1 clique para testar:
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('rrnatomoreno1231@gmail.com')}
                  className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between transition-colors"
                >
                  <span>Renato Moreno (Comprador Cadastrado)</span>
                  <span className="text-[11px] text-slate-400">Entrar →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('carla.mendes@empresa.com.br')}
                  className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between transition-colors"
                >
                  <span>Carla Mendes (Hotmart)</span>
                  <span className="text-[11px] text-slate-400">Entrar →</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Step 2: Input OTP Code */
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {demoCode && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">Código de Acesso:</span>
                  <button
                    type="button"
                    onClick={() => setCode(demoCode)}
                    className="text-slate-900 underline font-medium hover:text-slate-700"
                  >
                    Preencher automático
                  </button>
                </div>
                <div className="font-mono text-xl tracking-widest font-bold text-slate-900 text-center py-1.5 bg-white border border-slate-200 rounded-lg mt-1">
                  {demoCode}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 text-center">
                  (Simulação: Em produção o comprador recebe no e-mail)
                </div>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Digite os 6 dígitos do código
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 text-base tracking-widest text-center font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <span>Validando...</span>
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
                  setErrorMessage('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleRequestCode}
                className="text-xs text-slate-900 hover:underline font-medium"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {/* Security badge note */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Acesso automático via Kiwify, Hotmart, Eduzz e Stripe</span>
        </div>
      </div>
    </div>
  );
};
