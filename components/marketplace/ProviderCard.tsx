
import React from 'react';
import { EnergyProvider } from '../../types';

interface ProviderCardProps {
    provider: EnergyProvider;
    index: number;
    currentBill: number;
    onSelect: (provider: EnergyProvider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, index, currentBill, onSelect }) => {
    const savings = currentBill * (provider.discount / 100);
    const isTop = index === 0;

    return (
        <div
            className={`bg-white rounded-[2.5rem] border group transition-all duration-300 hover:shadow-2xl hover:border-primary/30 ${isTop ? 'border-primary/20 ring-1 ring-primary/5' : 'border-slate-100'}`}
        >
            <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8 md:w-1/3">
                    <div className={`text-4xl font-display font-black w-14 text-center ${isTop ? 'text-primary' : 'text-slate-100'}`}>
                        {index + 1}
                    </div>

                    <div className={`size-20 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white shadow-xl bg-gradient-to-br ${provider.color}`}>
                        {provider.name[0]}
                    </div>

                    <div>
                        <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-primary transition-colors">{provider.name}</h3>
                        <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mt-1">{provider.region}</p>
                    </div>
                </div>

                <div className="flex flex-col md:items-center md:w-1/3 border-y md:border-y-0 md:border-x border-slate-50 py-6 md:py-0">
                    <p className="text-[10px] text-brand-slate font-black uppercase tracking-widest mb-2">Desconto / ROI</p>
                    <div className="text-center">
                        <span className="text-3xl font-display font-extrabold text-primary">-{provider.discount}%</span>
                        {currentBill > 0 && (
                            <p className="text-[11px] font-bold text-brand-navy mt-1">Economia: R$ {savings.toLocaleString('pt-BR')}</p>
                        )}
                    </div>
                </div>

                <div className="md:w-1/3 flex justify-end">
                    <button
                        onClick={() => onSelect(provider)}
                        className={`px-12 py-5 rounded-full font-black text-[12px] uppercase tracking-widest transition-all ${isTop ? 'btn-startpro text-white' : 'bg-slate-50 text-brand-navy hover:bg-slate-100'}`}
                    >
                        Selecionar Usina
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProviderCard;
