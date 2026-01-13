
import React from 'react';

interface ProspectorTabProps {
    isSearching: boolean;
    searchCity: string;
    setSearchCity: (city: string) => void;
    onSearch: () => void;
    candidateSuppliers: any[];
    onAddCandidate: (candidate: any) => void;
    onRejectCandidate: (candidate: any) => void;
}

const ProspectorTab: React.FC<ProspectorTabProps> = ({
    isSearching,
    searchCity,
    setSearchCity,
    onSearch,
    candidateSuppliers,
    onAddCandidate,
    onRejectCandidate
}) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="bg-white/5 border border-white/10 p-10 lg:p-16 rounded-[4rem] text-center max-w-4xl mx-auto shadow-premium overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>

                <div className="relative z-10">
                    <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-pulse">
                        <span className="material-symbols-outlined text-5xl">travel_explore</span>
                    </div>
                    <h3 className="text-4xl font-display font-black text-white mb-4 uppercase tracking-tight">Expansão de Rede com IA</h3>
                    <p className="text-white/40 text-lg mb-12 font-medium max-w-2xl mx-auto">Nossa inteligência artificial mapeia novas usinas e cooperativas em tempo real integrando fontes públicas e privadas.</p>

                    <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-brand-navy p-3 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-white/20">location_on</span>
                            <input
                                type="text"
                                placeholder="Qual cidade deseja prospectar?"
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="w-full bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 text-white font-bold outline-none placeholder:text-white/10"
                            />
                        </div>
                        <button
                            onClick={onSearch}
                            disabled={isSearching || !searchCity}
                            className="px-10 py-5 bg-primary text-brand-navy rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                            {isSearching ? <div className="size-4 border-2 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">rocket_launch</span>}
                            {isSearching ? 'Buscando...' : 'Iniciar Prospecção'}
                        </button>
                    </div>
                </div>
            </div>

            {candidateSuppliers.length > 0 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">new_releases</span> Resultados Encontrados ({candidateSuppliers.length})
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {candidateSuppliers.map((candidate, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:bg-white/10 transition-all flex flex-col group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
                                </div>

                                <div className="mb-6">
                                    <h5 className="text-xl font-black text-white leading-tight mb-2 pr-12">{candidate.nome}</h5>
                                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                        {candidate.localizacao}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Potencial de Produção</p>
                                        <p className="text-sm font-bold text-white/80">{candidate.capacidade || 'Não informada'}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Contato Identificado</p>
                                        <p className="text-sm font-bold text-white/80 line-clamp-1">{candidate.contato || 'Via Site Oficial'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => onAddCandidate(candidate)} className="flex-1 bg-white text-brand-navy py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">add_circle</span> Homologar
                                    </button>
                                    <button onClick={() => onRejectCandidate(candidate)} className="size-14 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProspectorTab;
