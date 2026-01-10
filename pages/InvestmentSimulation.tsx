
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Fund {
  id: string;
  name: string;
  type: string;
  returnRate: number;
}

const FUNDS_BY_PARTNER: Record<string, Fund[]> = {
  xp: [
    { id: 'xp-1', name: 'Solinvest Private Energy', type: 'PRIVATE EQUITY', returnRate: 14.5 },
    { id: 'xp-2', name: 'Tesouro Selic Premium', type: 'RENDA FIXA', returnRate: 11.2 },
    { id: 'xp-3', name: 'CDB Asset Plus', type: 'CRÉDITO PRIVADO', returnRate: 12.8 }
  ],
  btg: [
    { id: 'btg-1', name: 'BTG Infrastructure II', type: 'FII', returnRate: 12.5 },
    { id: 'btg-2', name: 'BTG Credito Estruturado', type: 'RF ATIVO', returnRate: 13.2 },
    { id: 'btg-3', name: 'Solinvest Yield Fund', type: 'PÓS-FIXADO', returnRate: 11.8 }
  ],
  genial: [
    { id: 'genial-1', name: 'Genial ESG Renewable', type: 'ESG FUND', returnRate: 13.8 },
    { id: 'genial-2', name: 'LCI Sustentável Isenta', type: 'ISENTO IR', returnRate: 10.5 },
    { id: 'genial-3', name: 'Genial Wealth Core', type: 'RENDA FIXA', returnRate: 12.2 }
  ]
};

