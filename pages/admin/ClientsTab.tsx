
import React, { useState } from 'react';

interface ClientsTabProps {
    clients: any[];
    onEditClient: (client: any) => void;
    onDeleteClient: (id: string) => void;
    onApproveClient: (id: string) => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ clients, onEditClient, onDeleteClient, onApproveClient }) => {
    const [viewingBill, setViewingBill] = useState<string | null>(null);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'pending_approval':
                return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-400 border border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
            case 'approved':
                return 'Aprovado';
            case 'pending_approval':
                return 'Pendente';
            case 'rejected':
                return 'Rejeitado';
            default:
                return status;
        }
    };

    const formatCurrency = (value: number) => {
        // Ensure proper formatting - the value is already in the correct unit from DB
        return value?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00';
    };

    const handleDownloadBill = (billUrl: string, clientName: string) => {
        const link = document.createElement('a');
        link.href = billUrl;
        link.download = `fatura_${clientName.replace(/\s/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

                        <div className="grid grid-cols-2 lg:flex lg:flex-1 items-center gap-8 lg:gap-10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Localização</p>
                                <p className="text-xs font-bold text-white/80">{client.city} / {client.state}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Valor da Conta</p>
                                <p className="text-xs font-bold text-primary">R$ {formatCurrency(client.billValue)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Adesão</p>
                                <p className="text-xs font-bold text-white/80">{client.date}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Status</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusStyle(client.status)}`}>
                                    {getStatusLabel(client.status)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:w-auto justify-end flex-wrap">
                            {/* View/Download Bill Button */}
                            {client.bill_url && (
                                <button
                                    onClick={() => setViewingBill(client.bill_url)}
                                    className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/20 transition-all group/btn"
                                    title="Ver Fatura"
                                >
                                    <span className="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">receipt_long</span>
                                </button>
                            )}

                            {/* Approve Button - only show if pending */}
                            {client.status === 'pending_approval' && (
                                <button
                                    onClick={() => onApproveClient(client.id)}
                                    className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/20 transition-all group/btn"
                                    title="Aprovar Cadastro"
                                >
                                    <span className="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">check_circle</span>
                                </button>
                            )}

                            {/* Edit Button */}
                            <button
                                onClick={() => onEditClient(client)}
                                className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group/btn"
                                title="Editar"
                            >
                                <span className="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={() => onDeleteClient(client.id)}
                                className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-red-400/30 hover:text-red-400 hover:bg-red-400/10 transition-all group/btn"
                                title="Excluir"
                            >
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

            {/* Bill Viewer Modal */}
            {viewingBill && (
                <div className="fixed inset-0 bg-brand-deep/90 backdrop-blur-xl z-[70] flex items-center justify-center p-6">
                    <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl h-[80vh] rounded-[3rem] p-8 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Fatura de Energia
                            </h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDownloadBill(viewingBill, 'cliente')}
                                    className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Baixar
                                </button>
                                <button
                                    onClick={() => setViewingBill(null)}
                                    className="size-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-white rounded-2xl overflow-hidden">
                            {viewingBill.startsWith('data:image') ? (
                                <img src={viewingBill} alt="Fatura" className="w-full h-full object-contain" />
                            ) : viewingBill.startsWith('data:application/pdf') || viewingBill.includes('.pdf') ? (
                                <iframe src={viewingBill} className="w-full h-full" title="Fatura PDF" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-6xl mb-4 block">description</span>
                                        <p className="text-sm">Clique em "Baixar" para ver o arquivo</p>
                                        <a href={viewingBill} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm mt-2 block">
                                            Abrir em nova aba
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsTab;
