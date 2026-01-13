
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

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-h-[calc(100vh-6rem)]">
        <div className="lg:w-[350px] p-6 lg:p-8 space-y-6 overflow-y-auto bg-white border-r border-slate-50 custom-scrollbar">
          <div>
            <h3 className="text-lg lg:text-xl font-display font-black mb-6 text-brand-navy tracking-tight">Parâmetros de Alocação</h3>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">REINVESTIMENTO</label>
                <span className="text-primary font-display font-black text-3xl">{investmentPercent}%</span>
              </div>

              <div className="relative h-2 bg-slate-100 rounded-full mb-6">
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
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 size-4 bg-white border-4 border-primary rounded-full shadow-lg"></div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                Aporte mensal estimado: <span className="text-brand-navy font-black">R$ {monthlyInvestmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">PORTFÓLIO DE ATIVOS</label>
              <div className="grid gap-3">
                {funds.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${selectedFund.id === fund.id ? 'border-brand-navy bg-slate-50' : 'border-slate-50 hover:border-slate-100'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-brand-navy uppercase tracking-tight line-clamp-1 mr-2">{fund.name}</span>
                      <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full whitespace-nowrap">+{fund.returnRate}% aa</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{fund.type}</p>
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
            className="w-full btn-startpro text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-premium transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            Efetivar Estratégia <span className="material-symbols-outlined text-lg">rocket_launch</span>
          </button>
        </div>

        <div className="flex-1 bg-brand-deep p-6 lg:p-10 lg:m-4 lg:rounded-[2.5rem] text-white flex flex-col relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px] -ml-16 -mb-16 opacity-30"></div>

          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-6 self-start bg-white/5 backdrop-blur-md">
                PROJEÇÃO PATRIMONIAL INSTITUCIONAL
              </div>

              <div className="flex flex-col mb-8">
                <div className="flex items-start gap-2 lg:gap-3">
                  <span className="text-3xl lg:text-5xl font-display font-black leading-none opacity-80 mt-1 lg:mt-2">R$</span>
                  <h2 className="text-6xl lg:text-8xl font-display font-black tracking-tighter leading-none animate-in slide-in-from-left duration-700">
                    {Number(integerPart).toLocaleString('pt-BR')}
                  </h2>
                </div>
                <div className="text-2xl lg:text-4xl font-display font-black text-white/20 ml-8 lg:ml-20 -mt-1 tracking-tighter">
                  ,{decimalPart}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5 max-w-3xl">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">TOTAL APORTADO</p>
                  <p className="text-xl lg:text-3xl font-display font-black">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">LUCRO PROJETADO</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary text-lg font-black">R$</span>
                    <p className="text-xl lg:text-3xl font-display font-black text-primary">
                      {netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 h-48 lg:h-60 flex items-end justify-between gap-1 group/chart px-1 relative w-full">
              {simulationData.history.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group/bar relative h-full justify-end"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute bottom-full mb-2 bg-white text-brand-navy p-3 rounded-xl shadow-premium z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[100px] text-center pointer-events-none">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{h.label || `Ponto ${i}`}</p>
                      <p className="text-xs font-black whitespace-nowrap">R$ {h.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-white"></div>
                    </div>
                  )}

                  <div
                    className={`w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-sm transition-all duration-300 ${hoveredBar === i ? 'brightness-125 scale-x-150 shadow-[0_0_20px_rgba(16,185,129,0.4)] z-10' : 'opacity-60 group-hover/chart:opacity-30 hover:!opacity-100'}`}
                    style={{ height: `${(h.value / simulationData.final) * 100}%` }}
                  ></div>

                  {h.label && (Number(h.label.replace('Ano ', '')) % 5 === 0) && (
                    <span className="absolute top-full mt-2 text-[8px] font-black uppercase text-white/20 whitespace-nowrap">
                      {h.label.replace('Ano ', '')}A
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center">
              <p className="text-[8px] text-white/30 font-medium leading-relaxed max-w-2xl mx-auto">
                * As projeções apresentadas são meramente ilustrativas e baseadas em cenários hipotéticos. A rentabilidade real pode variar de acordo com as condições de mercado, taxas vigentes e a análise de crédito específica de cada instituição financeira parceira. Consulte a lâmina de cada produto para mais detalhes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvestmentSimulation;
