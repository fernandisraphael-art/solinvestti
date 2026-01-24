
import React, { useState } from 'react';
import { EnergyProvider, Client } from '../../types';
import { maskPhone, parseCurrencyToNumber } from '../../lib/masks';

interface SuppliersTabProps {
    generators: EnergyProvider[];
    onToggleStatus: (id: string, status: string) => void;
    onDeleteGenerator: (id: string) => void;
    onEditGenerator: (gen: EnergyProvider) => void;
    onNewGenerator: () => void;
    onActivateAll: () => void;
    onProspect: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
    onImport: () => void;
    clients: Client[];
    onUpdateGenerator: (id: string, data: Partial<EnergyProvider>) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({
    generators,
    onToggleStatus,
    onDeleteGenerator,
    onEditGenerator,
    onNewGenerator,
    onActivateAll,
    onProspect,
    onExportExcel,
    onExportPDF,
    onImport,
    clients,
    onUpdateGenerator
}) => {
    // Proporção de Geração: 1 MWp (Instalado) gera aprox. 125.000 kWh/mês (Média Brasil)
    // Isso converte a demanda de energia do cliente em "potência de usina necessária"
    const KWH_PER_MW = 125000;

    const getCapacityStats = (gen: EnergyProvider) => {
        // Capacidade da Usina já está em MW (Input do Admin)
        const totalMW = typeof gen.capacity === 'number'
            ? gen.capacity
            : parseFloat(String(gen.capacity || '0').replace(/\./g, '').replace(',', '.'));

        const relevantClients = clients.filter(c =>
            (c.supplier_id === gen.id || c.supplierId === gen.id || c.provider_id === gen.id) &&
            (c.status === 'approved' || c.status === 'active')
        );

        const stats = relevantClients.reduce((acc, c) => {
            // 1. Pega consumo em kWh (ou estima pelo valor da conta)
            const billVal = Number(c.billValue || c.bill_value || 0);
            const consumptionKWh = Number(c.consumption) || (billVal / 0.85);

            // 2. Converte kWh do cliente para MW equivalentes da usina
            const equivalentMW = consumptionKWh / KWH_PER_MW;

            acc.usedMW += (equivalentMW || 0);
            acc.totalBill += billVal;

            return acc;
        }, { usedMW: 0, totalBill: 0 });

        const commissionPercentage = Number(gen.commission || 0) / 100;
        const totalCommission = stats.totalBill * commissionPercentage;

        return {
            total: totalMW,
            used: stats.usedMW,
            remaining: totalMW - stats.usedMW,
            clientCount: relevantClients.length,
            totalBill: stats.totalBill,
            totalCommission
        };
    };
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };

