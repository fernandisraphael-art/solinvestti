import React from 'react';
import { useSystem } from '../../contexts/SystemContext';

interface SettingsTabProps {
    onReset: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onReset }) => {
    const { maintenanceMode, toggleMaintenanceMode } = useSystem();

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-premium">
                    <h4 className="text-xl font-display font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">person</span> Perfil Administrativo
                    </h4>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Nome do Administrador</label>
                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" defaultValue="Master Admin" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">E-mail de Acesso</label>
                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" defaultValue="admin@solinvestti.com.br" />
                        </div>
                        <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Atualizar Perfil</button>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-premium">
                    <h4 className="text-xl font-display font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">settings_suggest</span> Preferências do Sistema
                    </h4>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-xs font-bold text-white">Modo de Manutenção</p>
                                <p className="text-[10px] text-white/40">Bloqueia todos os acessos públicos.</p>
                            </div>
                            <div
                                onClick={toggleMaintenanceMode}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                                        Inteligência Artificial (Google Gemini)
                                    </p>
                                    <p className="text-[10px] text-white/40">Necessário para Busca Inteligente.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 relative">
                                <input
                                    id="apiKeyInput"
                                    type="password"
                                    placeholder="Cole sua API Key aqui..."
                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-[10px] text-white font-mono outline-none focus:border-primary/50"
                                    defaultValue={localStorage.getItem('gemini_api_key') || ''}
                                    onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('apiKeyInput') as HTMLInputElement;
                                        if (input) {
                                            input.type = input.type === 'password' ? 'text' : 'password';
                                            const icon = document.getElementById('apiKeyIcon');
                                            if (icon) icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
                                        }
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    <span id="apiKeyIcon" className="material-symbols-outlined text-xs">visibility</span>
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={async () => {
                                        const key = localStorage.getItem('gemini_api_key');
                                        if (!key) {
                                            alert('Por favor, insira uma chave primeiro.');
                                            return;
                                        }
                                        const btn = document.getElementById('btn-validate');
                                        if (btn) {
                                            btn.innerText = 'Verificando...';
                                            btn.classList.add('opacity-50', 'cursor-not-allowed');
                                        }

                                        try {
                                            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
                                            });
                                            if (res.ok) {
                                                alert('✅ Sucesso! Chave Válida e Conectada.');
                                            } else {
                                                const err = await res.json();
                                                alert(`❌ Erro: ${err.error?.message || 'Chave Inválida'}`);
                                            }
                                        } catch (e) {
                                            alert('❌ Erro de conexão.');
                                        } finally {
                                            if (btn) {
                                                btn.innerText = 'Testar Conexão';
                                                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                                            }
                                        }
                                    }}
                                    id="btn-validate"
                                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-brand-navy transition-all"
                                >
                                    Testar Conexão
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-xs font-bold text-white">Logs de Auditoria</p>
                                <p className="text-[10px] text-white/40">Registrar todas as ações administrativas.</p>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500/80 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 size-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-[8px] font-black uppercase text-white/30 mb-4">Versão do Sistema: Solinvestti v2.0.4-STABLE</p>
                            <button onClick={onReset} className="w-full py-4 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Hard Reset Factory Settings</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-premium md:col-span-2">
                    <h4 className="text-xl font-display font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">visibility</span> Visualização e Navegação
                    </h4>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-white">Ranking de Usinas (Visão do Consumidor)</p>
                            <p className="text-[10px] text-white/40">Acesse o marketplace como se fosse um cliente para verificar a ordem e exibição.</p>
                        </div>
                        <button
                            onClick={() => window.location.hash = '#/marketplace'}
                            className="px-8 py-4 bg-white text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined">leaderboard</span> Ver Ranking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
