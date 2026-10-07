import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api.ts';
import { Member, ModuleItem, DocumentItem } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { SidebarDrawer } from './components/SidebarDrawer.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { ModuleCardsView } from './components/ModuleCardsView.tsx';
import { ModuleDetailView } from './components/ModuleDetailView.tsx';
import { CleanDocumentViewer } from './components/CleanDocumentViewer.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { CertificateModal } from './components/CertificateModal.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { initialModules, initialMembers } from './data/initialData.ts';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [modules, setModules] = useState<ModuleItem[]>(initialModules);
  const [settings, setSettings] = useState({
    productName: 'MasterKit: Documentos, Contratos & SOPs Executivos',
    supportEmail: 'suporte@memberhub.digital',
    supportWhatsapp: '+55 11 98765-4321',
    webhookSecret: 'whsec_memberhub_live'
  });

  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Logged-in view hierarchy: 'modules' | 'module-detail' | 'document-view' | 'admin'
  const [currentView, setCurrentView] = useState<'modules' | 'module-detail' | 'document-view' | 'admin'>('modules');
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  // Menus & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check direct path routes and restore session on boot
  useEffect(() => {
    async function loadInitial() {
      const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
      const search = typeof window !== 'undefined' ? window.location.search.toLowerCase() : '';
      
      const isDirectAccessRoute = 
        pathname.includes('/membros') || 
        pathname.includes('/area') || 
        pathname.includes('/app') || 
        pathname.includes('/dashboard') || 
        pathname.includes('/curso') ||
        pathname.includes('/alunos') ||
        pathname.includes('/modulos') ||
        search.includes('acesso') ||
        search.includes('membros');

      // If user navigated directly to /membros, /area, /app, /dashboard, /curso, etc.
      if (isDirectAccessRoute) {
        const defaultMember = initialMembers[0];
        setCurrentMember(defaultMember);
        localStorage.setItem('memberhub_buyer_email', defaultMember.email);
        setIsInitializing(false);
        return;
      }

      try {
        const data = await api.getContent();
        if (data.modules && data.modules.length > 0) {
          setModules(data.modules);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load content from server, using initialModules', err);
      }

      // Check saved session in localStorage
      const savedEmail = localStorage.getItem('memberhub_buyer_email');
      if (savedEmail) {
        try {
          const authRes = await api.quickLogin(savedEmail);
          if (authRes.success && authRes.member) {
            setCurrentMember(authRes.member);
          } else {
            setCurrentMember(initialMembers[0]);
          }
        } catch (e) {
          setCurrentMember(initialMembers[0]);
        }
      }

      setIsInitializing(false);
    }
    loadInitial();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoginSuccess = (member: Member) => {
    setCurrentMember(member);
    localStorage.setItem('memberhub_buyer_email', member.email);
    setCurrentView('modules');
    showToast(`Bem-vindo, ${member.name}!`);
  };

  const handleLogout = () => {
    setCurrentMember(null);
    localStorage.removeItem('memberhub_buyer_email');
    setSelectedModule(null);
    setSelectedDocument(null);
    setCurrentView('modules');
    setIsSidebarOpen(false);
    showToast('Você saiu da sua conta.');
  };

  // Simulating purchase directly from login error
  const handleSimulatePurchaseFromLogin = async (emailToSimulate: string) => {
    try {
      const res = await api.simulatePurchase('Kiwify', emailToSimulate, 'Novo Comprador');
      if (res.success) {
        // Auto-login newly simulated buyer
        const loginRes = await api.quickLogin(emailToSimulate);
        if (loginRes.success && loginRes.member) {
          handleLoginSuccess(loginRes.member);
          showToast('Compra simulada com sucesso! Acesso liberado.');
        }
      }
    } catch (err) {
      console.error('Simulation error', err);
    }
  };

  // Toggle complete document
  const handleToggleComplete = async (docId: string) => {
    if (!currentMember) return;

    const currentCompleted = currentMember.completedDocumentIds || [];
    const isNowCompleted = !currentCompleted.includes(docId);

    const updatedList = isNowCompleted
      ? [...currentCompleted, docId]
      : currentCompleted.filter((id) => id !== docId);

    setCurrentMember({
      ...currentMember,
      completedDocumentIds: updatedList
    });

    try {
      await api.toggleComplete(currentMember.email, docId);
      showToast(isNowCompleted ? 'Material marcado como concluído!' : 'Material desmarcado.');
    } catch (err) {
      console.error('Failed to sync completion', err);
    }
  };

  // Navigation handlers
  const handleSelectModule = (mod: ModuleItem) => {
    setSelectedModule(mod);
    setCurrentView('module-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setCurrentView('document-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalDocsCount = useMemo(() => {
    return modules.reduce((acc, m) => acc + m.documents.length, 0);
  }, [modules]);

  const completedDocsCount = currentMember?.completedDocumentIds?.length || 0;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  // SCREEN 1: LOGIN DEDICATED SCREEN (When not logged in)
  if (!currentMember) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSimulatePurchase={handleSimulatePurchaseFromLogin}
      />
    );
  }

  // SCREEN 2: MEMBER AREA (When authenticated)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Hamburger */}
      <Navbar
        currentMember={currentMember}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onNavigateHome={() => {
          setSelectedModule(null);
          setSelectedDocument(null);
          setCurrentView('modules');
        }}
      />

      {/* Hamburger Drawer Panel */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        member={currentMember}
        onNavigateHome={() => {
          setSelectedModule(null);
          setSelectedDocument(null);
          setCurrentView('modules');
        }}
        onOpenCertificate={() => setIsCertOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAdmin={() => {
          setCurrentView('admin');
        }}
        onLogout={handleLogout}
        totalDocs={totalDocsCount}
        completedDocs={completedDocsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {currentView === 'admin' ? (
          <AdminPanel
            modules={modules}
            onModulesUpdate={(updated) => setModules(updated)}
            onClose={() => setCurrentView('modules')}
          />
        ) : currentView === 'document-view' && selectedDocument && selectedModule ? (
          <CleanDocumentViewer
            document={selectedDocument}
            module={selectedModule}
            onBackToModule={() => setCurrentView('module-detail')}
            isCompleted={currentMember.completedDocumentIds?.includes(selectedDocument.id) || false}
            onToggleComplete={handleToggleComplete}
          />
        ) : currentView === 'module-detail' && selectedModule ? (
          <ModuleDetailView
            module={selectedModule}
            currentMember={currentMember}
            onBack={() => {
              setSelectedModule(null);
              setCurrentView('modules');
            }}
            onSelectDocument={handleSelectDocument}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <ModuleCardsView
            modules={modules}
            currentMember={currentMember}
            onSelectModule={handleSelectModule}
          />
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>{settings.productName}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Suporte & Ajuda
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCertOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Meu Certificado
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-slate-900 transition-colors"
            >
              Produtor / Webhooks
            </button>
          </div>
        </div>
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        member={currentMember}
        productName={settings.productName}
        totalDocs={totalDocsCount}
        completedDocs={completedDocsCount}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        supportEmail={settings.supportEmail}
        supportWhatsapp={settings.supportWhatsapp}
      />
    </div>
  );
}
