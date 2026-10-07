import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { initialMembers, initialModules } from './src/data/initialData.ts';
import { Member, ModuleItem, WebhookLog } from './src/types/index.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory + Persistent Store (Vercel serverless /tmp compatible)
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'members_store.json');
const BUNDLED_STORE_FILE = path.resolve(process.cwd(), 'data', 'members_store.json');

interface AppStore {
  members: Member[];
  modules: ModuleItem[];
  webhookLogs: WebhookLog[];
  settings: {
    productName: string;
    supportEmail: string;
    supportWhatsapp: string;
    webhookSecret: string;
  };
}

let store: AppStore = {
  members: initialMembers,
  modules: initialModules,
  webhookLogs: [],
  settings: {
    productName: 'MasterKit: Documentos, Contratos & SOPs Executivos',
    supportEmail: 'suporte@memberhub.digital',
    supportWhatsapp: '+55 11 98765-4321',
    webhookSecret: 'whsec_memberhub_live'
  }
};

// Load bundled or tmp stored state if available
let rawStoreData: string | null = null;
try {
  if (fs.existsSync(STORE_FILE)) {
    rawStoreData = fs.readFileSync(STORE_FILE, 'utf-8');
  } else if (fs.existsSync(BUNDLED_STORE_FILE)) {
    rawStoreData = fs.readFileSync(BUNDLED_STORE_FILE, 'utf-8');
  }
} catch (e) {
  console.warn('Could not read stored json, using initial state');
}

if (rawStoreData) {
  try {
    const parsed = JSON.parse(rawStoreData);
    store = {
      ...store,
      ...parsed,
      members: parsed.members && parsed.members.length > 0 ? parsed.members : initialMembers,
      modules: parsed.modules && parsed.modules.length > 0 ? parsed.modules : initialModules
    };
  } catch (err) {
    console.error('Error parsing store data:', err);
  }
}

function persistStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal on serverless
    console.warn('Could not persist store to file:', err);
  }
}

// In-memory OTP storage: email -> { code: string, expiresAt: number }
const pendingOtps = new Map<string, { code: string; expiresAt: number }>();

// Seed initial webhook log for demonstration
if (store.webhookLogs.length === 0) {
  store.webhookLogs.push({
    id: 'wh-seed-01',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    gateway: 'Kiwify',
    event: 'order_approved',
    buyerEmail: 'rrnatomoreno1231@gmail.com',
    buyerName: 'Renato Moreno',
    status: 'success',
    rawPayload: {
      order_id: 'KW-89214710',
      order_status: 'paid',
      Customer: {
        full_name: 'Renato Moreno',
        email: 'rrnatomoreno1231@gmail.com',
        mobile: '+5511987654321'
      }
    },
    message: 'Comprador reconhecido e acesso concedido automaticamente.'
  });
}

// ----------------- API ROUTES -----------------

// 1. Content & Modules
app.get('/api/content', (_req: Request, res: Response) => {
  res.json({
    modules: store.modules,
    settings: store.settings
  });
});

app.post('/api/content/modules', (req: Request, res: Response) => {
  const newModule: ModuleItem = req.body;
  if (!newModule.id || !newModule.title) {
    res.status(400).json({ error: 'Módulo inválido' });
    return;
  }
  const existingIdx = store.modules.findIndex((m) => m.id === newModule.id);
  if (existingIdx >= 0) {
    store.modules[existingIdx] = newModule;
  } else {
    store.modules.push(newModule);
  }
  persistStore();
  res.json({ success: true, modules: store.modules });
});

// 2. Authentication & Verification
app.post('/api/auth/request-code', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, message: 'Informe um e-mail válido.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  let member = store.members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (!member) {
    // Auto-create active member so any typed email gets immediate access
    member = {
      id: 'mem-' + Date.now(),
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      phone: '',
      gateway: 'Kiwify',
      transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      purchaseDate: new Date().toISOString(),
      status: 'active',
      completedDocumentIds: [],
      personalNotes: {},
      checklistProgress: {},
      role: 'member'
    };
    store.members.unshift(member);
    persistStore();
  }

  if (member.status === 'refunded' || member.status === 'cancelled' || member.status === 'blocked') {
    res.status(403).json({
      success: false,
      message: `Acesso indisponível. Seu status atual é: ${member.status.toUpperCase()} (estornado ou cancelado).`
    });
    return;
  }

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  pendingOtps.set(cleanEmail, { code, expiresAt });

  console.log(`[AUTH] Código gerado para ${cleanEmail}: ${code}`);

  res.json({
    success: true,
    message: 'Código de acesso gerado com sucesso!',
    code: code,
    buyerName: member.name
  });
});

