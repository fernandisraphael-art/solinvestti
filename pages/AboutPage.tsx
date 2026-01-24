
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans selection:bg-brand-navy selection:text-white flex flex-col lg:h-screen lg:overflow-hidden">

            {/* 1. Header Minimalista */}
            <nav className="flex-none w-full z-50 px-6 py-6 lg:px-8 flex justify-between items-center bg-transparent">
                <Link to="/">
                    <Logo variant="dark" width={140} />
                </Link>
                <div className="w-[140px] hidden lg:block"></div>
            </nav>

            {/* 2. Main Content - Grid Bimodal */}
            <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 lg:p-8 pt-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full lg:min-h-0 overflow-y-auto lg:overflow-visible">

                {/* Lado Esquerdo: Visão & Impacto */}
                <div className="lg:col-span-5 flex flex-col justify-center p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 mb-4 lg:mb-0">
                    <h2 className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-6 md:mb-10 animate-fade-in">
                        Nossa Visão
                    </h2>
                    <h1 className="text-4xl md:text-5xl xl:text-7xl font-display font-black text-brand-navy tracking-tight leading-[1] mb-8 animate-slide-up">
                        Energia é o meio.<br />
                        Finanças são o fim.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Patrimônio é o resultado.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-10 animate-slide-up-delay">
                        Somos a primeira <span className="text-brand-navy font-bold">energytech-fintech</span> do Brasil. Transformamos consumo inteligente em riqueza.
                    </p>

                    <div>
                        <Link to="/signup" className="inline-flex px-8 py-4 bg-brand-navy text-white font-black rounded-full text-xs uppercase tracking-widest hover:bg-primary transition-colors hover:scale-105 active:scale-95">
                            Iniciar Simulação
                        </Link>
                    </div>
                </div>

                {/* Lado Direito: The Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-3 gap-4 lg:h-full content-start lg:content-stretch">

                    {/* Card Superior: Manifesto */}
                    <div className="col-span-1 md:col-span-2 lg:row-span-1 bg-brand-navy rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-premium group min-h-[160px]">
                        <div className="flex-1">
                            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">Manifesto</h3>
                            <p className="text-white text-lg md:text-xl font-display font-bold leading-tight">
                                "Unimos tecnologia, inteligência de mercado e governança para permitir crescimento financeiro real."
                            </p>
                        </div>
                        <div className="hidden md:flex size-14 bg-white/10 rounded-full items-center justify-center ml-6 group-hover:rotate-12 transition-transform shrink-0">
                            <span className="material-symbols-outlined text-white text-2xl">verified</span>
                        </div>
                    </div>

                    {/* Card: De Custo para Ativo (Com Gráfico) */}
                    <div className="col-span-1 lg:row-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 relative overflow-hidden group hover:border-blue-100 transition-colors flex flex-col justify-between min-h-[300px]">

                        {/* Visual do Gráfico SVG */}
                        <div className="absolute top-0 right-0 w-full h-[60%] opacity-20 group-hover:opacity-30 transition-opacity">
                            <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,100 C40,90 60,80 100,50 C140,20 160,10 200,5" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                                <path d="M0,100 C40,90 60,80 100,50 C140,20 160,10 200,5 V100 H0 Z" fill="url(#chartGradient)" />

                                {/* Pontos de destaque animados */}
                                <circle cx="100" cy="50" r="3" className="fill-blue-600 animate-ping" />
                                <circle cx="200" cy="5" r="4" className="fill-emerald-500" />
                            </svg>
                        </div>

                        <div className="absolute top-6 right-6 p-2 bg-blue-50/50 rounded-xl backdrop-blur-sm">
                            <span className="material-symbols-outlined text-3xl text-blue-600">trending_up</span>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="size-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                            <h3 className="text-lg font-black text-brand-navy mb-2">De Custo para Ativo</h3>
                            <p className="text-slate-400 text-xs leading-relaxed max-w-[80%]">
                                Sua conta de luz deixa de ser despesa e vira investimento automático.
                            </p>
                        </div>
                    </div>

                    {/* Card: Asset Light (Vertical) */}
                    <div className="col-span-1 lg:row-span-2 flex flex-col gap-4">
                        {/* Feature 1 */}
                        <div className="flex-1 bg-white rounded-[2rem] p-5 border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow min-h-[80px]">
                            <span className="material-symbols-outlined text-2xl text-emerald-500 bg-emerald-50 p-2 rounded-lg">token</span>
                            <div>
                                <h4 className="font-bold text-brand-navy text-sm">Asset Light</h4>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Modelo Digital</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex-1 bg-white rounded-[2rem] p-5 border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow min-h-[80px]">
                            <span className="material-symbols-outlined text-2xl text-amber-500 bg-amber-50 p-2 rounded-lg">security</span>
                            <div>
                                <h4 className="font-bold text-brand-navy text-sm">Governança</h4>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Compliance Total</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex-1 bg-white rounded-[2rem] p-5 border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow min-h-[80px]">
                            <span className="material-symbols-outlined text-2xl text-purple-500 bg-purple-50 p-2 rounded-lg">analytics</span>
                            <div>
                                <h4 className="font-bold text-brand-navy text-sm">Data Driven</h4>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Inteligência de Dados</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* 3. Footer Ultra Minimalista */}
            <footer className="flex-none py-6 text-center bg-white lg:bg-transparent border-t lg:border-none border-slate-100 mt-auto">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">© 2025 Solinvestti Finance & Energy</p>
            </footer>

        </div>
    );
};

export default AboutPage;
