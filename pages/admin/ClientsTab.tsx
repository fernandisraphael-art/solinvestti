
import React from 'react';

interface ClientsTabProps {
    clients: any[];
    onEditClient: (client: any) => void;
    onDeleteClient: (id: string) => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ clients, onEditClient, onDeleteClient }) => {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">Base de Clientes Disponíveis</h3>
                    <p className="text-white/40 text-sm">Monitoramento de leads, adesões e status de faturamento.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all flex flex-col lg:flex-row lg:items-center gap-10 group overflow-hidden relative">
                        <div className="flex items-center gap-6 lg:w-3/12">
                            <div className="size-16 rounded-2xl bg-brand-navy border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary/60 transition-colors">
                                <span className="material-symbols-outlined text-3xl">person</span>
                            </div>
                            <div className="max-w-[200px] overflow-hidden">
                                <h4 className="text-white font-black text-lg truncate mb-1">{client.name}</h4>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate">{client.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:flex lg:flex-1 items-center gap-8 lg:gap-14">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Localização</p>
                                <p className="text-xs font-bold text-white/80">{client.city} / {client.state}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Valor da Conta</p>
                                <p className="text-xs font-bold text-primary">R$ {client.billValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Adesão</p>
                                <p className="text-xs font-bold text-white/80">{client.date}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Status</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${client.status === 'Fatura Enviada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    {client.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:w-2/12 justify-end">
                            <button onClick={() => onEditClient(client)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group/btn">
                                <span className="material-symbols-outlined text-sm group-hover/btn:scale-110">edit</span>
                            </button>
                            <button onClick={() => onDeleteClient(client.id)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-red-400/30 hover:text-red-400 hover:bg-red-400/10 transition-all group/btn">
                                <span className="material-symbols-outlined text-sm group-hover/btn:rotate-12 transition-transform">delete</span>
                            </button>
                        </div>
                    </div>
                ))}

                {clients.length === 0 && (
                    <div className="py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-6">
                            <span className="material-symbols-outlined text-4xl">no_accounts</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Nenhum cliente registrado</h4>
                        <p className="text-white/40 max-w-xs mx-auto text-xs">Os clientes aparecerão aqui conforme concluírem o fluxo de adesão no simulador.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsTab;
