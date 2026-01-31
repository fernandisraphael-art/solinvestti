
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEnergyProfile } from '../services/geminiService';

const ConsumerSavings: React.FC<{ userData: any }> = ({ userData }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Debug: log userData to see what's being received
  console.log('[ConsumerSavings] userData received:', userData);
  console.log('[ConsumerSavings] billValue:', userData.billValue, 'type:', typeof userData.billValue);
  console.log('[ConsumerSavings] selectedProvider:', userData.selectedProvider);

  const originalBill = Number(userData.billValue) || 0;
  const providerDiscount = userData.selectedProvider ? userData.selectedProvider.discount / 100 : 0.18;

  const fetchAnalysis = async () => {
    setLoading(true);
    const res = await analyzeEnergyProfile(originalBill, userData.state || 'SP');
    const realSavings = originalBill * providerDiscount;
    const realNewBill = originalBill - realSavings;

    setAnalysis({
      ...res,
      economia_mensal_estimada: realSavings,
      novo_valor_conta: realNewBill
    });
    setLoading(false);
  };

  useEffect(() => {
    if (originalBill > 0) fetchAnalysis();
    else setLoading(false);
  }, [userData.selectedProvider, originalBill]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black text-white mb-1 tracking-tight">Processando...</h2>
        <p className="text-slate-500 uppercase text-[9px] font-black tracking-widest">Transformando custo em patrimônio</p>
      </div>
    );
  }

  const annualSavings = (analysis?.economia_mensal_estimada || 0) * 12;
  const efficiencyPercent = (providerDiscount * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans flex flex-col">
      {/* Header Fixo */}
      <nav className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => navigate('/marketplace')}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Voltar
        </button>
        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">verified</span>
          {userData.selectedProvider?.name || 'Usina Selecionada'}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full flex flex-col">

        {/* Comparativo Visual: Antes vs Depois */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Antes */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-wider mb-1">Você pagava</p>
            <p className="text-2xl md:text-3xl font-display font-black text-red-400">R$ {originalBill.toLocaleString('pt-BR')}</p>
          </div>

          {/* Economia (Destaque Central) */}
          <div className="bg-primary rounded-2xl p-4 text-center shadow-xl shadow-primary/30 transform scale-105">
            <p className="text-[9px] font-black text-brand-navy uppercase tracking-wider mb-1">Você economiza</p>
            <p className="text-2xl md:text-3xl font-display font-black text-brand-navy">R$ {analysis?.economia_mensal_estimada.toLocaleString('pt-BR')}</p>
          </div>

          {/* Depois */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Você paga</p>
            <p className="text-2xl md:text-3xl font-display font-black text-white">R$ {analysis?.novo_valor_conta.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Título e Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            {efficiencyPercent}% de eficiência garantida
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight">
            Transforme economia em <span className="text-primary">patrimônio</span>
          </h1>
        </div>

        {/* Card de Projeção Patrimonial */}
        <div className="bg-brand-deep/60 border border-white/5 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-24 -mt-24"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Economia Acumulada */}
              <div className="text-center md:text-left">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Patrimônio em 12 meses</p>
                <p className="text-5xl md:text-6xl font-display font-black text-gradient-green tracking-tight">
                  R$ {annualSavings.toLocaleString('pt-BR')}
                </p>
                <p className="text-slate-500 text-xs mt-2 italic max-w-sm">
                  "{analysis?.dica_investimento}"
                </p>
              </div>

              {/* Indicadores */}
              <div className="flex gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Por mês</p>
                  <p className="text-lg font-black text-primary">+R$ {analysis?.economia_mensal_estimada.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Desconto</p>
                  <p className="text-lg font-black text-white">{efficiencyPercent}%</p>
                </div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">
                <span>Seu novo custo mensal</span>
                <span className="text-primary">{efficiencyPercent}% mais barato</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${100 - providerDiscount * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-display font-black tracking-tight mb-1">Pronto para converter?</h3>
              <p className="text-slate-400 text-xs">Escolha onde alocar sua economia mensal.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/investments')}
                className="flex-1 sm:flex-none btn-startpro px-8 py-4 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-primary/20"
              >
                Investir Ganhos <span className="material-symbols-outlined text-lg">payments</span>
              </button>
              <button
                onClick={() => navigate('/finalize')}
                className="flex-1 sm:flex-none px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all text-sm"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerSavings;
