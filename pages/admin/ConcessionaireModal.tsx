
import React, { useState, useEffect } from 'react';
import { Concessionaire } from '../../types';

interface ConcessionaireModalProps {
    concessionaire: Partial<Concessionaire> | null;
    onClose: () => void;
    onSave: (data: Partial<Concessionaire>) => void;
}

const ConcessionaireModal: React.FC<ConcessionaireModalProps> = ({ concessionaire, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Concessionaire>>({
        name: '',
        region: '',
        responsible: '',
        contact: '',
        status: 'active'
    });

    useEffect(() => {
        if (concessionaire) {
            setFormData({
                name: concessionaire.name || '',
                region: concessionaire.region || '',
                responsible: concessionaire.responsible || '',
                contact: concessionaire.contact || '',
                status: concessionaire.status || 'active',
                id: concessionaire.id
            });
        }
    }, [concessionaire]);

    const handleChange = (field: keyof Concessionaire, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.region) {
            alert('Nome e Região são obrigatórios');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                            {concessionaire?.id ? 'Editar Distribuidora' : 'Nova Distribuidora'}
                        </h3>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Gerenciamento de Rede de Distribuição
                        </p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Nome da Distribuidora</label>
                            <input
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20 placeholder:text-white/20"
                                placeholder="Ex: CEMIG, CPFL..."
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Região / Estado</label>
                            <input
                                value={formData.region}
                                onChange={e => handleChange('region', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20 placeholder:text-white/20"
                                placeholder="Ex: Minas Gerais"
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Status Operacional</label>
                            <select
                                value={formData.status}
                                onChange={e => handleChange('status', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20 [&>option]:text-brand-navy"
                            >
                                <option value="active">Ativa</option>
                                <option value="inactive">Inativa/Manutenção</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Responsável Técnico</label>
                            <input
                                value={formData.responsible}
                                onChange={e => handleChange('responsible', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20 placeholder:text-white/20"
                                placeholder="Nome do contato principal"
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Contato (Tel/Email)</label>
                            <input
                                value={formData.contact}
                                onChange={e => handleChange('contact', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20 placeholder:text-white/20"
                                placeholder="(00) 0000-0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 shrink-0 bg-white/[0.02] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-white/60 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        {concessionaire?.id ? 'Salvar Alterações' : 'Criar Distribuidora'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConcessionaireModal;
