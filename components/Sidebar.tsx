import React from 'react';
import Logo from './Logo';

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    count?: number;
}

interface SidebarProps {
    userType: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    items: SidebarItem[];
    onLogout: () => void;
    logoVariant?: 'light' | 'dark';
    extraContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    userType,
    activeTab,
    onTabChange,
    items,
    onLogout,
    logoVariant = 'light',
    extraContent,
    footerContent,
    className = ""
}) => {
    const isLightLogo = logoVariant === 'light';

    return (
        <aside className={`w-72 border-r border-white/10 bg-brand-navy/60 backdrop-blur-2xl flex flex-col h-screen sticky top-0 ${className}`}>
            <div className="p-8 border-b border-white/10">
                <Logo variant={logoVariant} width={320} />
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-4 ml-1 ${isLightLogo ? 'text-primary' : 'text-brand-navy'}`}>
                    {userType}
                </p>
            </div>

            <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 ml-2">Navegação</p>

                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id
                            ? 'bg-primary text-brand-navy shadow-lg shadow-primary/20'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-left">
                            {item.label} {item.count !== undefined && `(${item.count})`}
                        </span>
                    </button>
                ))}

                {extraContent}
            </nav>

            <div className="p-6 border-t border-white/5 space-y-3">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span> Sair
                </button>
                {footerContent}
                <div className="mt-4 pt-4 border-t border-white/5 opacity-40">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary">Solinvestti v2.0.4-DEBUG</p>
                    <p className="text-[7px] font-bold text-white/50">Exclusão Diagnóstico Ativo</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