const InvestmentSimulation: React.FC<{ userData: any; onComplete: (data: any) => void }> = ({ userData, onComplete }) => {
  const navigate = useNavigate();
  const partner = userData.investmentPartner || { id: 'btg', name: 'BTG Pactual' };
  
  const billValue = Number(userData.billValue) || 12000;
  const discount = (userData.selectedProvider?.discount || 18) / 100;
  const monthlySavings = billValue * discount;
  
  const [investmentPercent, setInvestmentPercent] = useState(100);
  const funds = FUNDS_BY_PARTNER[partner.id] || FUNDS_BY_PARTNER.btg;
  const [selectedFund, setSelectedFund] = useState<Fund>(funds[0]);

  const monthlyInvestmentAmount = (monthlySavings * investmentPercent) / 100;
  const simulationMonths = 360; // Horizonte padrão de 30 anos

  const simulationData = useMemo(() => {
    const months = simulationMonths;
    const monthlyRate = Math.pow(1 + selectedFund.returnRate / 100, 1 / 12) - 1;
    let accumulated = 0;
    const history = [];

    for (let i = 1; i <= months; i++) {
      accumulated = (accumulated + monthlyInvestmentAmount) * (1 + monthlyRate);
      if (i % 60 === 0) {
        history.push({ label: `Ano ${i / 12}`, value: accumulated });
      } else if (i % 12 === 0) {
        history.push({ label: '', value: accumulated });
      }
    }
    return { final: accumulated, history };
  }, [monthlyInvestmentAmount, selectedFund]);

  const totalInvested = monthlyInvestmentAmount * simulationMonths;
  const netProfit = simulationData.final - totalInvested;

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const finalStr = simulationData.final.toFixed(3);
  const [integerPart, decimalPart] = finalStr.split('.');

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-primary/30 overflow-x-hidden">
      <nav className="h-24 px-10 flex justify-between items-center border-b border-slate-50 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-glow-sm">
            <span className="material-symbols-outlined text-2xl font-bold">account_balance</span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-tighter text-brand-navy uppercase">WEALTH ADVISOR</h1>
        </div>
        <div className="bg-[#e2f5f0] px-8 py-3 rounded-full border border-primary/10 text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <span className="size-2 bg-primary rounded-full animate-pulse"></span>
          ESTRATÉGIA: {partner.name.toUpperCase()}
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-[450px] p-10 lg:p-14 space-y-12 overflow-y-auto bg-white border-r border-slate-50">
          <div>
            <h3 className="text-2xl font-display font-black mb-12 text-brand-navy tracking-tight">Parâmetros de Alocação</h3>
            
            <div className="mb-14">
              <div className="flex justify-between items-end mb-8">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">REINVESTIMENTO</label>
                 <span className="text-primary font-display font-black text-5xl">{investmentPercent}%</span>
              </div>
              
              <div className="relative h-2 bg-slate-100 rounded-full mb-10">
                <input 
                  type="range" min="0" max="100" step="10"
                  value={investmentPercent} 
                  onChange={(e) => setInvestmentPercent(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${investmentPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 size-6 bg-white border-4 border-primary rounded-full shadow-2xl"></div>
                </div>
              </div>
              
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                Com base na sua economia mensal, você está alocando <span className="text-brand-navy font-black">R$ {monthlyInvestmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> mensais para construção de patrimônio.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">PORTFÓLIO DE ATIVOS</label>
              <div className="grid gap-4">
                {funds.map((fund) => (
                  <button
                    key={fund.id} 
                    onClick={() => setSelectedFund(fund)}
                    className={`w-full p-8 rounded-[2rem] border-2 text-left transition-all group relative overflow-hidden ${selectedFund.id === fund.id ? 'border-brand-navy bg-slate-50' : 'border-slate-50 hover:border-slate-100'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-base font-black text-brand-navy uppercase tracking-tight">{fund.name}</span>
                      <span className="text-[12px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full">+{fund.returnRate}% aa</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{fund.type}</p>
                    {selectedFund.id === fund.id && (
                      <div className="absolute right-6 bottom-6 text-brand-navy/20">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              onComplete({ 
                investmentSimulation: { 
                  finalValue: simulationData.final,
                  months: simulationMonths,
                  monthlyInvestment: monthlyInvestmentAmount,
                  totalInvested: totalInvested
                } 
              });
              navigate('/finalize');
            }}
            className="w-full btn-startpro text-white py-7 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] shadow-premium transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Efetivar Estratégia <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>

        <div className="flex-1 bg-brand-deep p-10 lg:p-16 lg:m-8 lg:rounded-[4rem] text-white flex flex-col relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[180px] -mr-64 -mt-64 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -ml-32 -mb-32 opacity-40"></div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="inline-flex px-6 py-2.5 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-20 self-start bg-white/5 backdrop-blur-md">
              PROJEÇÃO PATRIMONIAL INSTITUCIONAL
            </div>

            <div className="flex flex-col mb-24">
              <div className="flex items-start gap-6">
                <span className="text-7xl lg:text-[10rem] font-display font-black leading-none opacity-80 mt-6 lg:mt-10">R$</span>
                <h2 className="text-8xl lg:text-[12rem] font-display font-black tracking-tighter leading-none animate-in slide-in-from-left duration-700">
                  {Number(integerPart).toLocaleString('pt-BR')}
                </h2>
              </div>
              <div className="text-6xl lg:text-8xl font-display font-black text-white/20 ml-24 lg:ml-56 -mt-4 tracking-tighter">
                ,{decimalPart}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 border-t border-white/5">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">TOTAL APORTADO</p>
                <p className="text-4xl lg:text-6xl font-display font-black">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">LUCRO PROJETADO</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-primary text-3xl font-black">R$</span>
                  <p className="text-4xl lg:text-6xl font-display font-black text-primary">
                    {netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-24 h-80 flex items-end justify-between gap-1 group/chart px-2 relative">
              {simulationData.history.map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center group/bar relative h-full justify-end"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute bottom-full mb-6 bg-white text-brand-navy p-4 rounded-2xl shadow-premium z-50 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{h.label || `Ponto ${i}`}</p>
                      <p className="text-sm font-black whitespace-nowrap">R$ {h.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-white"></div>
                    </div>
                  )}

                  <div 
                    className={`w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-xl transition-all duration-500 cursor-help ${hoveredBar === i ? 'brightness-125 scale-x-125 shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10' : 'opacity-70 group-hover/chart:opacity-40 hover:!opacity-100'}`}
                    style={{ height: `${(h.value / simulationData.final) * 100}%` }}
                  ></div>
                  
                  {h.label && (
                    <span className={`absolute top-full mt-6 text-[10px] font-black uppercase tracking-widest transition-colors ${hoveredBar === i ? 'text-primary' : 'text-white/30'}`}>
                      {h.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvestmentSimulation;
