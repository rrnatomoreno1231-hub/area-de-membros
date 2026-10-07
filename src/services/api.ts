import { Member, ModuleItem, WebhookLog } from '../types/index.ts';

async function safeJsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.warn(`Non-JSON response from ${url} (${res.status}):`, text.slice(0, 100));
      return { success: false, message: 'Servidor indisponível no momento.' } as unknown as T;
    }
    
    return await res.json();
  } catch (err: any) {
    console.error(`Fetch error for ${url}:`, err);
    return { success: false, message: err.message || 'Erro ao conectar ao servidor.' } as unknown as T;
  }
}

export const api = {
  // Content
  async getContent(): Promise<{ modules: ModuleItem[]; settings: { productName: string; supportEmail: string; supportWhatsapp: string; webhookSecret: string } }> {
    try {
      const res = await fetch('/api/content');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {
      console.warn('getContent fetch failed, using default state');
    }
    return { modules: [], settings: { productName: 'Área de Membros', supportEmail: 'suporte@memberhub.digital', supportWhatsapp: '+55 11 98765-4321', webhookSecret: 'whsec' } };
  },

  async saveModule(module: ModuleItem): Promise<{ success: boolean; modules: ModuleItem[] }> {
    return safeJsonFetch<{ success: boolean; modules: ModuleItem[] }>('/api/content/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module)
    });
  },

  // Auth
  async requestCode(email: string): Promise<{ success: boolean; message: string; code?: string; buyerName?: string; notFound?: boolean }> {
    return safeJsonFetch<{ success: boolean; message: string; code?: string; buyerName?: string; notFound?: boolean }>('/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string; member?: Member }> {
    return safeJsonFetch<{ success: boolean; message: string; member?: Member }>('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
  },

  async quickLogin(email: string): Promise<{ success: boolean; member?: Member; message?: string }> {
    return safeJsonFetch<{ success: boolean; member?: Member; message?: string }>('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  // Member Activity
  async toggleComplete(email: string, documentId: string): Promise<{ success: boolean; completedDocumentIds: string[] }> {
    return safeJsonFetch<{ success: boolean; completedDocumentIds: string[] }>('/api/member/toggle-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, documentId })
    });
  },

  async toggleChecklist(email: string, documentId: string, itemId: string): Promise<{ success: boolean; checklistProgress: Record<string, string[]> }> {
    return safeJsonFetch<{ success: boolean; checklistProgress: Record<string, string[]> }>('/api/member/toggle-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, documentId, itemId })
    });
  },

  async saveNote(email: string, documentId: string, note: string): Promise<{ success: boolean; notes: Record<string, string> }> {
    return safeJsonFetch<{ success: boolean; notes: Record<string, string> }>('/api/member/save-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, documentId, note })
    });
  },

  // Admin
  async getAdminOverview() {
    return safeJsonFetch('/api/admin/overview');
  },

  async getAdminMembers(): Promise<Member[]> {
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return [];
  },

  async addAdminMember(data: { email: string; name: string; phone?: string; gateway?: string }): Promise<{ success: boolean; member: Member }> {
    return safeJsonFetch<{ success: boolean; member: Member }>('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async updateAdminMember(id: string, data: { status?: string; role?: string }): Promise<{ success: boolean; member: Member }> {
    return safeJsonFetch<{ success: boolean; member: Member }>(`/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deleteAdminMember(id: string): Promise<{ success: boolean }> {
    return safeJsonFetch<{ success: boolean }>(`/api/admin/members/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminWebhooks(): Promise<WebhookLog[]> {
    try {
      const res = await fetch('/api/admin/webhooks');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {}
    return [];
  },

  async simulatePurchase(gateway: string, email: string, name: string): Promise<{ success: boolean; message: string; simulatedPayload: any }> {
    return safeJsonFetch<{ success: boolean; message: string; simulatedPayload: any }>('/api/admin/simulate-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateway, email, name })
    });
  },

  async updateSettings(data: { productName?: string; supportEmail?: string; supportWhatsapp?: string }) {
    return safeJsonFetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};
