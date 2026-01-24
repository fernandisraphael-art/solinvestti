
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
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100/50 -skew-x-12 translate-x-1/4 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            {/* Header / Hero Content */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/10 mb-8 mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Inteligência Financeira em Energia</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.9] tracking-tight text-brand-navy mb-8">
              Energia que gera <br />
              <span className="text-primary italic">patrimônio.</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-brand-slate mb-12 max-w-2xl mx-auto leading-relaxed">
              Transforme a economia gerada pelo seu consumo inteligente em ativos reais.
            </p>

            {/* Integrated Who We Are Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left mb-12">
              {/* Card 1 */}
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-2xl text-brand-navy">solar_power</span>
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Sem Obras</h3>
                <p className="text-brand-slate leading-relaxed text-sm">
                  Conectamos sua conta a usinas remotas. Sem painéis no telhado.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-2xl text-primary">trending_down</span>
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Desconto Garantido</h3>
                <p className="text-brand-slate leading-relaxed text-sm">
                  Até 20% de redução na conta de luz todos os meses.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-2xl text-green-600">savings</span>
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Patrimônio</h3>
                <p className="text-brand-slate leading-relaxed text-sm">
                  Transformamos sua economia mensal em ativos reais.
                </p>
              </div>
            </div>

            {/* CTA Buttons (Placed after explanations as requested) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-startpro px-10 py-5 text-white font-black rounded-full text-[11px] sm:text-[12px] uppercase tracking-widest flex items-center gap-3 w-full sm:w-auto text-center justify-center shadow-xl shadow-primary/20 hover:scale-105 transition-transform hover:shadow-2xl hover:shadow-primary/30">
                Sou Residencial ou Empresa
                <span className="material-symbols-outlined text-lg">person</span>
              </Link>

              <Link to="/generator-signup" className="px-10 py-5 bg-white text-brand-navy border border-slate-200 font-black rounded-full text-[11px] sm:text-[12px] uppercase tracking-widest flex items-center gap-3 w-full sm:w-auto text-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105 hover:shadow-lg">
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
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-extrabold text-white mb-8 md:mb-12 max-w-4xl mx-auto leading-tight px-4">
            Pronto para transformar sua conta de luz em um ativo financeiro?
          </h3>
          <Link to="/signup" className="btn-startpro inline-flex px-8 md:px-16 py-4 md:py-7 text-white font-black rounded-full text-sm md:text-lg uppercase tracking-widest shadow-2xl">
            Simular Agora
          </Link>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Depoimentos</h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Quem economiza, <span className="text-primary italic">recomenda.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Reduzi minha conta em quase 20% sem fazer absolutamente nada. Só me cadastrei e pronto. É genial."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-brand-navy font-bold text-lg">
                  RC
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Ricardo Costa</div>
                  <div className="text-xs text-brand-slate uppercase tracking-wider">Residencial</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Para meu escritório, a economia anual paga quase um mês de aluguel. E o melhor: sustentabilidade real."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-brand-navy font-bold text-lg">
                  AM
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Amanda Martins</div>
                  <div className="text-xs text-brand-slate uppercase tracking-wider">Empresarial</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Não é só sobre economizar, é sobre ver seu dinheiro virar patrimônio. O conceito é revolucionário."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-brand-navy font-bold text-lg">
                  FL
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Felipe Lima</div>
                  <div className="text-xs text-brand-slate uppercase tracking-wider">Investidor</div>
                </div>
              </div>
            </div>
          </div>
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
                <li><Link to="/signup" className="hover:text-primary transition-colors">Simulador IA</Link></li>
                <li><Link to="/generator-signup" className="hover:text-primary transition-colors">Para Geradoras</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-brand-navy mb-6">Institucional</h5>
              <ul className="space-y-4 text-sm text-brand-slate font-medium">
                <li><Link to="/about" className="hover:text-primary transition-colors">Quem Somos</Link></li>
                <li><span className="text-slate-400">Termos de Uso</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-brand-navy mb-6">Newsletter</h5>
              <p className="text-xs text-brand-slate mb-4">Receba insights mensais sobre energia e economia.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                  window.location.href = `mailto:mkt@solinvestti.com.br?subject=Inscrição Newsletter&body=Desejo me inscrever na newsletter: ${email}`;
                  alert('Obrigado por se inscrever! Seu cliente de e-mail será aberto para confirmar o envio.');
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="E-mail"
                  className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20 w-full"
                />
                <button type="submit" className="bg-brand-navy text-white p-2 rounded-lg hover:bg-primary transition-colors group">
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">send</span>
                </button>
              </form>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">© 2025 SOLINVESTTI Finance & Energy. Todos os direitos reservados.</p>
            <Link to="/admin-login" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-brand-navy transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
