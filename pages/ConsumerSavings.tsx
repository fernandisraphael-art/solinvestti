
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEnergyProfile } from '../services/geminiService';

const ConsumerSavings: React.FC<{ userData: any }> = ({ userData }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Processando Ativos Financeiros...</h2>
        <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Transformando custo em patrimônio</p>
      </div>
    );
  }

  const annualSavings = (analysis?.economia_mensal_estimada || 0) * 12;

  return (
    <div className="min-h-screen bg-brand-navy text-white p-6 md:p-12 font-sans overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              Crescimento Patrimonial Estimado
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-4">Seu Novo Ativo.</h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              Sua economia mensal de <span className="text-white">R$ {analysis?.economia_mensal_estimada.toLocaleString('pt-BR')}</span> não é apenas um desconto, é capital para investimento.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-8 py-6 rounded-3xl backdrop-blur-xl">
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Passivo Mensal (Luz)</p>
             <p className="text-2xl font-black">R$ {originalBill.toLocaleString('pt-BR')}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 bg-brand-deep/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Lucro Operacional Líquido</span>
              <span className="bg-primary text-brand-navy px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Adesão Free</span>
            </div>
            <div className="mb-12">
              <span className="text-7xl md:text-9xl font-display font-black tracking-tighter text-gradient-green">
                R$ {analysis?.economia_mensal_estimada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
              <p className="text-slate-500 mt-6 text-sm font-bold italic">"{analysis?.dica_investimento}"</p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Novo Custo de Manutenção</span>
                <span className="text-primary">Margem de Eficiência: {providerDiscount*100}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(analysis?.novo_valor_conta / originalBill) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col justify-center">
              <p className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest">Gasto Otimizado</p>
              <p className="text-4xl font-black">R$ {analysis?.novo_valor_conta.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-primary p-8 rounded-3xl flex flex-col justify-center shadow-2xl shadow-primary/20">
              <p className="text-brand-navy text-[10px] font-black mb-1 uppercase tracking-widest">Patrimônio em 1 ano</p>
              <p className="text-4xl font-black text-brand-navy">R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center md:text-left">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div>
                <h3 className="text-2xl font-display font-black mb-2 tracking-tight">Pronto para converter?</h3>
                <p className="text-slate-400 font-medium">Escolha onde alocar seu lucro mensal e finalize sua adesão institucional.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                  onClick={() => navigate('/investments')}
                  className="btn-startpro px-12 py-6 text-white font-black rounded-2xl flex items-center justify-center gap-3"
                >
                  Investir Ganhos
                  <span className="material-symbols-outlined">payments</span>
                </button>
                <button 
                  onClick={() => navigate('/finalize')}
                  className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all"
                >
                  Apenas Finalizar
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerSavings;
