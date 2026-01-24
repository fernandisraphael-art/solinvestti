
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Fund {
  id: string;
  name: string;
  type: string;
  returnRate: number;
  rate?: string;
  term?: string;
  fgc?: boolean;
  taxFree?: boolean;
}

const DEFAULT_FUNDS: Record<string, Fund[]> = {
  xp: [
    { id: 'xp-1', name: 'CDB XP 120%', type: 'CDB', returnRate: 13.2, rate: '120% CDI', term: '2 anos', fgc: true },
    { id: 'xp-2', name: 'LCI XP Agro', type: 'LCI', returnRate: 10.8, rate: '98% CDI', term: '1 ano', fgc: true, taxFree: true },
    { id: 'xp-3', name: 'Tesouro IPCA+ XP', type: 'TESOURO', returnRate: 12.5, rate: 'IPCA + 6,5%', term: '5 anos', fgc: false }
  ],
  btg: [
    { id: 'btg-1', name: 'CDB BTG Digital', type: 'CDB', returnRate: 12.6, rate: '115% CDI', term: '1 ano', fgc: true },
    { id: 'btg-2', name: 'LCA BTG Agro+', type: 'LCA', returnRate: 10.5, rate: '96% CDI', term: '2 anos', fgc: true, taxFree: true },
    { id: 'btg-3', name: 'Debênture BTG Infra', type: 'DEBÊNTURE', returnRate: 13.2, rate: 'IPCA + 7,2%', term: '4 anos', fgc: false, taxFree: true }
  ],
  genial: [
    { id: 'genial-1', name: 'CDB Genial Plus', type: 'CDB', returnRate: 13.0, rate: '118% CDI', term: '3 anos', fgc: true },
    { id: 'genial-2', name: 'LCI Genial Imob', type: 'LCI', returnRate: 10.4, rate: '95% CDI', term: '1 ano', fgc: true, taxFree: true },
    { id: 'genial-3', name: 'CRI Genial Premium', type: 'CRI', returnRate: 14.0, rate: 'IPCA + 8%', term: '5 anos', fgc: false, taxFree: true }
  ]
};