app.post('/api/auth/verify-code', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ success: false, message: 'E-mail e código são obrigatórios.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.toString().trim();
  let member = store.members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (!member) {
    member = {
      id: 'mem-' + Date.now(),
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      phone: '',
      gateway: 'Kiwify',
      transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      purchaseDate: new Date().toISOString(),
      status: 'active',
      completedDocumentIds: [],
      personalNotes: {},
      checklistProgress: {},
      role: 'member'
    };
    store.members.unshift(member);
    persistStore();
  }

  // Clean pending OTP and update last login
  pendingOtps.delete(cleanEmail);
  member.lastLogin = new Date().toISOString();
  persistStore();

  res.json({
    success: true,
    message: 'Autenticação realizada com sucesso!',
    member
  });
});

// Direct quick login (for instant switching in member area)
app.post('/api/auth/quick-login', (req: Request, res: Response) => {
  const { email } = req.body;
  const cleanEmail = (email || 'comprador@exemplo.com').trim().toLowerCase();
  let member = store.members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (!member) {
    member = {
      id: 'mem-' + Date.now(),
      email: cleanEmail,
      name: cleanEmail.split('@')[0] || 'Comprador',
      phone: '',
      gateway: 'Kiwify',
      transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      purchaseDate: new Date().toISOString(),
      status: 'active',
      completedDocumentIds: [],
      personalNotes: {},
      checklistProgress: {},
      role: 'member'
    };
    store.members.unshift(member);
    persistStore();
  }

  member.status = 'active';
  member.lastLogin = new Date().toISOString();
  persistStore();

  res.json({ success: true, member });
});

// 3. Member Interactions (Progress, Notes, Checklists)
app.post('/api/member/toggle-complete', (req: Request, res: Response) => {
  const { email, documentId } = req.body;
  const member = store.members.find((m) => m.email.toLowerCase() === (email || '').trim().toLowerCase());

  if (!member) {
    res.status(404).json({ error: 'Membro não encontrado' });
    return;
  }

  const set = new Set(member.completedDocumentIds || []);
  if (set.has(documentId)) {
    set.delete(documentId);
  } else {
    set.add(documentId);
  }

  member.completedDocumentIds = Array.from(set);
  persistStore();

  res.json({ success: true, completedDocumentIds: member.completedDocumentIds });
});

app.post('/api/member/toggle-checklist', (req: Request, res: Response) => {
  const { email, documentId, itemId } = req.body;
  const member = store.members.find((m) => m.email.toLowerCase() === (email || '').trim().toLowerCase());

  if (!member) {
    res.status(404).json({ error: 'Membro não encontrado' });
    return;
  }

  if (!member.checklistProgress) {
    member.checklistProgress = {};
  }

  const list = member.checklistProgress[documentId] || [];
  const set = new Set(list);
  if (set.has(itemId)) {
    set.delete(itemId);
  } else {
    set.add(itemId);
  }

  member.checklistProgress[documentId] = Array.from(set);
  persistStore();

  res.json({ success: true, checklistProgress: member.checklistProgress });
});

app.post('/api/member/save-note', (req: Request, res: Response) => {
  const { email, documentId, note } = req.body;
  const member = store.members.find((m) => m.email.toLowerCase() === (email || '').trim().toLowerCase());

  if (!member) {
    res.status(404).json({ error: 'Membro não encontrado' });
    return;
  }

  if (!member.personalNotes) {
    member.personalNotes = {};
  }

  member.personalNotes[documentId] = note || '';
  persistStore();

  res.json({ success: true, notes: member.personalNotes });
});

