
import React from 'react';

interface BillInputProps {
    value: string;
    onChange: (value: string) => void;
}

const BillInput: React.FC<BillInputProps> = ({ value, onChange }) => {
    return (
        <div className="w-full lg:w-[420px] bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100">
            <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-4">Gasto Mensal Atual (Média)</label>
            <div className="relative mb-6">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">R$</span>
                <input
                    type="number"
                    className="w-full bg-slate-50 border-none rounded-2xl p-6 pl-16 text-4xl font-display font-extrabold text-brand-navy outline-none focus:ring-4 ring-primary/10"
                    placeholder="0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase italic">
                <span className="material-symbols-outlined text-[16px]">verified</span> Projeção em tempo real ativada
            </div>
        </div>
    );
};

export default BillInput;
