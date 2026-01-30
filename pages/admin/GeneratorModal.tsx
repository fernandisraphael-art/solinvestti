
import React from 'react';
import { EnergyProvider } from '../../types';
import { maskPhone } from '../../lib/masks';

interface GeneratorModalProps {
    generator: Partial<EnergyProvider>;
    onClose: () => void;
    onSave: (data: any) => void;
    onUpdateField: (field: string, value: any) => void;
    onSmartFill?: (city: string) => Promise<void>;
}

const GeneratorModal: React.FC<GeneratorModalProps> = ({ generator, onClose, onSave, onUpdateField, onSmartFill }) => {
    return (
        <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                            {generator.id ? 'Editar Usina' : 'Novo Gerador'}
                        </h3>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Configurações Técnicas e Comerciais</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Identidade Visual</h4>
                            <div className="flex items-center gap-4">
                                <div className="relative group size-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-slate-50">
                                    {generator.logoUrl ? (
                                        <img src={generator.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
                                    )}
                                    <label className="absolute inset-0 bg-brand-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        onUpdateField('logoUrl', reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-white/50 mb-1">Logo da Usina (Exibida no Marketplace)</p>
                                    <p className="text-[9px] text-white/30">Recomendado: 500x500px (PNG/JPG)</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Identificação da Usina</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Nome Comercial</label>
                                    <input
                                        value={generator.name || ''}
                                        onChange={e => onUpdateField('name', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                        placeholder="Ex: Solar Power SP"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Razão Social</label>
                                    <input
                                        value={generator.company || ''}
                                        onChange={e => onUpdateField('company', e.target.value.toUpperCase())}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                        placeholder="Ex: Usina Solar LTDA"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Website</label>
                                    <input
                                        value={generator.website || ''}
                                        onChange={e => onUpdateField('website', e.target.value.toLowerCase())}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Localização e Região</h4>
                                {onSmartFill && (
                                    <button
                                        onClick={() => onSmartFill(generator.city || '')}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-wider border border-amber-500/20"
                                        title="Buscar usinas reais nesta cidade usando IA"
                                    >
                                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                                        Buscar via IA
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Cidade</label>
                                    <input
                                        value={generator.city || ''}
                                        onChange={e => onUpdateField('city', e.target.value.toUpperCase())}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                        placeholder="Digite e clique em Buscar..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Estado (Região)</label>
                                    <input
                                        value={generator.region || ''}
                                        onChange={e => onUpdateField('region', e.target.value.toUpperCase())}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                        placeholder="SP, MG, RJ..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Desconto (%)</label>
                            <input
                                type="number"
                                value={generator.discount ?? ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onUpdateField('discount', val === '' ? undefined : Number(val));
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Comissão (%)</label>
                            <input
                                type="number"
                                value={generator.commission ?? ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onUpdateField('commission', val === '' ? undefined : Number(val));
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Capacidade (MW)</label>
                            <input
                                type="text"
                                value={generator.capacity || ''}
                                onChange={e => onUpdateField('capacity', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-4">Responsável e Acesso</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Nome do Responsável</label>
                                    <input
                                        value={generator.responsibleName || ''}
                                        onChange={e => onUpdateField('responsibleName', e.target.value.toUpperCase())}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Telefone Comercial</label>
                                    <input
                                        value={generator.responsiblePhone || ''}
                                        onChange={e => onUpdateField('responsiblePhone', maskPhone(e.target.value))}
                                        maxLength={15}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">E-mail de Acesso</label>
                                    <input
                                        value={generator.accessEmail || ''}
                                        onChange={e => onUpdateField('accessEmail', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Senha Provisória</label>
                                    <input
                                        type="text"
                                        value={generator.accessPassword || ''}
                                        onChange={e => onUpdateField('accessPassword', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.02] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-white/60 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                    <button onClick={() => {
                        // Sanitize numeric fields to ensure 0 is saved when field is empty
                        const sanitized = {
                            ...generator,
                            discount: generator.discount ?? 0,
                            commission: generator.commission ?? 0,
                            // Ensure capacity is present (even if empty string)
                            capacity: generator.capacity ?? ''
                        };
                        onSave(sanitized);
                    }} className="px-8 py-3 bg-primary text-brand-navy rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneratorModal;
