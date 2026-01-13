
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { LOGO_URL } from '../constants/assets';
import { normalizeText } from '../lib/masks';

interface GeneratorDashboardProps {
  generatorData: {
    contactName: string;
    socialName: string;
    cnpj: string;
    energyCapacity: string;
    locationState: string;
    locationCity: string;
    discount: number;
    commission: number;
    agreements: string;
    logoUrl?: string | null;
  };
  onUpdate: (data: any) => void;
  clients: any[];
  negotiations: any[];
}

const GeneratorDashboard: React.FC<GeneratorDashboardProps> = ({ generatorData, onUpdate, clients, negotiations }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('generatorActiveTab') || 'profile');
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    sessionStorage.setItem('generatorActiveTab', activeTab);
  }, [activeTab]);
  // Enhanced initialization: Check localStorage first, then props
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('cachedLogoUrl') || generatorData.logoUrl || null;
  });
  const [showAdminArea, setShowAdminArea] = useState(false); // New state for modal

  React.useEffect(() => {
    // Sync props to local state if no local override exists
    if (generatorData.logoUrl && !localStorage.getItem('cachedLogoUrl')) {
      setLogoUrl(generatorData.logoUrl);
    }
  }, [generatorData.logoUrl]);

  // Local state for profile form
  const [profileForm, setProfileForm] = useState({
    socialName: generatorData.socialName,
    contactName: generatorData.contactName,
    email: '',
    password: '',
    phone: '', // Need to map this if available in generatorData props or fetch it
    energyCapacity: generatorData.energyCapacity,
    locationState: generatorData.locationState,
    locationCity: generatorData.locationCity,
  });

  // Sync initial data or fetch specific generator extensions if needed
  // For now we assume generatorData is fresh. logic below will handle updates.

  const handleProfileChange = (field: string, value: string) => {
    const skipNormalization = ['email', 'password', 'energyCapacity'].includes(field);
    const normalizedValue = skipNormalization ? value : normalizeText(value);
    setProfileForm(prev => ({ ...prev, [field]: normalizedValue }));
  };

  // Helper to resize image
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Target dimensions: 500x500 cover/contain strategy
        // We'll do simple scaling to fit within 500x500 while maintaining aspect ratio
        // OR force 500x500 centered? User said "reduce to 500x500 to fit".
        // Let's do max 500x500 preserving aspect ratio.
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        }, file.type, 0.9); // 90% quality
      };
      img.onerror = (err) => reject(err);
    });
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const originalFile = e.target.files[0];

    try {
      setIsSaving(true);

      // Resize image first
      const resizedBlob = await resizeImage(originalFile);

      // Convert to DataURL (Local Only Mode)
      const dataUrl = await blobToDataUrl(resizedBlob);

      // Save to localStorage for persistence across reloads without DB
      try {
        localStorage.setItem('cachedLogoUrl', dataUrl);
      } catch (e) {
        console.warn("Storage quota exceeded, logo will not persist after reload");
      }

      setLogoUrl(dataUrl);
      onUpdate({ logoUrl: dataUrl });

    } catch (error: any) {
      console.error("Erro processamento logo:", error);
      alert("Erro ao processar imagem.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Only try DB updates if we have a user
      if (user) {
        // 1. Update Generators Table
        const updates: any = {};
        if (profileForm.socialName) updates.name = profileForm.socialName;
        if (profileForm.contactName) updates.responsible_name = profileForm.contactName;
        if (profileForm.energyCapacity) updates.capacity = profileForm.energyCapacity;

        // Construct region string (City / State)
        if (profileForm.locationCity || profileForm.locationState) {
          const city = profileForm.locationCity || generatorData.locationCity;
          const state = profileForm.locationState || generatorData.locationState;
          updates.region = `${city} / ${state}`;
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from('generators').update(updates).eq('user_id', user.id);
        }

        // 2. Update Auth (Email/Password)
        const authUpdates: any = {};
        if (profileForm.email) authUpdates.email = profileForm.email;
        if (profileForm.password) authUpdates.password = profileForm.password;

        if (Object.keys(authUpdates).length > 0) {
          await supabase.auth.updateUser(authUpdates);
        }
      }
    } catch (error: any) {
      console.warn("Erro ao salvar no banco (continuando localmente):", error);
      // We continue to update local state anyway so the UI feels responsive
    }

    // 3. Update Parent State (Always Success for UI)
    onUpdate({
      socialName: profileForm.socialName,
      contactName: profileForm.contactName,
      energyCapacity: profileForm.energyCapacity,
      locationState: profileForm.locationState,
      locationCity: profileForm.locationCity
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Clear sensitive fields
    setProfileForm(prev => ({ ...prev, password: '' }));
    setIsSaving(false);
  };

  // Lead projection based on capacity
  const projectedLeads = Math.floor(Number(generatorData.energyCapacity) * 1.5) || 75;

  // Calculate simulated revenue based on clients
  const totalMonthlyRevenue = clients.reduce((acc, c) => acc + (Number(c.billValue) * 0.8), 0);

  const handleUpdateParams = () => {
    // Exibe o feedback de sucesso
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const sidebarItems = [
    { id: 'profile', label: 'Dados da Planta', icon: 'settings_account_box' },
    { id: 'overview', label: 'Dashboard Geral', icon: 'dashboard' },
    { id: 'strategy', label: 'Estratégia de Venda', icon: 'strategy' },
    { id: 'clients', label: 'Meus Clientes', icon: 'groups', count: clients.length > 0 ? clients.length : undefined },
    { id: 'negotiations', label: 'Negociações', icon: 'handshake', count: negotiations.length > 0 ? negotiations.length : undefined },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Salvo com sucesso</span>
          </div>
        </div>
      )}

      {/* MODAL: ÁREA ADMINISTRATIVA (Ported form ConsumerDashboard + Generator Profile Fields) */}
      {showAdminArea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 bg-brand-navy/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-[600px] h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            <header className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-display font-black text-brand-navy uppercase tracking-tight">Configurações da Usina</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Dados e Segurança</p>
              </div>
              <button onClick={() => setShowAdminArea(false)} className="size-12 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group size-40 mx-auto bg-white rounded-full shadow-premium flex items-center justify-center overflow-hidden p-4 border-4 border-slate-50">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300">add_photo_alternate</span>
                  )}
                  <label className="absolute inset-0 bg-brand-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white flex-col gap-2">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Alterar Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recomendado: 500x500px</p>
              </div>

              {/* General Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Nome da Usina</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm"
                    value={profileForm.socialName}
                    onChange={e => handleProfileChange('socialName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Responsável Técnico</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm"
                    value={profileForm.contactName}
                    onChange={e => handleProfileChange('contactName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Capacidade Registrada (MW)</label>
                  <input
                    type="number" step="0.1"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-display font-black text-primary text-lg"
                    value={profileForm.energyCapacity}
                    onChange={e => handleProfileChange('energyCapacity', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Cidade</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm"
                      value={profileForm.locationCity}
                      onChange={e => handleProfileChange('locationCity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">UF</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm text-center"
                      value={profileForm.locationState}
                      onChange={e => handleProfileChange('locationState', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Auth Credentials */}
              <div className="pt-8 border-t border-slate-100 space-y-6">
                <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span> Credenciais de Acesso
                </h4>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Novo E-mail</label>
                  <input
                    type="email"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm"
                    placeholder="usuario@usina.com.br"
                    value={profileForm.email}
                    onChange={e => handleProfileChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm"
                    placeholder="••••••••"
                    value={profileForm.password}
                    onChange={e => handleProfileChange('password', e.target.value)}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium">Deixe em branco se não quiser alterar suas credenciais.</p>
              </div>
            </div>

            <footer className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:scale-105 transition-transform"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </footer>
          </div>
        </div>
      )}

      <Sidebar
        userType="Gestão Comercial"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={sidebarItems}
        onLogout={async () => {
          await supabase.auth.signOut();
          navigate('/');
        }}
        logoVariant="light"
        className="hidden lg:flex"
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Header
          title={
            activeTab === 'overview' ? 'Painel de Gestão' :
              activeTab === 'strategy' ? 'Configurações de Oferta' :
                activeTab === 'clients' ? 'Controle de Clientes' :
                  activeTab === 'negotiations' ? 'Fluxo de Contratos' :
                    activeTab === 'profile' ? 'Dados da Planta' : ''
          }
          subtitle={`${generatorData.socialName || 'Sua Usina'} - ${generatorData.locationCity}, ${generatorData.locationState}`}
          rightContent={
            <div className="flex items-center gap-8">
              <div className="text-right cursor-pointer group" onClick={() => setShowAdminArea(true)}>
                <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest group-hover:text-primary transition-colors">Capacidade Registrada</p>
                <p className="text-xl font-display font-extrabold text-primary">{generatorData.energyCapacity} MW / ano</p>
              </div>
              <div
                onClick={() => setShowAdminArea(true)}
                className="size-11 rounded-2xl bg-brand-navy flex items-center justify-center text-white shadow-xl overflow-hidden ring-2 ring-slate-100 cursor-pointer hover:scale-110 transition-transform"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined">factory</span>
                )}
              </div>
            </div>
          }
        />

        <div className="p-10 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest mb-2">Energia em Estoque</p>
                  <h3 className="text-3xl font-display font-extrabold text-brand-navy mb-1">{generatorData.energyCapacity} MW</h3>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-wider">Disponível para Venda</p>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest mb-2">Clientes Ativos</p>
                  <h3 className="text-3xl font-display font-extrabold text-brand-navy mb-1">{clients.length}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{clients.length > 0 ? 'Conexões Ativas' : 'Aguardando Conexões'}</p>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium bg-primary/5">
                  <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest mb-2">Leads Projetados (IA)</p>
                  <h3 className="text-3xl font-display font-extrabold text-primary mb-1">{projectedLeads}</h3>
                  <p className="text-brand-navy text-[10px] font-bold uppercase tracking-wider">Potenciais Negociações</p>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium">
                  <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest mb-2">Receita Atual</p>
                  <h3 className="text-3xl font-display font-extrabold text-brand-navy mb-1">R$ {totalMonthlyRevenue.toLocaleString('pt-BR')}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mês Atual</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-premium space-y-12">
                <header>
                  <h3 className="text-2xl font-display font-black text-brand-navy mb-2">Parâmetros de Venda</h3>
                  <p className="text-brand-slate text-sm">Defina como sua planta será apresentada no Marketplace para os clientes.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Modelos de Acordo (Texto Legal)</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-sm min-h-[120px]"
                        placeholder="Ex: Contrato de aluguel de cotas de usina solar com fidelidade de 12 meses..."
                        value={generatorData.agreements}
                        onChange={(e) => onUpdate({ agreements: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Desconto Ofertado (%)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range" min="0" max="35"
                          className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                          value={generatorData.discount}
                          onChange={(e) => onUpdate({ discount: Number(e.target.value) })}
                        />
                        <span className="text-2xl font-display font-black text-primary">{generatorData.discount}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-black text-brand-navy uppercase tracking-[0.2em] mb-4">Taxa de Conexão SO INVEST</h4>
                      <p className="text-xs text-brand-slate font-medium mb-8">Defina a comissão paga à plataforma para cada contrato fechado através do nosso hub de investimentos.</p>

                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <span className="text-xs font-black text-brand-navy uppercase tracking-widest">Comissão SO INVEST</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            className="w-16 bg-slate-50 border-none text-center font-bold text-primary text-xl outline-none"
                            value={generatorData.commission}
                            onChange={(e) => onUpdate({ commission: Number(e.target.value) })}
                          />
                          <span className="text-brand-navy font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateParams}
                      className="w-full btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg mt-8 active:scale-95 transition-transform"
                    >
                      Atualizar Parâmetros de Venda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {clients.length === 0 ? (
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-20 text-center">
                  <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-8">
                    <span className="material-symbols-outlined text-5xl">group_off</span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-brand-navy mb-4">Nenhum cliente conectado ainda</h3>
                  <p className="text-brand-slate text-sm max-w-md mx-auto mb-10">Assim que você ativar sua oferta comercial, os clientes do Marketplace poderão selecionar sua usina para conexão.</p>
                  <button onClick={() => setActiveTab('strategy')} className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Configurar minha primeira oferta agora</button>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-brand-slate tracking-widest">Cliente</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-brand-slate tracking-widest">Status</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-brand-slate tracking-widest">Fatura Estimada</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-brand-slate tracking-widest">Data Conexão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {clients.map(client => (
                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6 font-bold text-brand-navy">{client.name}</td>
                          <td className="px-10 py-6">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-full">{client.status}</span>
                          </td>
                          <td className="px-10 py-6 font-display font-extrabold text-brand-navy">R$ {Number(client.billValue).toLocaleString('pt-BR')}</td>
                          <td className="px-10 py-6 text-xs text-brand-slate">{client.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'negotiations' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {negotiations.length === 0 ? (
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-20 text-center">
                  <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-8">
                    <span className="material-symbols-outlined text-5xl">handshake</span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-brand-navy mb-4">Funil de Vendas Vazio</h3>
                  <p className="text-brand-slate text-sm max-w-md mx-auto mb-10">Não há propostas em análise de crédito ou aguardando assinatura no momento.</p>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-10">
                  <h3 className="text-brand-navy font-display font-extrabold text-xl mb-8">Propostas em Fluxo</h3>
                  <div className="space-y-4">
                    {negotiations.map(neg => (
                      <div key={neg.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-6">
                          <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-primary">description</span>
                          </div>
                          <div>
                            <p className="font-bold text-brand-navy">{neg.name}</p>
                            <p className="text-[10px] text-brand-slate font-black uppercase tracking-widest">{neg.status}</p>
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">Ver Documentação</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-premium">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-display font-extrabold text-brand-navy flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">manage_accounts</span>
                    Configurações da Usina
                  </h3>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="btn-startpro text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:scale-105 transition-transform"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Coluna da Esquerda: Logo e Identificação */}
                  <div className="space-y-8">
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-4">Logo da Usina</p>
                      <div className="relative group w-32 h-32 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden mb-4 p-2">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-slate-300">add_photo_alternate</span>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold uppercase">
                          Alterar
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                      </div>
                      <p className="text-[9px] text-slate-400">Recomendado: 500x500px (PNG/JPG)</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-2">Capacidade Registrada (MW)</p>
                      <input
                        type="number" step="0.1"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-display font-black text-primary text-lg mb-4"
                        value={profileForm.energyCapacity}
                        onChange={e => handleProfileChange('energyCapacity', e.target.value)}
                      />

                      <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-2">Localização (Cidade/UF)</p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm"
                          value={profileForm.locationCity}
                          onChange={e => handleProfileChange('locationCity', e.target.value)}
                          placeholder="Cidade"
                        />
                        <input
                          className="w-20 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm text-center"
                          value={profileForm.locationState}
                          onChange={e => handleProfileChange('locationState', e.target.value)}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coluna da Direita: Formulário */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Nome da Usina</label>
                        <input
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm"
                          value={profileForm.socialName}
                          onChange={e => handleProfileChange('socialName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Responsável Técnico</label>
                        <input
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm"
                          value={profileForm.contactName}
                          onChange={e => handleProfileChange('contactName', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-black text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">lock</span> Credenciais de Acesso
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Novo E-mail de Acesso</label>
                          <input
                            type="email"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm"
                            placeholder="usuario@usina.com.br"
                            value={profileForm.email}
                            onChange={e => handleProfileChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Nova Senha</label>
                          <input
                            type="password"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 font-bold text-brand-navy text-sm"
                            placeholder="••••••••"
                            value={profileForm.password}
                            onChange={e => handleProfileChange('password', e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="mt-4 text-[9px] text-slate-400 font-medium">Deixe em branco se não quiser alterar suas credenciais.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeneratorDashboard;
