import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnergyProvider, UserRole } from '../types';
import Logo from '../components/Logo';
import ProviderCard from '../components/marketplace/ProviderCard';
import BillInput from '../components/marketplace/BillInput';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';

interface ConsumerMarketplaceProps {
  userData: any;
  generators: EnergyProvider[];
  onSelect: (data: any) => void;
}

// Componente de Contato com Agente Comercial - Design compacto inline
const ContactSection: React.FC<{ userEmail?: string }> = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(userEmail || '');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Consulta Comercial - Solinvestti');
    const body = encodeURIComponent(`E-mail: ${email}\n\nMensagem:\n${message}`);
    window.location.href = `mailto:comercial@solinvestti.com.br?subject=${subject}&body=${body}`;
    setIsSent(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSent(false);
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-brand-navy/5 hover:bg-brand-navy/10 border-2 border-dashed border-brand-navy/20 hover:border-primary/50 rounded-2xl p-5 transition-all group flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-brand-navy text-sm">É uma empresa ou grande consumidor?</p>
            <p className="text-xs text-brand-slate">Consulte nosso agente comercial para taxas diferenciadas</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-brand-navy/40 group-hover:text-primary transition-colors">arrow_forward</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-brand-navy rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
      {isSent ? (
        <div className="py-4 text-center flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-2xl text-primary">check_circle</span>
          <p className="text-white font-bold text-sm">Abrindo seu cliente de e-mail...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">mail</span>
              Fale com nosso time comercial
            </p>
            <button type="button" onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="Seu e-mail"
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/40 outline-none focus:border-primary transition-colors"
            />
            <input
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva sua necessidade..."
              className="flex-[2] bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/40 outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="btn-startpro px-6 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Enviar <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({ userData, generators, onSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error, isLoading, refreshData } = useSystem();
  const [billValue, setBillValue] = useState(userData.billValue || '0');

  // Debug: log initial userData.billValue
  console.log('[Marketplace] Initial userData.billValue:', userData.billValue, 'local billValue:', billValue);

  // Sync incoming userData to local state (fixes race condition if navigation happens before state update propagates)
  useEffect(() => {
    const incomingValue = userData.billValue;
    console.log('[Marketplace] useEffect - userData.billValue:', incomingValue, 'current billValue:', billValue);

    // Only update if incoming value is meaningful and different
    if (incomingValue && incomingValue !== '0' && incomingValue !== billValue) {
      console.log('[Marketplace] Syncing billValue from props:', incomingValue);
      setBillValue(incomingValue);
    }
    // If billValue is still '0' and we have no incoming value, try to get from user profile
    else if (billValue === '0' && (!incomingValue || incomingValue === '0')) {
      console.log('[Marketplace] billValue is 0, keeping default or waiting for user input');
    }
  }, [userData.billValue]);

  const handleBillChange = (newValue: string) => {
    setBillValue(newValue);
    onSelect({ billValue: newValue });
  };

  const handleSelect = (provider: EnergyProvider) => {
    console.log('[Marketplace] handleSelect - billValue:', billValue, 'provider:', provider.name, 'discount:', provider.discount);
    onSelect({ selectedProvider: provider, billValue });
    navigate('/savings');
  };

  console.log('Marketplace Debug:', {
    totalGenerators: generators.length,
    userState: userData.state,
    sampleGenRegion: generators[0]?.region,
    sampleGenStatus: generators[0]?.status,
    allGenerators: generators.map(g => ({ name: g.name, region: g.region, status: g.status })),
    systemError: error,
    isLoading
  });

  const rankedProviders = [...generators]
    .filter(p => {
      // Accept both English and Portuguese status values
      const isActive = p.status === 'active' || p.status === 'ativo';
      console.log(`[Filter 1] ${p.name}: status=${p.status}, isActive=${isActive}`);
      return isActive;
    })
    .filter(p => {
      if (userData.state) {
        // Flexible matching: check if region contains the state (case-insensitive)
        const regionLower = (p.region || '').toLowerCase();
        const stateLower = userData.state.toLowerCase();
        const matches = regionLower.includes(stateLower) || stateLower.includes(regionLower);
        console.log(`[Filter 2] ${p.name}: region="${p.region}", state="${userData.state}", matches=${matches}`);
        return matches;
      }
      return true;
    })
    .sort((a, b) => b.discount - a.discount);

  console.log('[Marketplace] Final rankedProviders:', rankedProviders.length, rankedProviders.map(p => p.name));

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
      <nav className="glass-nav sticky top-0 z-50 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/">
            <Logo variant="dark" />
          </Link>

          <Link to="/signup" className="flex items-center gap-2 text-brand-navy hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-xs font-bold hidden sm:inline">Voltar</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <ContactSection userEmail={userData.email} />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-12 mt-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">Marketplace Institucional v4.0</span>
            <h2 className="text-5xl font-display font-extrabold text-brand-navy mb-6">Ranking das Geradoras</h2>
            <p className="text-lg text-brand-slate leading-relaxed">
              {userData.state
                ? <>Baseado no seu perfil de consumo em <span className="text-brand-navy font-bold">{userData.state}</span>, selecionamos as usinas com maior potencial de retorno financeiro.</>
                : <>Selecionamos as usinas com maior potencial de retorno financeiro para você.</>
              }
            </p>
          </div>

          <BillInput value={billValue} onChange={handleBillChange} />
        </div>


        <div className="space-y-6">
          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <span className="material-symbols-outlined text-3xl text-red-500">cloud_off</span>
              <div className="flex-1">
                <h3 className="text-brand-navy font-bold text-lg mb-1">Serviço Indisponível</h3>
                <p className="text-brand-slate text-sm">
                  Não foi possível carregar a lista de usinas. Isso pode ocorrer por falha na conexão ou configuração do servidor.
                  <br />
                  <span className="text-xs opacity-75">Erro técnico: {error}</span>
                </p>
              </div>
              <button
                onClick={() => refreshData()}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {isLoading && !error && (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-brand-slate font-medium">Buscando melhores ofertas...</p>
            </div>
          )}

          {!isLoading && !error && rankedProviders.map((provider, index) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={index}
              currentBill={Number(billValue)}
              onSelect={handleSelect}
            />
          ))}

          {!isLoading && !error && rankedProviders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">search_off</span>
              <p className="text-slate-400 font-bold">Nenhuma usina disponível para {userData.state || 'sua região'} no momento.</p>
            </div>
          )}
        </div>

      </main>
    </div >
  );
};

export default ConsumerMarketplace;