// 4. SMART WEBHOOK INTEGRATION ENDPOINT
// Accepts Webhooks from Kiwify, Hotmart, Eduzz, Stripe, Kirvano, Braip, Monetizze, Asaas, etc.
app.post('/api/webhook/gateway', (req: Request, res: Response) => {
  const payload = req.body || {};
  console.log('[WEBHOOK RECEIVED]', JSON.stringify(payload, null, 2));

  let detectedGateway = 'Webhook';
  let buyerEmail = '';
  let buyerName = '';
  let buyerPhone = '';
  let eventType = 'unknown';
  let isPaymentSuccess = false;
  let isCancellation = false;
  let transactionId = 'TX-' + Date.now();

  // Kiwify Format Check
  if (payload.order_status !== undefined || payload.Customer !== undefined || payload.order_id !== undefined) {
    detectedGateway = 'Kiwify';
    const customer = payload.Customer || payload.customer || {};
    buyerEmail = customer.email || payload.email || '';
    buyerName = customer.full_name || customer.name || 'Cliente Kiwify';
    buyerPhone = customer.mobile || customer.phone || '';
    transactionId = payload.order_id || payload.order_ref || transactionId;
    const status = (payload.order_status || '').toLowerCase();
    eventType = `order_${status}`;

    if (status === 'paid' || status === 'approved' || status === 'completed') {
      isPaymentSuccess = true;
    } else if (status === 'refunded' || status === 'chargedback' || status === 'cancelled') {
      isCancellation = true;
    }
  }
  // Hotmart Format Check
  else if (payload.event !== undefined || payload.data?.buyer !== undefined) {
    detectedGateway = 'Hotmart';
    eventType = payload.event || 'PURCHASE';
    const buyer = payload.data?.buyer || payload.buyer || {};
    buyerEmail = buyer.email || '';
    buyerName = buyer.name || 'Cliente Hotmart';
    transactionId = payload.data?.purchase?.transaction || payload.transaction || transactionId;

    if (eventType === 'PURCHASE_APPROVED' || eventType === 'PURCHASE_COMPLETE') {
      isPaymentSuccess = true;
    } else if (eventType === 'PURCHASE_REFUNDED' || eventType === 'PURCHASE_CANCELED' || eventType === 'PURCHASE_CHARGEBACK') {
      isCancellation = true;
    }
  }
  // Eduzz Format Check
  else if (payload.trans_status !== undefined || payload.cus_email !== undefined) {
    detectedGateway = 'Eduzz';
    buyerEmail = payload.cus_email || '';
    buyerName = payload.cus_name || 'Cliente Eduzz';
    buyerPhone = payload.cus_tel || '';
    transactionId = payload.trans_cod || transactionId;
    const transStatus = Number(payload.trans_status);
    eventType = `trans_${transStatus}`;

    if (transStatus === 3 || transStatus === 4) { // 3: Paga, 4: Finalizada
      isPaymentSuccess = true;
    } else if (transStatus === 6 || transStatus === 7) { // 6: Reembolsada, 7: Estornada
      isCancellation = true;
    }
  }
  // Stripe Format Check
  else if (payload.type && (payload.type.startsWith('checkout.') || payload.type.startsWith('payment_intent.') || payload.type.startsWith('charge.'))) {
    detectedGateway = 'Stripe';
    eventType = payload.type;
    const obj = payload.data?.object || {};
    const customer = obj.customer_details || {};
    buyerEmail = customer.email || obj.receipt_email || obj.billing_details?.email || '';
    buyerName = customer.name || obj.billing_details?.name || 'Cliente Stripe';
    transactionId = obj.id || transactionId;

    if (payload.type === 'checkout.session.completed' || payload.type === 'payment_intent.succeeded') {
      isPaymentSuccess = true;
    } else if (payload.type === 'charge.refunded' || payload.type === 'customer.subscription.deleted') {
      isCancellation = true;
    }
  }
  // Generic standard fallback
  else {
    detectedGateway = payload.gateway || 'Gateway';
    buyerEmail = payload.email || payload.buyerEmail || '';
    buyerName = payload.name || payload.buyerName || 'Comprador';
    buyerPhone = payload.phone || '';
    eventType = payload.event || payload.status || 'purchase';
    const st = (payload.status || eventType).toLowerCase();
    if (st.includes('paid') || st.includes('approved') || st.includes('success')) {
      isPaymentSuccess = true;
    } else if (st.includes('refund') || st.includes('cancel')) {
      isCancellation = true;
    } else {
      isPaymentSuccess = true; // default positive on direct webhook test
    }
  }

  // Validate clean email
  const cleanEmail = (buyerEmail || '').trim().toLowerCase();
  if (!cleanEmail) {
    const errorLog: WebhookLog = {
      id: 'wh-' + Date.now(),
      timestamp: new Date().toISOString(),
      gateway: detectedGateway,
      event: eventType,
      buyerEmail: 'não detectado',
      buyerName: buyerName || 'Desconhecido',
      status: 'error',
      rawPayload: payload,
      message: 'Webhook recebido mas nenhum endereço de e-mail foi encontrado no payload.'
    };
    store.webhookLogs.unshift(errorLog);
    persistStore();
    res.status(400).json({ error: 'Nenhum e-mail identificado no webhook' });
    return;
  }

  let logMessage = '';
  let logStatus: 'success' | 'ignored' = 'success';

  // Handle Cancellation / Refund
  if (isCancellation) {
    const existing = store.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.status = 'refunded';
      logMessage = `Acesso suspenso para ${cleanEmail} devido a estorno/reembolso via ${detectedGateway}.`;
    } else {
      logMessage = `Notificação de estorno para ${cleanEmail}, mas membro não estava cadastrado.`;
      logStatus = 'ignored';
    }
  }
  // Handle Payment Approved / Access Grant
  else if (isPaymentSuccess) {
    const existingIndex = store.members.findIndex((m) => m.email.toLowerCase() === cleanEmail);

    if (existingIndex >= 0) {
      // Re-activate member if previously cancelled or update details
      store.members[existingIndex].status = 'active';
      store.members[existingIndex].name = buyerName || store.members[existingIndex].name;
      store.members[existingIndex].gateway = detectedGateway as any;
      store.members[existingIndex].transactionId = transactionId;
      logMessage = `Membro já existente ${cleanEmail} revalidado com sucesso via ${detectedGateway}.`;
    } else {
      // Create new member
      const newMember: Member = {
        id: 'mem-' + Date.now(),
        email: cleanEmail,
        name: buyerName || 'Novo Membro',
        phone: buyerPhone,
        gateway: (['Kiwify', 'Hotmart', 'Eduzz', 'Stripe'].includes(detectedGateway) ? detectedGateway : 'Outro') as any,
        transactionId,
        purchaseDate: new Date().toISOString(),
        status: 'active',
        completedDocumentIds: [],
        personalNotes: {},
        checklistProgress: {},
        role: 'member'
      };
      store.members.unshift(newMember);
      logMessage = `Novo comprador ${buyerName} (${cleanEmail}) cadastrado e liberado automaticamente via ${detectedGateway}.`;
    }
  } else {
    logMessage = `Evento ${eventType} recebido de ${detectedGateway}, nenhuma alteração de acesso necessária.`;
    logStatus = 'ignored';
  }

  // Register Webhook Log
  const newLog: WebhookLog = {
    id: 'wh-' + Date.now(),
    timestamp: new Date().toISOString(),
    gateway: detectedGateway,
    event: eventType,
    buyerEmail: cleanEmail,
    buyerName,
    status: logStatus,
    rawPayload: payload,
    message: logMessage
  };

  store.webhookLogs.unshift(newLog);
  // Keep last 50 logs
  if (store.webhookLogs.length > 50) {
    store.webhookLogs = store.webhookLogs.slice(0, 50);
  }

  persistStore();

  res.status(200).json({
    received: true,
    gateway: detectedGateway,
    event: eventType,
    email: cleanEmail,
    status: logStatus,
    message: logMessage
  });
});

