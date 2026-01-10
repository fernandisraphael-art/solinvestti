
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-white font-sans">
      <nav className="fixed w-full z-50 glass-nav h-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex justify-between items-center">
          <Link to="/">
            <Logo variant="dark" width={280} />
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-brand-navy font-bold text-[11px] uppercase tracking-widest px-4 hover:text-primary transition-colors">
              Entrar
            </Link>
            <Link to="/admin-login" className="hidden sm:block text-slate-300 font-bold text-[10px] uppercase tracking-widest px-4 hover:text-brand-navy transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-32 lg:pt-40 lg:pb-56 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100/50 -skew-x-12 translate-x-1/4 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/10 mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Inteligência Financeira em Energia</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-extrabold leading-[0.9] tracking-tight text-brand-navy mb-10">
              Energia que gera <br />
              <span className="text-primary italic">patrimônio.</span>
            </h1>

            <p className="text-xl md:text-2xl text-brand-slate mb-14 max-w-2xl leading-relaxed">
              Transforme a economia gerada pelo seu consumo inteligente em ativos reais. A energia deixa de ser custo e passa a ser ativo financeiro.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup" className="btn-startpro px-8 py-5 text-white font-black rounded-full text-[11px] sm:text-[12px] uppercase tracking-widest flex items-center gap-3 w-full sm:w-auto text-center justify-center shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Sou Residencial ou Empresa
                <span className="material-symbols-outlined text-lg">person</span>
              </Link>

              <Link to="/generator-signup" className="px-8 py-5 bg-white text-brand-navy border border-slate-200 font-black rounded-full text-[11px] sm:text-[12px] uppercase tracking-widest flex items-center gap-3 w-full sm:w-auto text-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105">
                Sou uma Geradora
                <span className="material-symbols-outlined text-lg">solar_power</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-brand-navy relative overflow-hidden text-center px-6">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-primary font-black text-xl mb-8">"Energia é o meio. Finanças são o fim. Patrimônio é o resultado."</h2>
          <h3 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-12 max-w-4xl mx-auto leading-tight">
            Pronto para transformar sua conta de luz em um ativo financeiro?
          </h3>
          <Link to="/signup" className="btn-startpro inline-flex px-16 py-7 text-white font-black rounded-full text-lg uppercase tracking-widest shadow-2xl">
            Simular Agora
          </Link>
        </div>
      </section>

      <footer className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            <div className="lg:col-span-1">
              <Logo variant="dark" className="mb-8" width={220} />
              <p className="text-brand-slate text-sm leading-relaxed mb-8">
                Líder em digital energy wealth management. Transformando faturas em investimentos sólidos.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-brand-navy mb-6">Plataforma</h5>
              <ul className="space-y-4 text-sm text-brand-slate font-medium">
                <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Simulador IA</Link></li>
                <li><Link to="/generator-signup" className="hover:text-primary transition-colors">Para Geradoras</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-brand-navy mb-6">Institucional</h5>
              <ul className="space-y-4 text-sm text-brand-slate font-medium">
                <li><span className="text-slate-400">Quem Somos</span></li>
                <li><span className="text-slate-400">Termos de Uso</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-brand-navy mb-6">Newsletter</h5>
              <p className="text-xs text-brand-slate mb-4">Receba insights mensais sobre energia e economia.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="E-mail" className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20 w-full" />
                <button className="bg-brand-navy text-white p-2 rounded-lg"><span className="material-symbols-outlined text-[20px]">send</span></button>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">© 2024 SOLINVESTTI Finance & Energy. Todos os direitos reservados.</p>
            <Link to="/admin-login" className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-brand-navy transition-colors">
              Acesso Administrativo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
