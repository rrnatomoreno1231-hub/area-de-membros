export type DocumentType = 'guide' | 'contract' | 'sop' | 'spreadsheet' | 'template' | 'checklist';

export interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface ResourceLink {
  title: string;
  url: string;
  type: string;
}

export interface DocumentItem {
  id: string;
  moduleId: string;
  title: string;
  type: DocumentType;
  description: string;
  format: string; // e.g. "PDF Executivo", "Planilha XLSX", "Minuta Jurídica"
  readTime: string; // e.g. "8 min de leitura"
  fileSize: string; // e.g. "2.4 MB"
  downloadFileName: string;
  fileUrl?: string;
  keyTakeaways: string[];
  contentMarkdown: string;
  checklistItems: ChecklistItem[];
  resources: ResourceLink[];
  order: number;
}

export interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  order: number;
  badge?: string;
  documents: DocumentItem[];
}

export interface Member {
  id: string;
  email: string;
  name: string;
  phone?: string;
  gateway: 'Kiwify' | 'Hotmart' | 'Eduzz' | 'Stripe' | 'Manual' | 'Outro';
  transactionId: string;
  purchaseDate: string;
  status: 'active' | 'refunded' | 'cancelled' | 'blocked';
  completedDocumentIds: string[];
  personalNotes: Record<string, string>; // docId -> noteText
  checklistProgress?: Record<string, string[]>; // docId -> checked item ids
  lastLogin?: string;
  role: 'member' | 'admin';
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  gateway: string;
  event: string;
  buyerEmail: string;
  buyerName: string;
  status: 'success' | 'ignored' | 'error';
  rawPayload: any;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  member?: Member;
  code?: string; // sent in development/test mode for immediate login
  requiresCode?: boolean;
}