// 5. Admin Endpoints
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const total = store.members.length;
  const active = store.members.filter((m) => m.status === 'active').length;
  const refunded = store.members.filter((m) => m.status === 'refunded').length;
  
  let totalDocs = 0;
  store.modules.forEach((mod) => (totalDocs += mod.documents.length));
  
  let totalCompletions = 0;
  store.members.forEach((m) => (totalCompletions += m.completedDocumentIds.length));

  res.json({
    totalMembers: total,
    activeMembers: active,
    refundedMembers: refunded,
    totalModules: store.modules.length,
    totalDocuments: totalDocs,
    totalCompletions,
    totalWebhooks: store.webhookLogs.length
  });
});

app.get('/api/admin/members', (_req: Request, res: Response) => {
  res.json(store.members);
});

app.post('/api/admin/members', (req: Request, res: Response) => {
  const { email, name, phone, gateway } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: 'E-mail e Nome são obrigatórios.' });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  const existing = store.members.find((m) => m.email.toLowerCase() === cleanEmail);
  if (existing) {
    existing.status = 'active';
    persistStore();
    res.json({ success: true, member: existing, note: 'Membro reativado' });
    return;
  }

  const member: Member = {
    id: 'mem-' + Date.now(),
    email: cleanEmail,
    name: name.trim(),
    phone: phone || '',
    gateway: gateway || 'Manual',
    transactionId: 'MANUAL-' + Math.floor(100000 + Math.random() * 900000),
    purchaseDate: new Date().toISOString(),
    status: 'active',
    completedDocumentIds: [],
    personalNotes: {},
    role: 'member'
  };

  store.members.unshift(member);
  persistStore();
  res.json({ success: true, member });
});

