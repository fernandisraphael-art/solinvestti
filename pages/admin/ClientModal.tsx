
import React, { useState, useEffect } from 'react';
import { maskPhone } from '../../lib/masks';

interface ClientModalProps {
    client: any;
    onClose: () => void;
    onSave: (id: string, updates: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
    useEffect(() => {
        console.log('ClientModal mounted with client:', client?.name);
    }, []);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        bill_value: ''
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                city: client.city || '',
                state: client.state || '',
                bill_value: String(client.bill_value || client.billValue || '')
            });
        }
    }, [client]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Prepare numeric bill value
        let billString = formData.bill_value.replace('R$', '').trim();
        if (billString.includes(',')) {
            billString = billString.replace(/\./g, '').replace(',', '.');
        }
        const cleanBill = parseFloat(billString) || 0;

        onSave(client.id, {
            ...formData,
            bill_value: cleanBill
        });
    };

    return (
        <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Editar Cliente</h3>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Informações de Contato e Faturamento</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Nome Completo</label>
                            <input
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Telefone</label>
                            <input
                                value={formData.phone}
                                onChange={e => handleChange('phone', maskPhone(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Cidade</label>
                            <input
                                value={formData.city}
                                onChange={e => handleChange('city', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Estado (UF)</label>
                            <input
                                value={formData.state}
                                onChange={e => handleChange('state', e.target.value.toUpperCase())}
                                maxLength={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:ring-2 ring-primary/20"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 block">Valor da Fatura (R$)</label>
                            <input
                                value={formData.bill_value}
                                onChange={e => handleChange('bill_value', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-primary font-black outline-none focus:ring-2 ring-primary/20"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 shrink-0 bg-white/[0.02] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-white/60 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientModal;
