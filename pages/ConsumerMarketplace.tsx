
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnergyProvider, UserRole } from '../types';
import Logo from '../components/Logo';
import ProviderCard from '../components/marketplace/ProviderCard';
import BillInput from '../components/marketplace/BillInput';
import { useAuth } from '../contexts/AuthContext';

interface ConsumerMarketplaceProps {
  userData: any;
  generators: EnergyProvider[];
  onSelect: (data: any) => void;
}

const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({ userData, generators, onSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billValue, setBillValue] = useState(userData.billValue || '0');

  useEffect(() => {
    onSelect({ billValue });
  }, [billValue]);

  const handleSelect = (provider: EnergyProvider) => {
    onSelect({ selectedProvider: provider, billValue });
    navigate('/savings');
  };

  const rankedProviders = [...generators]
    .filter(p => p.status === 'active')
    .filter(p => {
      if (userData.state) {
        // Flexible matching: check if region contains the state (case-insensitive)
        const regionLower = (p.region || '').toLowerCase();
        const stateLower = userData.state.toLowerCase();
        return regionLower.includes(stateLower) || stateLower.includes(regionLower);
      }
      return true;
    })
    .sort((a, b) => b.discount - a.discount);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
      <nav className="glass-nav sticky top-0 z-50 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/">
            <Logo variant="dark" />
          </Link>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-brand-slate uppercase tracking-widest">Acesso Usuário</p>
              <p className="text-xs font-bold text-brand-navy">{userData.name || 'Convidado'}</p>
            </div>
            <div className="size-11 rounded-full bg-white shadow-premium flex items-center justify-center border border-slate-100">
              <span className="material-symbols-outlined text-brand-navy">person</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">Marketplace Institucional v4.0</span>
            <h2 className="text-5xl font-display font-extrabold text-brand-navy mb-6">Ranking das Geradoras</h2>
            <p className="text-lg text-brand-slate leading-relaxed">
              Baseado no seu perfil de consumo em <span className="text-brand-navy font-bold">{userData.state || 'Brasil'}</span>, selecionamos as usinas com maior potencial de retorno financeiro.
            </p>
          </div>

          <BillInput value={billValue} onChange={setBillValue} />
        </div>

        <div className="space-y-6">
          {rankedProviders.map((provider, index) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={index}
              currentBill={Number(billValue)}
              onSelect={handleSelect}
            />
          ))}

          {rankedProviders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">search_off</span>
              <p className="text-slate-400 font-bold">Nenhuma usina disponível para {userData.state || 'sua região'} no momento.</p>
            </div>
          )}
        </div>

        <div className="mt-20 p-12 bg-brand-navy rounded-[3rem] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
          <h4 className="text-2xl font-display font-bold text-white mb-4">Análise Personalizada?</h4>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Grandes consumidores industriais possuem taxas de desconto diferenciadas. Fale com um consultor sênior.</p>
          <button className="text-primary font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors">Solicitar Auditoria Corporativa</button>
        </div>
      </main>
    </div >
  );
};

export default ConsumerMarketplace;
