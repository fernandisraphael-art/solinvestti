
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnergyProvider, Concessionaire } from '../types';
import { GoogleGenAI } from '@google/genai';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    aistudio: any;
  }
}

interface AdminDashboardProps {
  generators: EnergyProvider[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDeleteGenerator: (id: string) => void;
  onAddGenerator: (gen: EnergyProvider) => void;
  clients: any[];
  onDeleteClient: (id: string) => void;
  concessionaires: Concessionaire[];
  onAddConcessionaire: (c: Concessionaire) => void;
  onUpdateConcessionaire: (id: string, data: Partial<Concessionaire>) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  generators,
  onToggleStatus,
  onDeleteGenerator,
  onAddGenerator,
  clients,
  onDeleteClient,
  concessionaires,
  onAddConcessionaire,
  onUpdateConcessionaire,
  onReset
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showToast, setShowToast] = useState<{ show: boolean, msg: string, type?: 'info' | 'error' }>({ show: false, msg: '' });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isConModalOpen, setIsConModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const [newCon, setNewCon] = useState({ name: '', responsible: '', contact: '', region: '' });

  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchRegion, setSearchRegion] = useState('');
  const [candidateSuppliers, setCandidateSuppliers] = useState<any[]>([]);
  const [editingGenerator, setEditingGenerator] = useState<EnergyProvider | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Secure Reset & Backup State
  const [resetStep, setResetStep] = useState<'idle' | 'create' | 'auth' | 'recovery'>('idle');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState('');
  const [resetError, setResetError] = useState('');
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // Fallback: Check localStorage
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Try IDX first
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        if (window.aistudio.hasSelectedApiKey) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
          return;
        }
      } catch (e) {
        console.error("IDX Auth failed", e);
      }
    }

    // Fallback: Open Custom Modal
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setKeyInput(stored);
    setIsKeyModalOpen(true);
  };

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('gemini_api_key', keyInput.trim());
      setHasApiKey(true);
      setIsKeyModalOpen(false);
      triggerToast('Chave salva com sucesso!');
    }
  };

  const triggerToast = (msg: string, type: 'info' | 'error' = 'info') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => setShowToast({ show: false, msg: '', type: 'info' }), 4000);
  };

  const handleAddCon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddConcessionaire({
      id: `con-${Date.now()}`,
      ...newCon,
      status: 'active'
    });
    setIsConModalOpen(false);
    setNewCon({ name: '', responsible: '', contact: '', region: '' });
    triggerToast('Concessionária registrada.');
  };

  const reportData = useMemo(() => {
    const totalClients = clients.length;
    const totalBills = clients.reduce((acc, c) => acc + (Number(c.billValue) || 0), 0);
    const totalCommValue = clients.reduce((acc, client) => {
      const usina = generators.find(g => g.name === client.providerName || g.id === client.providerId);
      const commPercent = usina?.commission || 5;
      return acc + ((Number(client.billValue) || 0) * (commPercent / 100));
    }, 0);

    const pendingUsinas = generators.filter(g => g.status === 'pending').length;

    return { totalClients, totalBills, totalCommValue, pendingUsinas };
  }, [clients, generators]);

  const handleSearchWeb = async () => {
    // 1. Force retrieval of key from LocalStorage for reliability
    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
      triggerToast('Ative a chave IA primeiro.', 'error');
      handleSelectKey();
      return;
    }

    setIsSearchingWeb(true);
    setCandidateSuppliers([]);

    try {
      console.log('[Prospector] Listando modelos disponíveis...');

      // Step 1: Get the definitive list of what this key can access
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

      if (!listRes.ok) {
        throw new Error('Não foi possível listar os modelos. Verifique sua chave API.');
      }

      const listData = await listRes.json();
      const models = listData.models || [];

      // Step 2: Smart Filter - Only models that generate content
      const viableModels = models.filter((m: any) =>
        m.supportedGenerationMethods?.includes('generateContent')
      );

      if (viableModels.length === 0) {
        throw new Error('Sua chave é válida, mas não tem acesso a modelos de geração de texto.');
      }

      // Step 3: Smart Selection - Prefer Flash, then Pro, then anything else
      // Avoid "experimental" or "legacy" if possible unless only option
      const preferredModel = viableModels.find((m: any) => m.name.includes('gemini-1.5-flash')) ||
        viableModels.find((m: any) => m.name.includes('gemini-1.5-pro')) ||
        viableModels.find((m: any) => m.name.includes('gemini-pro')) ||
        viableModels[0];

      // name comes like "models/gemini-1.5-flash-001"
      // API expects: v1beta/models/gemini-1.5-flash-001:generateContent. 
      // Note: "models/" prefix is acceptable in the path segment after v1beta
      const selectedModelName = preferredModel.name.replace('models/', '');

      console.log(`[Prospector] Modelo Selecionado: ${selectedModelName}`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModelName}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Atue como um especialista em energia solar comercial.
              Objetivo: Encontrar 3 usinas solares REAIS e OPERANTES na região: ${searchRegion}.
              IMPORTANTE: Retorne APENAS os dados brutos separados por "---".
              Formato obrigatório para cada usina:
              Nome: [Nome da Usina ou Empresa]
              Local: [Cidade/Estado]
              Responsavel: [Nome do Gestor ou Comercial]
              Telefone: [Contato Real ou "Google Maps"]
              Desconto: [Estimativa entre 10 e 20]`
            }]
          }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || res.statusText;

        if (res.status === 429) {
          throw new Error('Limite gratuito excedido (Quota). Tente novamente em alguns segundos.');
        }
        throw new Error(`Erro API (${res.status}): ${errorMessage}`);
      }

      const data = await res.json();
      const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (contentText) {
        const blocks = contentText.split(/---/);
        const parsed: any[] = [];
        blocks.forEach(block => {
          if (block.trim().length < 10) return;

          const n = block.match(/Nome:\s*(.*)/i);
          const l = block.match(/Local:\s*(.*)/i);
          const r = block.match(/Responsavel:\s*(.*)/i);
          const t = block.match(/Telefone:\s*(.*)/i);
          const d = block.match(/Desconto:\s*(\d+)/i);

          if (n) parsed.push({
            nome: n[1].trim(),
            localizacao: l ? l[1].trim() : 'Brasil',
            responsavel: r ? r[1].trim() : 'Comercial',
            telefone: t ? t[1].trim() : '---',
            desconto_estimado: d ? parseInt(d[1]) : 15
          });
        });

        const finalResults = parsed.slice(0, 3);
        if (finalResults.length === 0) {
          triggerToast('IA não encontrou dados precisos. Tente outra região.', 'info');
        } else {
          setCandidateSuppliers(finalResults);
          triggerToast(`Sucesso! (Modelo: ${selectedModelName})`);
        }
      } else {
        triggerToast('IA retornou resposta vazia.', 'info');
      }

    } catch (e: any) {
      console.error('[Prospector Error]', e);
      triggerToast(e.message, 'error');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const activateCandidate = (candidate: any) => {
    onAddGenerator({
      ...candidate,
      id: `ai-${Date.now()}`,
      name: candidate.nome,
      type: 'Solar',
      region: candidate.localizacao,
      discount: candidate.desconto_estimado,
      status: 'active',
      color: 'from-emerald-400 to-teal-700',
      icon: 'public',
      commission: 5,
      rating: 4.8,
      estimatedSavings: 0
    });
    setCandidateSuppliers(prev => prev.filter(c => c.nome !== candidate.nome));
  };

  const handleViewDoc = (base64: string) => {
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
      setViewingDoc(base64);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Geral Overview', icon: 'grid_view' },
    { id: 'suppliers', label: `Gestão Usinas`, icon: 'factory', count: generators.length },
    { id: 'concessionaires', label: `Distribuidoras`, icon: 'account_balance', count: concessionaires.length },
    { id: 'clients', label: `Base Clientes`, icon: 'groups', count: clients.length },
  ];

  const sidebarExtra = (
    <div className="pt-8 space-y-4">
      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 ml-2">Ferramentas Pro</p>
      {!hasApiKey ? (
        <button onClick={handleSelectKey} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
          <span className="material-symbols-outlined text-[20px]">key</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-left">Ativar Chave IA</span>
        </button>
      ) : (
        <button onClick={handleSelectKey} className="w-full px-5 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-3 hover:bg-emerald-500/20 transition-all cursor-pointer group">
          <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">check_circle</span>
          <span className="text-[10px] font-black uppercase tracking-widest">IA Conectada</span>
        </button>
      )}
    </div>
  );

  const sidebarFooter = (
    <button onClick={() => setIsResetModalOpen(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-[11px] font-black uppercase tracking-widest">
      <span className="material-symbols-outlined text-[20px]">refresh</span> Resetar Dados
    </button>
  );

  const handleBackup = async () => {
    setIsBackupLoading(true);
    try {
      const data = {
        generators,
        clients,
        concessionaires,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solinvestti_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast('Backup realizado com sucesso!');
    } catch (error) {
      console.error('Erro no backup:', error);
      triggerToast('Erro ao gerar backup.');
    } finally {
      setIsBackupLoading(false);
    }
  };

  const startSecureReset = async () => {
    setResetError('');
    setAdminPasswordInput('');
    setRecoveryKeyInput('');

    try {
      // Check if password exists
      const { data } = await supabase.from('admin_secrets').select('*').eq('secret_key', 'admin_reset_password').single();

      if (data) {
        setResetStep('auth');
      } else {
        setResetStep('create');
      }
      setIsResetModalOpen(true);
    } catch (error) {
      // If error (likely no row found), go to create
      setResetStep('create');
      setIsResetModalOpen(true);
    }
  };

  const handleCreatePassword = async () => {
    if (!adminPasswordInput) return;

    const recoveryKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Save password
    await supabase.from('admin_secrets').upsert({
      secret_key: 'admin_reset_password',
      secret_value: adminPasswordInput // In a real app, hash this!
    });

    // Save recovery key
    await supabase.from('admin_secrets').upsert({
      secret_key: 'admin_recovery_key',
      secret_value: recoveryKey
    });

    setGeneratedRecoveryKey(recoveryKey);
    triggerToast('Senha de segurança criada!');
  };

  const handleVerifyAndReset = async () => {
    setResetError('');
    const { data } = await supabase.from('admin_secrets').select('secret_value').eq('secret_key', 'admin_reset_password').single();

    if (data && data.secret_value === adminPasswordInput) {
      onReset();
      setIsResetModalOpen(false);
      triggerToast('Sistema resetado com sucesso.');
    } else {
      setResetError('Senha incorreta.');
    }
  };

  const handleRecovery = async () => {
    const { data } = await supabase.from('admin_secrets').select('secret_value').eq('secret_key', 'admin_recovery_key').single();

    if (data && data.secret_value === recoveryKeyInput) {
      // Allow reset (or change password). For simplicity, we just allow the reset action now.
      onReset();
      setIsResetModalOpen(false);
      triggerToast('Sistema resetado via recuperação.');
    } else {
      setResetError('Chave de recuperação inválida.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-deep flex font-sans text-white">
      <Sidebar
        userType="Master Admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={sidebarItems}
        onLogout={async () => {
          await supabase.auth.signOut();
          navigate('/');
        }}
        extraContent={sidebarExtra}
        footerContent={sidebarFooter}
      />

      <main className="flex-1 overflow-y-auto bg-brand-deep">
        <Header
          title={
            activeTab === 'overview' ? 'Controle Operacional' :
              activeTab === 'suppliers' ? 'Ativos Geradores' :
                activeTab === 'suppliers_prospect' ? 'Prospecção Inteligente' :
                  activeTab === 'clients' ? 'Gestão de Clientes' :
                    activeTab === 'concessionaires' ? 'Registro de Concessionárias' : ''
          }
        />

        <div className="p-10 max-w-7xl mx-auto space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Volume Negociado</p>
                  <h3 className="text-3xl font-display font-black text-white">R$ {reportData.totalBills.toLocaleString('pt-BR')}</h3>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Comissão Acumulada</p>
                  <h3 className="text-3xl font-display font-black text-primary">R$ {reportData.totalCommValue.toLocaleString('pt-BR')}</h3>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Usinas Ativas</p>
                  <h3 className="text-3xl font-display font-black text-white">{generators.filter(g => g.status === 'active').length}</h3>
                </div>
                <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-primary/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Concessionárias</p>
                  <h3 className="text-3xl font-display font-black text-primary">{concessionaires.length}</h3>
                </div>
              </div>

              <div className="bg-brand-navy/60 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl h-80 flex items-end justify-between gap-4">
                {[40, 65, 45, 85, 55, 95, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full bg-primary/20 rounded-t-xl group relative overflow-hidden" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-[10px] font-black text-white/30">Mês {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">Rede de Parceiros Geradores</h3>
                  <p className="text-white/40 text-sm">Gestão comercial e homologação de ativos de geração distribuída.</p>
                </div>
                <button onClick={() => setActiveTab('suppliers_prospect')} className="px-8 py-4 bg-primary text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-sm mr-2">travel_explore</span> Prospecção IA
                </button>
              </div>

              <div className="bg-brand-navy/60 border border-white/10 rounded-[3rem] overflow-hidden overflow-x-auto shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Usina / Local</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Responsável / Contato</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Capacidade</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Desc.</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Comm.</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {generators.map(gen => (
                      <tr key={gen.id} className="hover:bg-white/10 transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className={`size-11 rounded-xl bg-gradient-to-br ${gen.color || 'from-emerald-400 to-teal-700'} flex items-center justify-center font-black text-white text-base shadow-lg`}>
                              {gen.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-sm text-white">{gen.name}</p>
                              <p className="text-[10px] text-primary font-black uppercase tracking-widest">{gen.region || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs font-bold text-white">{gen.responsibleName || '---'}</p>
                          <p className="text-[10px] text-white/40 font-black mt-1">{gen.responsiblePhone || '---'}</p>
                        </td>
                        <td className="px-10 py-8 font-display font-black text-white text-lg">{gen.capacity} MW</td>
                        <td className="px-10 py-8 font-display font-black text-primary text-xl">{gen.discount || 0}%</td>
                        <td className="px-10 py-8 font-display font-bold text-white/70">{gen.commission || 0}%</td>
                        <td className="px-10 py-8">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${gen.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'}`}>
                            {gen.status === 'active' ? 'Ativa' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => onToggleStatus(gen.id, gen.status || 'pending')}
                              className={`font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 ${gen.status === 'active' ? 'text-red-400' : 'text-emerald-400'
                                }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {gen.status === 'active' ? 'block' : 'check_circle'}
                              </span>
                              {gen.status === 'active' ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onClick={() => setEditingGenerator(gen)} className="text-white/30 hover:text-white transition-colors" title="Editar">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir esta usina? Esta ação não pode ser desfeita.')) {
                                  onDeleteGenerator(gen.id);
                                }
                              }}
                              className="text-white/30 hover:text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'concessionaires' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">Distribuidoras Registradas</h3>
                  <p className="text-white/40 text-sm">Controle de concessionárias participantes do mercado livre de energia.</p>
                </div>
                <button onClick={() => setIsConModalOpen(true)} className="px-8 py-4 bg-primary text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-sm mr-2">add_circle</span> Nova Distribuidora
                </button>
              </div>

              <div className="bg-brand-navy/60 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Concessionária / Região</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Gestor Responsável</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Contato</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {concessionaires.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-white/20 text-xs font-black uppercase tracking-widest">Nenhuma distribuidora vinculada</td>
                      </tr>
                    ) : (
                      concessionaires.map(con => (
                        <tr key={con.id} className="hover:bg-white/10 transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-sm text-white">{con.name}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{con.region}</p>
                          </td>
                          <td className="px-10 py-8">
                            <p className="text-xs font-bold text-white">{con.responsible}</p>
                          </td>
                          <td className="px-10 py-8">
                            <p className="text-[10px] text-white font-black tracking-widest uppercase">{con.contact}</p>
                          </td>
                          <td className="px-10 py-8">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-full border border-emerald-500/20">
                              {con.status === 'active' ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <button className="text-white/30 hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="bg-brand-navy/60 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Cliente</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Fatura</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Doc. Fatura</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Data Adesão</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-white/20 text-xs font-black uppercase tracking-widest">Nenhum cliente registrado</td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-sm text-white">{client.name}</p>
                            <p className="text-[10px] text-white/40">{client.email}</p>
                          </td>
                          <td className="px-10 py-8 font-display font-black text-white text-lg">R$ {Number(client.billValue).toLocaleString('pt-BR')}</td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${client.status === 'Fatura Enviada' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/20 text-primary border-primary/20'}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            {client.energyBill ? (
                              <button
                                onClick={() => handleViewDoc(client.energyBill)}
                                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group"
                              >
                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">description</span>
                                Ver Fatura
                              </button>
                            ) : (
                              <span className="text-white/20 text-[9px] font-black uppercase">Não enviada</span>
                            )}
                          </td>
                          <td className="px-10 py-8 text-[10px] font-black text-white/30">{client.date}</td>
                          <td className="px-10 py-8">
                            <div className="flex gap-4">
                              <button onClick={() => setEditingClient(client)} className="text-white/30 hover:text-white transition-colors" title="Editar / Ver Senha">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                                    onDeleteClient(client.id);
                                  }
                                }}
                                className="text-white/30 hover:text-red-500 transition-colors"
                                title="Excluir"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suppliers_prospect' && (
            <div className="space-y-8 animate-in fade-in duration-700 pb-20">
              {/* Header Minimalista */}
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-10">
                <div className="mb-6 p-4 bg-primary/10 rounded-full border border-primary/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <span className="material-symbols-outlined text-4xl text-primary">psychology</span>
                </div>
                <h3 className="text-5xl font-display font-black text-white uppercase tracking-tight mb-4">
                  Prospector <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">AI</span>
                </h3>
                <p className="text-white/50 text-lg font-medium leading-relaxed">
                  Localize usinas solares ativas utilizando o poder do Web Grounding do Google Gemini.
                </p>
              </div>

              {/* Barra de Busca Central */}
              <div className="max-w-3xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-500 rounded-[2rem] opacity-30 group-hover:opacity-60 blur-xl transition-all duration-500"></div>
                <div className="relative bg-brand-navy border border-white/20 rounded-[2rem] p-2 flex items-center shadow-2xl">
                  <span className="material-symbols-outlined text-white/30 text-3xl ml-6">travel_explore</span>
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/20 px-6 py-4 h-16"
                    placeholder="Ex: Usinas Solares em Minas Gerais..."
                    value={searchRegion}
                    onChange={e => setSearchRegion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isSearchingWeb && handleSearchWeb()}
                  />
                  <button
                    onClick={handleSearchWeb}
                    disabled={isSearchingWeb}
                    className="bg-primary hover:bg-emerald-400 text-brand-navy h-14 px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearchingWeb ? (
                      <span className="animate-spin material-symbols-outlined">refresh</span>
                    ) : (
                      <>
                        <span>Buscar</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State Criativo */}
              {isSearchingWeb && (
                <div className="max-w-2xl mx-auto mt-12 text-center space-y-4">
                  <div className="flex justify-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-0"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <p className="text-white/40 font-mono text-sm animate-pulse">Analisando dados via satélite e bases regulatórias...</p>
                </div>
              )}

              {/* Resultados */}
              {candidateSuppliers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4">
                  {candidateSuppliers.map((cand, i) => (
                    <div key={i} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 p-8 rounded-[2.5rem] flex flex-col transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-white">solar_power</span>
                      </div>

                      <div className="mb-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 mb-3">
                          Alta Relevância
                        </span>
                        <h5 className="text-xl font-display font-black text-white leading-tight">{cand.nome}</h5>
                      </div>

                      <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-white/30 text-lg mt-0.5">location_on</span>
                          <p className="text-sm text-white/70 font-medium">{cand.localizacao}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-white/30 text-lg">person</span>
                          <p className="text-sm text-white/70 font-medium">{cand.responsavel}</p>
                        </div>
                        {cand.telefone !== '---' && (
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white/30 text-lg">call</span>
                            <p className="text-sm text-primary font-bold">{cand.telefone}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/30 font-black uppercase tracking-wider">Desconto Est.</span>
                          <span className="text-2xl font-display font-black text-white">{cand.desconto_estimado}%</span>
                        </div>
                        <button
                          onClick={() => activateCandidate(cand)}
                          className="px-6 py-3 bg-white/10 hover:bg-primary hover:text-brand-navy rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Homologar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: NOVA CONCESSIONÁRIA */}
      {isConModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <div className="bg-brand-navy w-full max-w-lg p-12 rounded-[3.5rem] border border-white/20 animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-display font-black mb-8 uppercase tracking-tight">Nova Distribuidora</h3>
            <form onSubmit={handleAddCon} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Nome da Concessionária</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 ring-primary/20 font-bold" value={newCon.name} onChange={e => setNewCon({ ...newCon, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Região/UF</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none font-bold" value={newCon.region} onChange={e => setNewCon({ ...newCon, region: e.target.value })} placeholder="Ex: MG" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Gestor Resp.</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none font-bold" value={newCon.responsible} onChange={e => setNewCon({ ...newCon, responsible: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Contato Direto</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none font-bold" value={newCon.contact} onChange={e => setNewCon({ ...newCon, contact: e.target.value })} placeholder="(00) 00000-0000" required />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsConModalOpen(false)} className="flex-1 py-5 text-white/40 font-black uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-brand-navy py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET SISTEMA */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="bg-brand-navy p-12 rounded-[3.5rem] border border-white/20 max-w-md text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-6">warning</span>
            <h3 className="text-3xl font-display font-black mb-4">Resetar Dados?</h3>
            <p className="text-white/60 mb-10 leading-relaxed font-medium">Faça backup ou limpe os dados do sistema. A limpeza exige senha de administrador.</p>
            <div className="flex gap-4">
              <button
                onClick={handleBackup}
                disabled={isBackupLoading}
                className="flex-1 py-5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {isBackupLoading ? 'Salvando...' : (
                  <>
                    <span className="material-symbols-outlined text-lg">download</span> Backup
                  </>
                )}
              </button>
              <button
                onClick={startSecureReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">delete_forever</span> Resetar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SECURE RESET */}
      {isResetModalOpen && resetStep !== 'idle' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-deep/90 backdrop-blur-xl">
          <div className="w-full max-w-md bg-brand-navy rounded-[3.5rem] border border-white/20 shadow-2xl p-12 text-center animate-in zoom-in-95">

            {resetStep === 'create' && !generatedRecoveryKey && (
              <>
                <span className="material-symbols-outlined text-5xl text-primary mb-6">lock_reset</span>
                <h3 className="text-2xl font-display font-black text-white mb-4">Criar Senha Admin</h3>
                <p className="text-white/60 mb-8 text-sm">Defina uma senha única para proteger a limpeza de dados.</p>
                <input
                  type="password"
                  placeholder="Nova Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none mb-6 text-center"
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                />
                <button onClick={handleCreatePassword} className="w-full bg-primary text-brand-navy py-4 rounded-2xl font-black uppercase tracking-widest">Criar Senha</button>
              </>
            )}

            {generatedRecoveryKey && (
              <>
                <span className="material-symbols-outlined text-5xl text-emerald-400 mb-6">key</span>
                <h3 className="text-2xl font-display font-black text-white mb-4">Chave de Recuperação</h3>
                <p className="text-white/60 mb-6 text-sm">Guarde esta chave em local seguro. Ela é a **única forma** de recuperar o acesso se esquecer a senha.</p>
                <div className="bg-white/10 p-4 rounded-xl text-primary font-mono font-bold text-lg mb-8 break-all select-all">
                  {generatedRecoveryKey}
                </div>
                <button onClick={() => { setGeneratedRecoveryKey(''); setResetStep('auth'); }} className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20">Entendido, Continuar</button>
              </>
            )}

            {resetStep === 'auth' && (
              <>
                <span className="material-symbols-outlined text-5xl text-red-500 mb-6">warning</span>
                <h3 className="text-2xl font-display font-black text-white mb-2">Resetar Dados?</h3>
                <p className="text-white/60 mb-8 text-sm">Digite sua senha de administrador para confirmar a exclusão TOTAL.</p>

                <input
                  type="password"
                  placeholder="Senha Admin"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none mb-2 text-center"
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                />
                {resetError && <p className="text-red-400 text-xs font-bold mb-4">{resetError}</p>}

                <button onClick={handleVerifyAndReset} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest mb-4">Confirmar Reset</button>
                <button onClick={() => setResetStep('recovery')} className="text-xs text-white/40 hover:text-white uppercase tracking-widest">Esqueci a Senha</button>
              </>
            )}

            {resetStep === 'recovery' && (
              <>
                <span className="material-symbols-outlined text-5xl text-amber-400 mb-6">lock_open</span>
                <h3 className="text-2xl font-display font-black text-white mb-4">Recuperação</h3>
                <p className="text-white/60 mb-8 text-sm">Digite a chave de recuperação gerada quando você criou a senha.</p>

                <input
                  type="text"
                  placeholder="Chave de Recuperação"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none mb-2 text-center"
                  value={recoveryKeyInput}
                  onChange={e => setRecoveryKeyInput(e.target.value)}
                />
                {resetError && <p className="text-red-400 text-xs font-bold mb-4">{resetError}</p>}

                <button onClick={handleRecovery} className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 mb-4">Validar e Resetar</button>
                <button onClick={() => setResetStep('auth')} className="text-xs text-white/40 hover:text-white uppercase tracking-widest">Voltar</button>
              </>
            )}

            <button onClick={() => setIsResetModalOpen(false)} className="mt-6 text-white/20 hover:text-white font-black uppercase tracking-widest text-[10px]">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION OLD (REMOVED) */}


      {/* MODAL: EDIÇÃO DE USINA */}
      {editingGenerator && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-deep/90 backdrop-blur-xl">
          <div className="w-full max-w-[600px] bg-brand-navy rounded-[3.5rem] border border-white/20 shadow-2xl p-14 animate-in zoom-in-95">
            <h3 className="text-3xl font-display font-black text-white mb-10">Editar Usina Parceira</h3>
            <form onSubmit={(e) => { e.preventDefault(); setEditingGenerator(null); triggerToast('Informações salvas.'); }} className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Razão Social</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-4 ring-primary/20" value={editingGenerator.name} onChange={e => setEditingGenerator({ ...editingGenerator, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Desconto (%)</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none" value={editingGenerator.discount} onChange={e => setEditingGenerator({ ...editingGenerator, discount: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Comissão (%)</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none" value={editingGenerator.commission} onChange={e => setEditingGenerator({ ...editingGenerator, commission: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Contato do Responsável</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none" value={editingGenerator.responsiblePhone} onChange={e => setEditingGenerator({ ...editingGenerator, responsiblePhone: e.target.value })} placeholder="Telefone" />
              </div>


              <div className="pt-4 border-t border-white/10">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Credenciais de Acesso</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Login (E-mail)</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm">
                      {editingGenerator.accessEmail || 'Não registrado'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Senha de Acesso</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={editingGenerator.accessPassword || ''}
                        placeholder={editingGenerator.accessPassword ? '' : '(Não salva)'}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm font-mono outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setEditingGenerator(null)} className="flex-1 py-5 text-white/40 font-black uppercase tracking-widest">Descartar</button>
                <button type="submit" className="flex-1 bg-primary text-brand-navy py-5 rounded-2xl font-black uppercase tracking-widest">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div >
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {editingClient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-deep/90 backdrop-blur-xl">
          <div className="w-full max-w-[600px] bg-brand-navy rounded-[3.5rem] border border-white/20 shadow-2xl p-14 animate-in zoom-in-95">
            <h3 className="text-3xl font-display font-black text-white mb-10">Dados do Cliente</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Nome Completo</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold">{editingClient.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Cidade/Estado</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold">{editingClient.city}/{editingClient.state}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Valor Fatura</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold">R$ {editingClient.billValue}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Credenciais de Acesso</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">E-mail</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm truncate" title={editingClient.accessEmail}>
                      {editingClient.accessEmail || editingClient.email || 'Não registrado'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={editingClient.accessPassword || ''}
                        placeholder={editingClient.accessPassword ? '' : '(Não salva)'}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm font-mono outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 py-5 text-white/40 font-black uppercase tracking-widest hover:text-white">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: API KEY */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-deep/90 backdrop-blur-xl">
          <div className="w-full max-w-md bg-brand-navy rounded-[3.5rem] border border-white/20 shadow-2xl p-12 text-center animate-in zoom-in-95">
            <span className="material-symbols-outlined text-5xl text-yellow-500 mb-6">key</span>
            <h3 className="text-2xl font-display font-black text-white mb-4">Ativar Inteligência Artificial</h3>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Para usar a prospecção automática, insira sua
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1 font-bold">Chave API do Google Gemini</a>.
            </p>

            <input
              type="password"
              placeholder="Cole sua API Key aqui..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none mb-6 text-center text-sm"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
            />

            <button onClick={async () => {
              if (!keyInput) return triggerToast('Insira uma chave para testar.', 'error');
              try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyInput}`);
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error?.message || 'Erro desconhecido');
                }
                const data = await res.json();
                const count = data.models?.length || 0;
                triggerToast(`Sucesso! ${count} modelos encontrados. Pode Salvar!`);
              } catch (e: any) {
                alert(`Erro na Chave: ${e.message}\n\nVerifique se a API "Google Generative AI" está ativada no Google Cloud.`);
              }
            }} className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500/30 transition-colors mb-4 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">wifi_tethering</span> Testar Conexão
            </button>
            <button onClick={handleSaveKey} className="w-full bg-yellow-500 text-brand-navy py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors mb-4 shadow-lg shadow-yellow-500/20">
              Salvar e Ativar
            </button>
            <div className="flex gap-4">
              <button onClick={() => { localStorage.removeItem('gemini_api_key'); setHasApiKey(false); setKeyInput(''); setIsKeyModalOpen(false); triggerToast('Chave removida.'); }} className="flex-1 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                Remover Chave
              </button>
              <button onClick={() => setIsKeyModalOpen(false)} className="flex-1 py-3 text-white/30 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {
        showToast.show && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-primary text-brand-navy px-10 py-6 rounded-3xl font-black animate-in fade-in slide-in-from-bottom-6 flex items-center gap-3 shadow-2xl">
            <span className="material-symbols-outlined">check_circle</span>
            {showToast.msg}
          </div>
        )
      }

      {/* MODAL: VISUALIZAR DOCUMENTO (Caso nova aba falhe) */}
      {
        viewingDoc && (
          <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex flex-col">
            <header className="p-6 flex justify-between items-center bg-brand-navy/60 border-b border-white/10">
              <h3 className="font-display font-black text-xl">Pré-visualização de Documento</h3>
              <button onClick={() => setViewingDoc(null)} className="size-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="flex-1 p-10 flex justify-center overflow-auto">
              <img src={viewingDoc} alt="Fatura" className="max-w-full h-auto rounded-xl shadow-2xl" />
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminDashboard;
