
import React from 'react';
import { Concessionaire } from '../../types';

interface ConcessionairesTabProps {
    concessionaires: Concessionaire[];
    onEdit: (conc: Concessionaire) => void;
    onAdd: () => void;
}

const ConcessionairesTab: React.FC<ConcessionairesTabProps> = ({ concessionaires, onEdit, onAdd }) => {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">Registro de Distribuidoras</h3>
                    <p className="text-white/40 text-sm">Gerenciamento de áreas de atuação e taxas locais.</p>
                </div>
                <button onClick={onAdd} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span> Nova Distribuidora
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {concessionaires.map((conc) => (
                    <div key={conc.id} className="bg-white/[0.03] border border-white/10 p-8 rounded-[3rem] hover:bg-white/5 transition-all group overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">account_balance</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold leading-tight uppercase tracking-tight">{conc.name}</h4>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{conc.region}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                {conc.status}
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">
                                <span>Responsável</span>
                                <span className="text-white/60">{conc.responsible}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">
                                <span>Contato</span>
                                <span className="text-white/60">{conc.contact}</span>
                            </div>
                        </div>

                        <button onClick={() => onEdit(conc)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all">
                            Configurar Ativos
                        </button>
                    </div>
                ))}

                {concessionaires.length === 0 && (
                    <div className="col-span-full py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-6">
                            <span className="material-symbols-outlined text-4xl">account_balance</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Sem distribuidoras cadastradas</h4>
                        <p className="text-white/40 max-w-xs mx-auto text-xs">Crie novas distribuidoras para gerenciar geradores por área de atuação.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcessionairesTab;