        if (isExportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

    const pendingCount = generators.filter(g => g.status === 'pending').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-[#020617] p-3 rounded-2xl border border-white/5 max-h-screen overflow-y-auto no-scrollbar">

            <div className="flex items-center gap-3">
                <button onClick={onProspect} className="px-5 py-2.5 bg-primary text-brand-navy rounded-xl font-black text-[9px] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 transition-all">
                    <span className="material-symbols-outlined text-sm mr-2">travel_explore</span> Prospecção IA
                </button>

                <button
                    onClick={onNewGenerator}
                    className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span> Novo Gerador
                </button>

                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="px-5 py-2.5 bg-[#0c112b] border border-white/5 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">download</span> Exportar
                    </button>

                    {isExportMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-[#0c112b] border border-white/10 rounded-xl p-2 flex flex-col w-40 shadow-2xl z-50">
                            <button onClick={() => { onExportExcel(); setIsExportMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                <span className="material-symbols-outlined text-green-500 text-sm">table_view</span> Excel (.xlsx)
                            </button>
                            <button onClick={() => { onExportPDF(); setIsExportMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span> PDF
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={onImport}
                    className="px-5 py-2.5 bg-[#0c112b] border border-white/5 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">upload_file</span> Importar
                </button>
            </div>

            {/* Banner de Ativação em Massa */}
            {pendingCount > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between animate-bounce-subtle">
                    <div className="flex items-center gap-6">
                        <div className="size-12 bg-emerald-500 rounded-full flex items-center justify-center text-brand-navy shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined font-black">done_all</span>
                        </div>
                        <div>
                            <p className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Ação em Massa Disponível</p>
                            <h4 className="text-white font-display font-black text-lg">Ativar {pendingCount} usinas pendentes?</h4>
                        </div>
                    </div>
                    <button onClick={onActivateAll} className="px-8 py-3 bg-emerald-500 text-brand-navy rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Ativar Agora
                    </button>
                </div>
            )}

            {/* Compact Grid Layout for Generators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {generators.map((gen) => {
                    const { total, used, remaining, clientCount, totalCommission } = getCapacityStats(gen);
                    return (
                        <div key={gen.id} className={`bg-[#0c112b] border rounded-xl hover:border-blue-500/30 transition-colors group relative overflow-hidden ${gen.status === 'cancelled' ? 'border-red-500/20 opacity-60 hover:opacity-100' : 'border-white/5 shadow-xl'}`}>
                            <div className={`h-1 w-full bg-gradient-to-r ${gen.color || 'from-slate-400 to-slate-500'}`}></div>
                            <div className="p-3">
                                {/* Header: Name & Status */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`p-1.5 rounded-lg bg-white/5 text-white/60 group-hover:text-primary transition-colors`}>
                                            <span className="material-symbols-outlined text-[16px]">{gen.icon || 'bolt'}</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-white text-xs truncate" title={gen.name}>{gen.name}</h3>
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest truncate mb-0.5">{gen.city || 'N/A'} - {gen.region || 'BR'}</p>
                                            <div className="flex items-center gap-0.5" title={`${clientCount} clientes ativos`}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={`material-symbols-outlined text-[10px] ${star <= (clientCount === 0 ? 0 : clientCount <= 2 ? 1 : clientCount <= 5 ? 2 : clientCount <= 10 ? 3 : clientCount <= 20 ? 4 : 5)
                                                        ? 'text-amber-400 fill-current'
                                                        : 'text-white/10'
                                                        }`}>star</span>
                                                ))}
                                                <span className="text-[8px] text-white/30 ml-1 font-medium">({clientCount})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${gen.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : gen.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {gen.status === 'active' ? 'Ativo' : gen.status === 'cancelled' ? 'Cancelado' : 'Pend.'}
                                    </span>
                                </div>

                                {/* Detailed Info Grid */}
                                <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[9px] text-white/50 mb-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <div>
                                        <span className="block text-white/20 font-bold uppercase tracking-wider text-[8px]">Desconto</span>
                                        <span className="font-bold text-emerald-400">{gen.discount}%</span>
                                    </div>
                                    <div>
                                        <span className="block text-white/20 font-bold uppercase tracking-wider text-[8px]">Comissão</span>
                                        <span className="font-bold text-white/80">{gen.commission}%</span>
                                    </div>

                                    {/* New: Client & Commission Counter Prominent */}
                                    <div className="col-span-2 border-t border-white/5 pt-1 mt-0.5 flex flex-col gap-1 bg-blue-500/5 -mx-2 px-2 py-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/40 font-bold uppercase tracking-wider text-[8px]">Carteira de Clientes</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="size-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">
                                                    <span className="material-symbols-outlined text-[12px]">group</span>
                                                </span>
                                                <span className="font-black text-white text-[11px]">{clientCount} Ativos</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-1">
                                            <span className="text-white/40 font-bold uppercase tracking-wider text-[8px]">Receita de Comissões</span>
                                            <span className="font-black text-primary text-[11px]">R$ {totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 border-t border-white/5 pt-1 mt-0.5">
                                        <span className="block text-white/20 font-bold uppercase tracking-wider text-[8px]">Capacidade Restante / Total</span>
                                        <div className="flex justify-between items-end">
                                            <span className={`font-bold truncate text-[10px] ${remaining < 0 ? 'text-red-400' : 'text-white/80'}`}>
                                                {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} MW
                                            </span>
                                            <span className="text-[7px] text-white/30">
                                                {total > 0 ? ((used / total) * 100).toFixed(1) : 0}% Uso
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full transition-all ${remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${total > 0 ? Math.min((used / total) * 100, 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 pt-1 border-t border-white/5 mt-0.5">
                                        <span className="block text-white/20 font-bold uppercase tracking-wider text-[8px]">Responsável</span>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium truncate max-w-[15ch]" title={gen.responsibleName}>{gen.responsibleName || '-'}</span>
                                            <span className="font-medium text-white/30">{maskPhone(gen.responsiblePhone || '') || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => onToggleStatus(gen.id!, gen.status!)}
                                            className={`text-[9px] font-bold uppercase tracking-wider hover:underline ${gen.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`}
                                        >
                                            {gen.status === 'active' ? 'Pausar' : 'Ativar'}
                                        </button>

                                        {gen.status !== 'cancelled' && (
                                            <button
                                                onClick={() => onUpdateGenerator(gen.id!, { status: 'cancelled' })}
                                                className="text-[9px] font-bold uppercase tracking-wider hover:underline text-red-500 hover:text-red-400"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => onEditGenerator(gen)}
                                            className="size-6 rounded bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 flex items-center justify-center transition-colors"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => onDeleteGenerator(gen.id!)}
                                            className="size-6 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {generators.length === 0 && (
                    <div className="col-span-full py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-6">
                            <span className="material-symbols-outlined text-4xl">inventory_2</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Nenhum gerador encontrado</h4>
                        <p className="text-white/40 max-w-xs mx-auto text-xs">Comece adicionando novos parceiros geradores manualmente ou via prospecção inteligente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuppliersTab;
