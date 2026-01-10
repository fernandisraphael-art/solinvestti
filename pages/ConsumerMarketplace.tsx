
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EnergyProvider } from '../types';
import Logo from '../components/Logo';

interface ConsumerMarketplaceProps {
  userData: any;
  generators: EnergyProvider[];
  onSelect: (data: any) => void;
}

const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({ userData, generators, onSelect }) => {
  const navigate = useNavigate();
  const [billValue, setBillValue] = useState(userData.billValue || '0');

  useEffect(() => {
    onSelect({ billValue });
  }, [billValue]);

  const handleSelect = (provider: any) => {
    onSelect({ selectedProvider: provider, billValue });
    navigate('/savings');
  };

  const currentBill = Number(billValue) || 0;

  const rankedProviders = [...generators]
    .filter(p => p.status === 'active')
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
              <p className="text-[9px] font-black text-brand-slate uppercase tracking-widest">Acesso Consultoria</p>
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
            <h2 className="text-5xl font-display font-extrabold text-brand-navy mb-6">Ranking de Eficiência Energética</h2>
            <p className="text-lg text-brand-slate leading-relaxed">
              Baseado no seu perfil de consumo em <span className="text-brand-navy font-bold">{userData.state || 'Brasil'}</span>, selecionamos as usinas com maior potencial de retorno financeiro.
            </p>
          </div>

          <div className="w-full lg:w-[420px] bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100">
            <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-4">Gasto Mensal Atual (Média)</label>
            <div className="relative mb-6">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">R$</span>
              <input 
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl p-6 pl-16 text-4xl font-display font-extrabold text-brand-navy outline-none focus:ring-4 ring-primary/10"
                placeholder="0"
                value={billValue}
                onChange={(e) => setBillValue(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase italic">
              <span className="material-symbols-outlined text-[16px]">verified</span> Projeção em tempo real ativada
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {rankedProviders.map((provider, index) => {
            const savings = currentBill * (provider.discount / 100);
            const isTop = index === 0;

            return (
              <div 
                key={provider.id} 
                className={`bg-white rounded-[2.5rem] border group transition-all duration-300 hover:shadow-2xl hover:border-primary/30 ${isTop ? 'border-primary/20 ring-1 ring-primary/5' : 'border-slate-100'}`}
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex items-center gap-8 md:w-1/3">
                    <div className={`text-4xl font-display font-black w-14 text-center ${isTop ? 'text-primary' : 'text-slate-100'}`}>
                      {index + 1}
                    </div>
                    
                    <div className={`size-20 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white shadow-xl bg-gradient-to-br ${provider.color}`}>
                      {provider.name[0]}
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-primary transition-colors">{provider.name}</h3>
                      <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mt-1">{provider.region}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-center md:w-1/3 border-y md:border-y-0 md:border-x border-slate-50 py-6 md:py-0">
                    <p className="text-[10px] text-brand-slate font-black uppercase tracking-widest mb-2">Desconto / ROI</p>
                    <div className="text-center">
                      <span className="text-3xl font-display font-extrabold text-primary">-{provider.discount}%</span>
                      {currentBill > 0 && (
                         <p className="text-[11px] font-bold text-brand-navy mt-1">Economia: R$ {savings.toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  <div className="md:w-1/3 flex justify-end">
                    <button 
                      onClick={() => handleSelect(provider)}
                      className={`px-12 py-5 rounded-full font-black text-[12px] uppercase tracking-widest transition-all ${isTop ? 'btn-startpro text-white' : 'bg-slate-50 text-brand-navy hover:bg-slate-100'}`}
                    >
                      Selecionar Usina
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-12 bg-brand-navy rounded-[3rem] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
          <h4 className="text-2xl font-display font-bold text-white mb-4">Análise Personalizada?</h4>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Grandes consumidores industriais possuem taxas de desconto diferenciadas. Fale com um consultor sênior.</p>
          <button className="text-primary font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors">Solicitar Auditoria Corporativa</button>
        </div>
      </main>
    </div>
  );
};

export default ConsumerMarketplace;