app.patch('/api/admin/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, role } = req.body;
  const member = store.members.find((m) => m.id === id);
  if (!member) {
    res.status(404).json({ error: 'Membro não encontrado' });
    return;
  }

  if (status) member.status = status;
  if (role) member.role = role;
  persistStore();

  res.json({ success: true, member });
});

app.delete('/api/admin/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.members.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Membro não encontrado' });
    return;
  }
  store.members.splice(index, 1);
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/webhooks', (_req: Request, res: Response) => {
  res.json(store.webhookLogs);
});

// One-click purchase simulator for creator/testing
app.post('/api/admin/simulate-purchase', (req: Request, res: Response) => {
  const { gateway = 'Kiwify', email = 'comprador.teste@gmail.com', name = 'Comprador Simulado' } = req.body;

  let simulatedPayload: any = {};
  const orderId = 'SIM-' + Math.floor(100000 + Math.random() * 900000);

  if (gateway === 'Kiwify') {
    simulatedPayload = {
      order_id: orderId,
      order_status: 'paid',
      order_ref: 'REF-KW' + Date.now().toString().slice(-6),
      Customer: {
        full_name: name,
        email: email,
        mobile: '+5511999887766'
      },
      Subscription: null,
      created_at: new Date().toISOString()
    };
  } else if (gateway === 'Hotmart') {
    simulatedPayload = {
      event: 'PURCHASE_APPROVED',
      version: '2.0.0',
      data: {
        buyer: {
          name: name,
          email: email,
          checkout_phone: '11999887766'
        },
        purchase: {
          transaction: orderId,
          status: 'COMPLETE',
          order_date: Date.now()
        }
      }
    };
  } else if (gateway === 'Eduzz') {
    simulatedPayload = {
      trans_status: 3,
      trans_cod: orderId,
      cus_name: name,
      cus_email: email,
      cus_tel: '11999887766',
      trans_valorpago: 297.00
    };
  } else {
    // Stripe
    simulatedPayload = {
      id: 'evt_' + orderId,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_' + orderId,
          customer_details: {
            name: name,
            email: email
          },
          payment_status: 'paid'
        }
      }
    };
  }

  // Dispatch internally into the webhook handler logic
  const cleanEmail = email.trim().toLowerCase();
  const existingIdx = store.members.findIndex((m) => m.email.toLowerCase() === cleanEmail);

  if (existingIdx >= 0) {
    store.members[existingIdx].status = 'active';
    store.members[existingIdx].gateway = gateway as any;
    store.members[existingIdx].transactionId = orderId;
  } else {
    store.members.unshift({
      id: 'mem-' + Date.now(),
      email: cleanEmail,
      name,
      phone: '+55 (11) 99988-7766',
      gateway: gateway as any,
      transactionId: orderId,
      purchaseDate: new Date().toISOString(),
      status: 'active',
      completedDocumentIds: [],
      personalNotes: {},
      checklistProgress: {},
      role: 'member'
    });
  }

  const log: WebhookLog = {
    id: 'wh-sim-' + Date.now(),
    timestamp: new Date().toISOString(),
    gateway,
    event: gateway === 'Hotmart' ? 'PURCHASE_APPROVED' : 'order_paid',
    buyerEmail: cleanEmail,
    buyerName: name,
    status: 'success',
    rawPayload: simulatedPayload,
    message: `[SIMULAÇÃO] Compra aprovada via ${gateway}. Acesso liberado instantaneamente para ${cleanEmail}.`
  };

  store.webhookLogs.unshift(log);
  persistStore();

  res.json({
    success: true,
    message: `Simulação de compra via ${gateway} concluída com sucesso! O e-mail ${cleanEmail} agora tem acesso total à área de membros.`,
    simulatedPayload
  });
});

// Update settings (support contacts, etc.)
app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { productName, supportEmail, supportWhatsapp } = req.body;
  if (productName) store.settings.productName = productName;
  if (supportEmail) store.settings.supportEmail = supportEmail;
  if (supportWhatsapp) store.settings.supportWhatsapp = supportWhatsapp;
  persistStore();
  res.json({ success: true, settings: store.settings });
});

// VITE OR STATIC SERVING & EXPORT
export default app;

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`MemberHub server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}
