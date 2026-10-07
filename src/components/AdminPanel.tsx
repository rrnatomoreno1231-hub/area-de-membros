import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Member, ModuleItem, WebhookLog } from '../types/index.ts';
import { 
  ShieldCheck, 
  Webhook, 
  Users, 
  Layers, 
  Activity, 
  Copy, 
  Check, 
  Play, 
  Plus, 
  Trash2, 
  Search, 
  Lock, 
  Unlock, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

interface AdminPanelProps {
  modules: ModuleItem[];
  onModulesUpdate: (modules: ModuleItem[]) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  modules,
  onModulesUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'webhooks' | 'members' | 'logs'>('webhooks');
  const [members, setMembers] = useState<Member[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedGatewayGuide, setSelectedGatewayGuide] = useState<'kiwify' | 'hotmart' | 'eduzz' | 'stripe'>('kiwify');

  // Manual Member Add Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberGateway, setNewMemberGateway] = useState('Manual');

  // Simulator Modal State
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simGateway, setSimGateway] = useState('Kiwify');
  const [simName, setSimName] = useState('Mariana Costa');
  const [simEmail, setSimEmail] = useState('mariana.costa@gmail.com');
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const webhookEndpointUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/gateway`
    : 'https://seusite.com/api/webhook/gateway';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersData, logsData] = await Promise.all([
        api.getAdminMembers(),
        api.getAdminWebhooks()
      ]);
      setMembers(membersData);
      setWebhookLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookEndpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;

    try {
      const res = await api.addAdminMember({
        email: newMemberEmail,
        name: newMemberName,
        gateway: newMemberGateway
      });
      if (res.success) {
        setMembers([res.member, ...members]);
        setShowAddMemberModal(false);
        setNewMemberName('');
        setNewMemberEmail('');
      }
    } catch (err) {
      console.error('Failed to add member', err);
    }
  };

  const handleToggleMemberStatus = async (member: Member) => {
    const nextStatus = member.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await api.updateAdminMember(member.id, { status: nextStatus });
      if (res.success) {
        setMembers(members.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este comprador?')) return;
    try {
      const res = await api.deleteAdminMember(id);
      if (res.success) {
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete member', err);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimFeedback(null);
    try {
      const res = await api.simulatePurchase(simGateway, simEmail, simName);
      if (res.success) {
        setSimFeedback(res.message);
        loadData();
      }
    } catch (err: any) {
      setSimFeedback('Erro ao disparar simulação: ' + err.message);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.gateway.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para Módulos</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Painel do Produtor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configuração de Webhook para liberação automática de compras e gestão de membros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulatorModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simular Compra</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'webhooks'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Webhook className="h-4 w-4" />
          <span>Configurar Webhook</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Compradores ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Logs de Webhook ({webhookLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: WEBHOOK */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                URL de Notificação (Webhook)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cole esta URL nas configurações de Webhook da sua plataforma de vendas (Kiwify, Hotmart, Eduzz ou Stripe).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookEndpointUrl}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyWebhookUrl}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedUrl ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          {/* Platform Steps */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Instruções por Plataforma:
            </h3>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              {(['kiwify', 'hotmart', 'eduzz', 'stripe'] as const).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedGatewayGuide(plat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    selectedGatewayGuide === plat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              {selectedGatewayGuide === 'kiwify' && (
                <>
                  <p>1. Acesse o painel da <strong>Kiwify &gt; Apps &gt; Webhooks</strong>.</p>
                  <p>2. Clique em <strong>Criar Webhook</strong> e insira a URL copiada acima.</p>
                  <p>3. Selecione os eventos <strong>Compra Aprovada</strong> e <strong>Reembolso</strong>.</p>
                  <p>4. Salve. Pronto! Cada nova compra na Kiwify terá o acesso liberado imediatamente por e-mail.</p>
                </>
              )}
              {selectedGatewayGuide === 'hotmart' && (
                <>
                  <p>1. No painel da <strong>Hotmart</strong>, vá em <strong>Ferramentas &gt; Webhook</strong>.</p>
                  <p>2. Cadastre a URL do Webhook do seu produto.</p>
                  <p>3. Selecione o evento <strong>PURCHASE_APPROVED</strong>.</p>
                  <p>4. Salve as alterações.</p>
                </>
              )}
              {selectedGatewayGuide === 'eduzz' && (
                <>
                  <p>1. Acesse <strong>Eduzz &gt; Integrações &gt; Webhook</strong>.</p>
                  <p>2. Insira a URL e ative a notificação de status <strong>3 - Paga</strong>.</p>
                </>
              )}
              {selectedGatewayGuide === 'stripe' && (
                <>
                  <p>1. No Dashboard da <strong>Stripe</strong>, vá em <strong>Developers &gt; Webhooks</strong>.</p>
                  <p>2. Adicione a URL com o evento <strong>checkout.session.completed</strong>.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
                title="Atualizar"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Membro Manual</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Comprador</th>
                  <th className="px-4 py-3 font-semibold">Origem</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const isActive = m.status === 'active';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.gateway}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(m.purchaseDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isActive ? 'Ativo' : m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleMemberStatus(m)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title={isActive ? 'Bloquear' : 'Ativar'}
                          >
                            {isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {webhookLogs.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              Nenhum webhook recebido ainda. Use a opção "Simular Compra" para testar.
            </div>
          ) : (
            webhookLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.gateway}</span>
                    <span className="text-slate-400 font-mono">[{log.event}]</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')} - {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-slate-600">
                  {log.buyerName} ({log.buyerEmail})
                </div>
                <div className="text-slate-500 bg-slate-50 p-2 rounded-lg font-mono text-[11px]">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-bold text-slate-900">Simulador de Compra</h3>
            <p className="text-xs text-slate-500 mt-1">
              Simula o disparo de webhook enviado pelo checkout.
            </p>

            {simFeedback && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
                {simFeedback}
              </div>
            )}

            <form onSubmit={handleRunSimulation} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gateway:</label>
                <select
                  value={simGateway}
                  onChange={(e) => setSimGateway(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Kiwify">Kiwify (Compra Aprovada)</option>
                  <option value="Hotmart">Hotmart (PURCHASE_APPROVED)</option>
                  <option value="Eduzz">Eduzz (Status 3 - Paga)</option>
                  <option value="Stripe">Stripe (checkout.session.completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Comprador:</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  required
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail do Comprador:</label>
                <input
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  required
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatorModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Disparar Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-bold text-slate-900">Adicionar Membro Manual</h3>
            <form onSubmit={handleAddMember} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome:</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail:</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
