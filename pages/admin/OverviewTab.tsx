
import React from 'react';
import { EnergyProvider } from '../../types';

interface OverviewTabProps {
    generators: EnergyProvider[];
    clients: any[];
    concessionaires: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ generators, clients, concessionaires }) => {
    const stats = [
        { label: 'Usinas Ativas', value: generators.filter(g => g.status === 'active').length, icon: 'factory', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Distribuidoras', value: concessionaires.length, icon: 'account_balance', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Total Clientes', value: clients.length, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Economia Projetada', value: 'R$ 1.2M', icon: 'payments', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                        <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-display font-black text-white">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-premium">
                    <h4 className="text-xl font-display font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">analytics</span> Desempenho Operacional
                    </h4>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {[45, 78, 56, 90, 65, 82, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-navy border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-premium">
                    <h4 className="text-xl font-display font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">history</span> Atividades Recentes
                    </h4>
                    <div className="space-y-6">
                        {[
                            { type: 'client', msg: 'Novo cliente aderiu à Usina Solar SP', time: '2 min atrás' },
                            { type: 'generator', msg: 'Usina Minas Solar foi homologada', time: '1 hora atrás' },
                            { type: 'system', msg: 'Backup do sistema concluído', time: '3 horas atrás' },
                            { type: 'client', msg: 'Fatura enviada por Ricardo Menezes', time: '5 horas atrás' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm">
                                <div className={`size-2 rounded-full ${log.type === 'client' ? 'bg-primary' : log.type === 'generator' ? 'bg-blue-400' : 'bg-white/20'}`}></div>
                                <p className="text-white/60 font-medium flex-1">{log.msg}</p>
                                <span className="text-[10px] font-bold text-white/20 uppercase">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
