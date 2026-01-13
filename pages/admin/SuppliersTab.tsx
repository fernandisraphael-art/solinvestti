
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

        const relevantClients = clients.filter(c => c.supplier_id === gen.id || c.supplierId === gen.id);

        const usedMW = relevantClients.reduce((sum, c) => {
            // 1. Pega consumo em kWh (ou estima pelo valor da conta)
            const consumptionKWh = Number(c.consumption) || (Number(c.billValue) / 0.85);

            // 2. Converte kWh do cliente para MW equivalentes da usina
            const equivalentMW = consumptionKWh / KWH_PER_MW;

            return sum + (equivalentMW || 0);
        }, 0);

        return { total: totalMW, used: usedMW, remaining: totalMW - usedMW, clientCount: relevantClients.length };
    };
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const pendingCount = generators.filter(g => g.status === 'pending').length;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">Rede de Parceiros Geradores</h3>
                    <p className="text-white/40 text-sm">Gestão comercial e homologação de ativos de geração distribuída.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onProspect} className="px-6 py-3 bg-primary text-brand-navy rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
                        <span className="material-symbols-outlined text-sm mr-2">travel_explore</span> Prospecção IA
                    </button>

                    <button
                        onClick={onNewGenerator}
                        className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span> Novo Gerador
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="px-6 py-3 bg-brand-navy border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">download</span> Exportar
                        </button>

                        {isExportMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-[#0F172A] border border-white/10 rounded-xl p-2 flex flex-col w-40 shadow-2xl z-50">
                                <button onClick={onExportExcel} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                    <span className="material-symbols-outlined text-green-500 text-sm">table_view</span> Excel (.xlsx)
                                </button>
                                <button onClick={onExportPDF} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                    <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span> PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onImport}
                        className="px-6 py-3 bg-brand-navy border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">upload_file</span> Importar Planilha
                    </button>
                </div>
            </div>

            {/* Banner de Ativação em Massa (Posicionado no Topo conforme solicitado) */}
            {pendingCount > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[3rem] flex items-center justify-between animate-bounce-subtle">
                    <div className="flex items-center gap-6">
                        <div className="size-14 bg-emerald-500 rounded-full flex items-center justify-center text-brand-navy shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined font-black">done_all</span>
                        </div>
                        <div>
                            <p className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Ação em Massa Disponível</p>
                            <h4 className="text-white font-display font-black text-xl">Ativar {pendingCount} usinas pendentes?</h4>
                        </div>
                    </div>
                    <button onClick={onActivateAll} className="px-10 py-4 bg-emerald-500 text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Ativar Agora
                    </button>
                </div>
            )}

            {/* Compact Grid Layout for Generators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {generators.map((gen) => {
                    const { total, used, remaining, clientCount } = getCapacityStats(gen);
                    return (
                        <div key={gen.id} className={`bg-white/[0.03] border rounded-xl hover:border-blue-500/30 transition-colors group relative overflow-hidden ${gen.status === 'cancelled' ? 'border-red-500/20 opacity-60 hover:opacity-100' : 'border-white/10'}`}>
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
