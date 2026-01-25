import React, { useState, useMemo } from 'react';
import { EnergyProvider } from '../../types';

interface OverviewTabProps {
    generators: EnergyProvider[];
    clients: any[];
    concessionaires: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ generators, clients, concessionaires }) => {
    // --- ESTADO DOS PARÂMETROS FINANCEIROS (INTERATIVO NA TELA) ---
    const [fixedCosts, setFixedCosts] = useState(15000);
    const [isEditingFinancials, setIsEditingFinancials] = useState(false);
    const [showFinancialInfo, setShowFinancialInfo] = useState(false);

    // Helpers de Formatação
    const formatCurrency = (val: number, decimals = 2) => {
        return val.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const parseCurrencyToNumber = (val: string) => {
        const digits = val.replace(/\D/g, '');
        return Number(digits) / 100;
    };

    // NOVO CÁLCULO: Meta de Comissão baseada em Custos Fixos
    const commissionGoal = useMemo(() => {
        return fixedCosts;
    }, [fixedCosts]);

    // 1. Somatórios Reais vinculados ao Banco de Dados
    const financeData = useMemo(() => {
        return clients.reduce((acc, client) => {
            const billVal = Number(client.billValue || client.bill_value || 0);
            acc.totalBilling += billVal;

            if (client.status === 'approved' || client.status === 'active') {
                const gen = generators.find(g => g.id === (client.supplier_id || client.supplierId || client.provider_id));
                if (gen) {
                    const commissionPercentage = Number(gen.commission || 0) / 100;
                    acc.totalCommissions += (billVal * commissionPercentage);
                    acc.activeBilling += billVal;
                }
            }
            return acc;
        }, { totalBilling: 0, totalCommissions: 0, activeBilling: 0 });
    }, [clients, generators]);

    // 2. Data para o KPI Area Chart (Tendência 15 dias)
    const kpiTrendData = useMemo(() => {
        const now = new Date();
        const points: { label: string; reg: number; ativ: number; comm: number }[] = [];

        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            const dayClients = clients.filter(c => new Date(c.created_at).toDateString() === d.toDateString());
            const reg = dayClients.length;
            const ativ = dayClients.filter(c => c.status === 'approved' || c.status === 'active').length;
            const comm = dayClients.reduce((sum, c) => {
                const gen = generators.find(g => g.id === (c.supplier_id || c.supplierId || c.provider_id));
                const bVal = Number(c.billValue || c.bill_value || 0);
                return sum + (bVal * (Number(gen?.commission || 0) / 100));
            }, 0);

            points.push({ label, reg, ativ, comm });
        }

        const maxVal = Math.max(...points.map(p => Math.max(p.reg, p.ativ, p.comm / 10)), 1);
        return points.map(p => ({
            ...p,
            regH: (p.reg / maxVal) * 100,
            ativH: (p.ativ / maxVal) * 100,
            commH: ((p.comm / 10) / maxVal) * 100
        }));
    }, [clients, generators]);

    const getAreaPath = (key: 'regH' | 'ativH' | 'commH') => {
        const width = 100;
        const height = 100;
        const pts = kpiTrendData.map((p, i) => {
            const x = (i / (kpiTrendData.length - 1)) * width;
            const y = height - (p[key] as number);
            return `${x},${y}`;
        });
        const line = `M ${pts.join(" L ")}`;
        return `${line} L 100,100 L 0,100 Z`;
    };

    // 3. Funil de Conversão Real
    const funnelData = useMemo(() => {
        const total = clients.length || 1;
        const active = clients.filter(c => c.status === 'approved' || c.status === 'active').length;
        const pending = clients.filter(c => c.status === 'pending_approval' || !c.status).length;

        return [
            { label: 'OPORTUNIDADES', value: total, color: 'bg-primary/20', border: 'border-primary/40', pct: 100 },
            { label: 'QUALIFICADOS', value: pending + active, color: 'bg-amber-400/20', border: 'border-amber-400/40', pct: ((pending + active) / total) * 100 },
            { label: 'CONTRATADOS', value: active, color: 'bg-emerald-400/20', border: 'border-emerald-400/40', pct: (active / total) * 100 }
        ];
    }, [clients]);

    // 4. Estados Reais
    const regionsData = useMemo(() => {
        const counts: Record<string, number> = {};
        clients.forEach(c => {
            const reg = (c.state || 'OUTROS').toUpperCase();
            counts[reg] = (counts[reg] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [clients]);

    // 5. Timeline Real
    const recentActivities = useMemo(() => {
        const activities: { type: string; msg: string; time: string; timestamp: number }[] = [];
        clients.slice(-10).forEach(c => {
            const date = new Date(c.created_at);
            activities.push({
                type: 'client',
                msg: `${c.name} registrou-se vinculando à ${c.generatorName || 'usina'}`,
                time: date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                timestamp: date.getTime()
            });
        });
        return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
    }, [clients]);

    const stats = [
        { label: 'USINAS', value: generators.filter(g => g.status === 'active').length, icon: 'factory', color: 'text-emerald-400' },
        { label: 'DISTRIB.', value: concessionaires.length, icon: 'account_balance', color: 'text-blue-400' },
        { label: 'CLIENTES', value: clients.length, icon: 'groups', color: 'text-primary' },
        { label: 'COMISSÕES', value: formatCurrency(financeData.totalCommissions, 0), icon: 'payments', color: 'text-amber-400' },
    ];

    return (
        <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto flex flex-col gap-3 pb-4 overflow-hidden bg-[#020617] p-3 rounded-2xl border border-white/5 relative">


            {/* INFORMATIVO FINANCEIRO (TOOLTIP) */}
            {showFinancialInfo && (
                <div className="absolute top-24 right-10 z-50 w-72 bg-[#0c112b] border border-white/10 p-5 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h6 className="text-[10px] font-black text-primary uppercase tracking-widest">Entendendo os Números</h6>
                        <button onClick={() => setShowFinancialInfo(false)} className="text-white/20 hover:text-white">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-white uppercase tracking-tighter">Custos Fixos</p>
                            <p className="text-[10px] text-white/40 leading-relaxed italic">Despesas que você paga todo mês independente de vender (Aluguel, Equipe, Softwares).</p>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            <p className="text-[8px] font-black text-amber-400/60 uppercase">Objetivo:</p>
                            <p className="text-[9px] text-white/30 italic">Comissão Acumulada no mês deve cobrir o Custo Fixo.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. HEADER REAIS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0c112b] border border-white/5 p-3 rounded-xl flex items-center justify-between shadow-lg hover:border-white/10 transition-all group">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h4 className="text-xl md:text-2xl font-display font-black text-white">{stat.value}</h4>
                        </div>
                        <div className={`size-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}>
                            <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. DASHBOARD BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

                {/* LEFT CONTENT (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-3">

                    {/* PERFORMANCE CHART */}
                    <div className="bg-[#0c112b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-[#1e293b]/20 px-5 py-3 flex justify-between items-center border-b border-white/5">
                            <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs">analytics</span> PERFORMANCE OPERACIONAL
                            </h5>
                            <div className="hidden md:flex gap-4">
                                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400/60 uppercase">🟢 Comissões</span>
                                <span className="flex items-center gap-1 text-[8px] font-black text-blue-400/60 uppercase">🔵 Leads</span>
                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-400/60 uppercase">🟡 Ativos</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-3 gap-8 mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(financeData.totalCommissions, 0)}</h3>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">COMISSÕES REAIS</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">{clients.length}</h3>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">VOLUME DE CAPTAÇÃO</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">
                                        {Math.round((clients.filter(c => c.status === 'approved' || c.status === 'active').length / (clients.length || 1)) * 100)}%
                                    </h3>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">TAXA DE ATIVAÇÃO</p>
                                </div>
                            </div>

                            <div className="h-[120px] relative">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradComm" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                                            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                                        </linearGradient>
                                        <linearGradient id="gradReg" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.4)" />
                                            <stop offset="100%" stopColor="rgba(37, 99, 235, 0.0)" />
                                        </linearGradient>
                                        <linearGradient id="gradAtiv" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
                                            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d={getAreaPath('commH')} fill="url(#gradComm)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
                                    <path d={getAreaPath('regH')} fill="url(#gradReg)" stroke="rgba(37, 99, 235, 0.4)" strokeWidth="1" />
                                    <path d={getAreaPath('ativH')} fill="url(#gradAtiv)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
                                </svg>
                                <div className="absolute bottom-0 w-full flex justify-between pt-3 border-t border-white/5 opacity-30">
                                    {kpiTrendData.filter((_, i) => i % 3 === 0).map((d, i) => (
                                        <span key={i} className="text-[8px] font-black text-white uppercase">{d.label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* PONTO DE EQUILÍBRIO (PE) INTERATIVO */}
                        <div className="bg-[#0c112b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group hover:border-white/10 transition-all">
                            <div className="bg-[#1e293b]/20 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest cursor-help" onClick={() => setShowFinancialInfo(!showFinancialInfo)}>
                                            META: PONTO DE EQUILÍBRIO (PE)
                                        </h5>
                                        <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest">CICLO MENSAL</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[10px] text-white/10 hover:text-primary transition-colors cursor-help" onClick={() => setShowFinancialInfo(!showFinancialInfo)}>info</span>
                                </div>
                                <button
                                    onClick={() => setIsEditingFinancials(!isEditingFinancials)}
                                    className={`size-6 rounded-lg flex items-center justify-center transition-all ${isEditingFinancials ? 'bg-primary text-brand-navy' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{isEditingFinancials ? 'check' : 'settings'}</span>
                                </button>
                            </div>
                            <div className="p-5 flex flex-col items-center justify-center min-h-[190px]">
                                {isEditingFinancials ? (
                                    <div className="w-full space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <div className="flex justify-between px-1">
                                                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Custos Fixos (R$)</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={formatCurrency(fixedCosts)}
                                                onChange={(e) => {
                                                    setFixedCosts(parseCurrencyToNumber(e.target.value));
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black text-sm focus:border-primary outline-none transition-all placeholder:text-white/5"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-3xl font-black text-white mb-1">{formatCurrency(commissionGoal, 0)}</h3>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-6 px-4 text-center">COMISSÃO NECESSÁRIA PARA COBRIR CUSTOS</p>

                                        <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden mb-2">
                                            <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000"
                                                style={{ width: `${Math.min((financeData.totalCommissions / (commissionGoal || 1)) * 100, 100)}%` }}></div>
                                        </div>

                                        <div className="flex justify-between w-full text-[9px] font-black text-white/60 uppercase px-1">
                                            <span>{formatCurrency(financeData.totalCommissions)} ACUMULADO</span>
                                            <span className={financeData.totalCommissions >= commissionGoal ? 'text-primary animate-pulse' : ''}>
                                                {Math.round((financeData.totalCommissions / (commissionGoal || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-6 px-4 py-1.5 bg-white/[0.02] rounded-full border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="size-1 rounded-full bg-primary/40"></div>
                                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">META MENSAL: <span className="text-primary/80">{formatCurrency(fixedCosts)}</span></span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* FUNIL REAL */}
                        <div className="bg-[#0c112b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl group hover:border-white/10 transition-all">
                            <div className="bg-[#1e293b]/20 px-5 py-3 border-b border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate mb-6">CONVERSÃO DE LEADS</h4>
                            </div>
                            <div className="p-5 flex flex-col gap-3 min-h-[190px] justify-center">
                                {funnelData.map((f, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center text-[9px] font-black text-white/30 uppercase mb-2 px-1 tracking-tighter">
                                            <span>{f.label}</span>
                                            <span>{f.value}</span>
                                        </div>
                                        <div className={`h-8 w-full ${f.color} ${f.border} border rounded-lg overflow-hidden flex items-center justify-end px-4`}>
                                            <span className="text-xs font-black text-white/40">{Math.round(f.pct)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* MAPA DE REGIOÕES */}
                    <div className="bg-[#0c112b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-[280px] group hover:border-white/10 transition-all">
                        <div className="bg-[#1e293b]/20 px-5 py-3 border-b border-white/5">
                            <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">DOMÍNIO GEOGRÁFICO</h5>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-2">
                                {regionsData.map((r, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center border border-white/0 hover:border-white/10 transition-all">
                                        <h4 className="text-2xl font-black text-white">{r.label}</h4>
                                        <p className="text-[9px] font-black text-white/20 uppercase">{r.value} LEADS</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[7px] font-black text-white/10 uppercase tracking-widest mt-6 text-center">ANÁLISE DE MERCADO EM TEMPO REAL</p>
                        </div>
                    </div>

                    {/* TIMELINE Twitter Model */}
                    <div className="bg-[#0c112b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-[280px] flex flex-col group hover:border-white/10 transition-all">
                        <div className="bg-[#1e293b]/20 px-5 py-3 border-b border-white/5">
                            <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">FEED DE OPERAÇÕES</h5>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
                            {recentActivities.map((act, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-primary transition-all">
                                        <span className="material-symbols-outlined text-lg text-white/20 group-hover:text-primary">person_add</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h6 className="text-[11px] font-bold text-white/70 leading-relaxed mb-1 truncate">{act.msg}</h6>
                                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default OverviewTab;
