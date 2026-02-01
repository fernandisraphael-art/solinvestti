import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ClientsTabProps {
    clients: any[];
    onEditClient: (client: any) => void;
    onDeleteClient: (id: string) => void;
    onApproveClient: (id: string) => void;
    onUpdateClient: (id: string, updates: any) => void;
    onActivateAll: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ clients, onEditClient, onDeleteClient, onApproveClient, onUpdateClient, onActivateAll, onExportExcel, onExportPDF }) => {
    const [viewingBill, setViewingBill] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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


    const formatCurrency = (value: any) => {
        // Handle values that might come as strings from DB or manual input
        const num = typeof value === 'string' ? parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.')) : value;
        return (num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            case 'pending':
                return 'Aguardando';
            default:
                return status;
        }
    };

    const handleDownloadBill = (billUrl: string, clientName: string) => {
        const url = getBillUrl(billUrl);
        window.open(url, '_blank');
    };


    const getBillUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const { data } = supabase.storage.from('documents').getPublicUrl(path);
        return data.publicUrl;
    };



    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };

        if (isExportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-[#020617] p-3 rounded-2xl border border-white/5">

            <div className="flex flex-col md:flex-row justify-end items-center gap-6">
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="px-5 py-2.5 bg-[#0c112b] border border-white/5 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">download</span> Exportar
                    </button>

                    {isExportMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-[#0c112b] border border-white/10 rounded-xl p-2 flex flex-col w-40 shadow-2xl z-50">
                            <button onClick={() => { onExportExcel(); setIsExportMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                <span className="material-symbols-outlined text-green-500 text-sm">table_view</span> Excel (.xlsx)
                            </button>
                            <button onClick={() => { onExportPDF(); setIsExportMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-lg text-left text-xs font-bold text-white transition-colors">
                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span> PDF
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (window.confirm('Deseja ativar todos os clientes que estão com cadastro pendente?')) {
                            onActivateAll();
                        }
                    }}
                    className="px-6 py-3 bg-primary text-brand-navy rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-sm">task_alt</span>
                    Ativar Todos Pendentes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {clients.map((client) => (
                    <div key={client.id} className="bg-[#0c112b] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] transition-all flex flex-col lg:flex-row lg:items-center gap-8 group overflow-hidden relative shadow-xl">
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
                                <p className="text-xs font-bold text-primary">R$ {formatCurrency(client.bill_value || client.billValue)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Usina Escolhida</p>
                                <p className="text-xs font-bold text-blue-400 truncate max-w-[12ch]" title={client.generatorName}>{client.generatorName || 'Não selecionada'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Adesão</p>
                                <p className="text-xs font-bold text-white/80">{client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : client.date}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Status</p>
                                <div className="flex items-center gap-2">
                                    {client.bill_url && (
                                        <button
                                            onClick={() => setViewingBill(client.bill_url)}
                                            className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all group/bill"
                                            title="Ver Fatura"
                                        >
                                            <span className="material-symbols-outlined text-base group-hover/bill:scale-110 transition-transform">receipt_long</span>
                                        </button>
                                    )}
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusStyle(client.status)}`}>
                                        {getStatusLabel(client.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:w-auto justify-end flex-wrap">

                            {/* Toggle Status Button (Activate/Pause) */}
                            <button
                                onClick={() => onUpdateClient(client.id, { status: client.status === 'active' || client.status === 'approved' ? 'pending_approval' : 'approved' })}
                                className={`size-12 rounded-2xl flex items-center justify-center transition-all group/btn ${client.status === 'active' || client.status === 'approved'
                                    ? 'bg-amber-500/10 text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/20'
                                    }`}
                                title={client.status === 'active' || client.status === 'approved' ? 'Pausar Cliente' : 'Ativar Cliente'}
                            >
                                <span className="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">
                                    {client.status === 'active' || client.status === 'approved' ? 'pause_circle' : 'play_circle'}
                                </span>
                            </button>

                            {/* Edit Button */}
                            <button
                                onClick={() => {
                                    console.log('Edit button clicked for client:', client.name);
                                    onEditClient(client);
                                }}
                                className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group/btn"
                                title="Editar"
                            >
                                <span className="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={async () => {
                                    if (window.confirm('Tem certeza que deseja excluir este cliente?\nEsta ação é irreversível.')) {
                                        setDeletingId(client.id);
                                        try {
                                            await onDeleteClient(client.id);
                                        } finally {
                                            setDeletingId(null);
                                        }
                                    }
                                }}
                                disabled={deletingId === client.id}
                                className={`size-12 rounded-2xl flex items-center justify-center transition-all group/btn ${deletingId === client.id ? 'bg-red-500/20 text-red-400 cursor-not-allowed' : 'bg-white/5 text-red-400/30 hover:text-red-400 hover:bg-red-400/10'}`}
                                title="Excluir"
                            >
                                {deletingId === client.id ? (
                                    <div className="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-sm group-hover/btn:rotate-12 transition-transform">delete</span>
                                )}
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
                    <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl h-[85vh] rounded-[3.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-display font-black text-white flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">description</span>
                                    </div>
                                    Fatura de Energia
                                </h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1 ml-14">Documento de Comprovação de Consumo</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDownloadBill(viewingBill, 'fatura')}
                                    className="px-8 py-4 bg-primary text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Baixar Arquivo
                                </button>
                                <button
                                    onClick={() => setViewingBill(null)}
                                    className="size-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group"
                                >
                                    <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden relative group/viewer shadow-inner">
                            {(() => {
                                const url = getBillUrl(viewingBill);
                                console.log('Bill URL:', url, 'Original:', viewingBill);

                                // Remove query string for extension checking
                                const urlWithoutQuery = url.split('?')[0].toLowerCase();

                                // Check for image types
                                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
                                const isImage = url.startsWith('data:image') ||
                                    imageExtensions.some(ext => urlWithoutQuery.endsWith(ext)) ||
                                    url.includes('placeholder.com'); // Common image placeholder service

                                // Check for PDF type
                                const isPdf = url.startsWith('data:application/pdf') ||
                                    urlWithoutQuery.endsWith('.pdf');

                                if (isImage) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center p-4 bg-white/5">
                                            <img
                                                src={url}
                                                alt="Fatura de Energia"
                                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                                onError={(e) => {
                                                    console.error('Image failed to load:', url);
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>';
                                                }}
                                            />
                                        </div>
                                    );
                                } else if (isPdf) {
                                    return (
                                        <iframe
                                            src={url}
                                            className="w-full h-full bg-white rounded-xl"
                                            title="Fatura PDF"
                                        />
                                    );
                                } else {
                                    // Unknown type - try to display as image first, fallback to download prompt
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white/5">
                                            <img
                                                src={url}
                                                alt="Documento"
                                                className="max-w-full max-h-[70%] object-contain rounded-xl shadow-2xl mb-4"
                                                onError={(e) => {
                                                    // If image fails, show fallback UI
                                                    const parent = (e.target as HTMLImageElement).parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="text-center text-white/20">
                                                                <span class="material-symbols-outlined text-8xl mb-6 block opacity-20">dock_to_bottom</span>
                                                                <p class="text-sm font-black uppercase tracking-widest">Visualização indisponível</p>
                                                                <p class="text-[10px] opacity-40 mt-2">Clique em "Baixar Arquivo" para visualizar</p>
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsTab;