const InvestmentSimulation: React.FC<{ userData: any; onComplete: (data: any) => void }> = ({ userData, onComplete }) => {
  const navigate = useNavigate();
  const partner = userData.investmentPartner || { id: 'btg', name: 'BTG Pactual' };

  const billValue = Number(userData.billValue) || 12000;
  const discount = (userData.selectedProvider?.discount || 18) / 100;
  const monthlySavings = billValue * discount;

  const [investmentPercent, setInvestmentPercent] = useState(100);

  // Use funds from partner if available, otherwise use defaults
  const funds: Fund[] = partner.funds || DEFAULT_FUNDS[partner.id] || DEFAULT_FUNDS.btg;

  // Pre-select the investment chosen by user, or first fund
  const defaultFund = partner.selectedInvestment
    ? funds.find((f: Fund) => f.id === partner.selectedInvestment.id) || funds[0]
    : funds[0];
  const [selectedFund, setSelectedFund] = useState<Fund>(defaultFund);

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

  const finalStr = simulationData.final.toFixed(2);
  const [integerPart, decimalPart] = finalStr.split('.');

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-primary/30 overflow-x-hidden">
      {/* Header Responsivo */}
      <nav className="h-auto min-h-[4rem] md:h-20 px-4 md:px-10 py-3 md:py-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 border-b border-slate-50 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => navigate('/investments')}
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-bold"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="hidden md:block h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="size-8 md:size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-glow-sm">
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">account_balance</span>
            </div>
            <h1 className="font-display font-black text-lg md:text-2xl tracking-tighter text-brand-navy uppercase">WEALTH ADVISOR</h1>
          </div>
        </div>
        <div className="bg-[#e2f5f0] px-4 md:px-8 py-2 md:py-3 rounded-full border border-primary/10 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 self-start md:self-auto">
          <span className="size-2 bg-primary rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">ESTRATÉGIA:</span> {partner.name.toUpperCase()}
        </div>
      </nav>

      {/* Main Content - Layout Responsivo */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden lg:max-h-[calc(100vh-5rem)]">
        {/* Sidebar - Parâmetros */}
        <div className="w-full lg:w-[350px] p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 bg-white lg:border-r border-slate-50 lg:overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-base md:text-lg lg:text-xl font-display font-black mb-4 md:mb-6 text-brand-navy tracking-tight">Parâmetros de Alocação</h3>

            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-end mb-3 md:mb-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">REINVESTIMENTO</label>
                <span className="text-primary font-display font-black text-2xl md:text-3xl">{investmentPercent}%</span>
              </div>

              <div className="relative h-3 md:h-2 bg-slate-100 rounded-full mb-4 md:mb-6">
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
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 size-5 md:size-4 bg-white border-4 border-primary rounded-full shadow-lg"></div>
                </div>
              </div>

              <p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100">
                Aporte mensal estimado: <span className="text-brand-navy font-black">R$ {monthlyInvestmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">TOP 3 RENDA FIXA</label>
              <div className="grid gap-2">
                {funds.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl border text-left transition-all group relative overflow-hidden ${selectedFund.id === fund.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    {/* Header with badge and name */}
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                      <span className={`text-[8px] md:text-[9px] font-black uppercase px-1.5 md:px-2 py-0.5 md:py-1 rounded ${fund.type === 'CDB' ? 'bg-blue-600 text-white' :
                        fund.type === 'LCI' ? 'bg-emerald-600 text-white' :
                          fund.type === 'LCA' ? 'bg-green-600 text-white' :
                            fund.type === 'TESOURO' ? 'bg-amber-500 text-white' :
                              fund.type === 'DEBÊNTURE' ? 'bg-purple-600 text-white' :
                                fund.type === 'CRI' ? 'bg-indigo-600 text-white' :
                                  'bg-slate-600 text-white'
                        }`}>
                        {fund.type}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-brand-navy tracking-tight line-clamp-1">{fund.name}</span>
                    </div>

                    {/* Rate, term and badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xs md:text-sm font-bold text-primary">{fund.rate || `+${fund.returnRate}% aa`}</span>
                        <span className="text-[10px] md:text-xs text-slate-400">• {fund.term || '1 ano'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {fund.taxFree && (
                          <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 md:px-2 py-0.5 rounded">
                            Isento IR
                          </span>
                        )}
                        {fund.fgc && (
                          <span className="text-[8px] md:text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 md:px-2 py-0.5 rounded">
                            FGC
                          </span>
                        )}
                      </div>
                    </div>
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
            className="w-full btn-startpro text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-premium transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            Efetivar Estratégia <span className="material-symbols-outlined text-base md:text-lg">rocket_launch</span>
          </button>

          <div className="text-center pb-4 lg:pb-0">
            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold leading-relaxed px-2 md:px-4">
              * As projeções apresentadas são meramente ilustrativas e baseadas em cenários hipotéticos. A rentabilidade real pode variar de acordo com as condições de mercado e taxas vigentes.
            </p>
          </div>
        </div>

        {/* Gráfico - Panel Principal */}
        <div className="flex-1 bg-brand-deep p-4 md:p-6 lg:p-10 lg:m-4 lg:rounded-[2.5rem] text-white flex flex-col relative overflow-hidden shadow-2xl border border-white/5 min-h-[400px] md:min-h-[500px]">
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-16 md:-mr-32 -mt-16 md:-mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[150px] md:w-[250px] h-[150px] md:h-[250px] bg-blue-500/10 rounded-full blur-[80px] -ml-8 md:-ml-16 -mb-8 md:-mb-16 opacity-30"></div>

          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-primary mb-4 md:mb-6 self-start bg-white/5 backdrop-blur-md">
                PROJEÇÃO ACUMULADA EM 30 ANOS
              </div>

              <div className="flex flex-col mb-4 md:mb-8">
                <div className="flex items-baseline gap-1 md:gap-2 lg:gap-3 flex-wrap">
                  <span className="text-xl md:text-3xl lg:text-5xl font-display font-black leading-none opacity-80">R$</span>
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-display font-black tracking-tighter leading-none animate-in slide-in-from-left duration-700">
                    {Number(integerPart).toLocaleString('pt-BR')}<span className="text-lg sm:text-xl md:text-2xl lg:text-4xl">,{decimalPart}</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-8 pt-4 md:pt-6 border-t border-white/5 max-w-3xl">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1 md:mb-2">TOTAL APORTADO</p>
                  <p className="text-base md:text-xl lg:text-3xl font-display font-black">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                  <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1 md:mb-2">LUCRO PROJETADO</p>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <span className="text-primary text-sm md:text-lg font-black">R$</span>
                    <p className="text-base md:text-xl lg:text-3xl font-display font-black text-primary">
                      {netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="mt-4 h-32 md:h-48 lg:h-60 flex items-end justify-between gap-0.5 md:gap-1 group/chart px-1 relative w-full">
              {simulationData.history.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group/bar relative h-full justify-end"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onTouchStart={() => setHoveredBar(i)}
                  onTouchEnd={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute bottom-full mb-1 md:mb-2 bg-white text-brand-navy p-2 md:p-3 rounded-lg md:rounded-xl shadow-premium z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[80px] md:min-w-[100px] text-center pointer-events-none">
                      <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-0.5">{h.label || `Ponto ${i}`}</p>
                      <p className="text-[10px] md:text-xs font-black whitespace-nowrap">R$ {h.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-white"></div>
                    </div>
                  )}

                  <div
                    className={`w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-sm transition-all duration-300 ${hoveredBar === i ? 'brightness-125 scale-x-125 md:scale-x-150 shadow-[0_0_20px_rgba(16,185,129,0.4)] z-10' : 'opacity-60 group-hover/chart:opacity-30 hover:!opacity-100'}`}
                    style={{ height: `${(h.value / simulationData.final) * 100}%` }}
                  ></div>

                  {h.label && (Number(h.label.replace('Ano ', '')) % 10 === 0) && (
                    <span className="absolute top-full mt-1 md:mt-2 text-[6px] md:text-[8px] font-black uppercase text-white/20 whitespace-nowrap">
                      {h.label.replace('Ano ', '')}A
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
