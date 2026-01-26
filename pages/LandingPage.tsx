
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Economia Inteligente</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-brand-navy mb-6">
              Economize até 20% na conta de luz <span className="text-primary italic">sem instalar nada.</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-brand-slate mb-8 max-w-2xl mx-auto leading-relaxed">
              Conectamos sua conta a usinas solares remotas e transformamos a economia em oportunidades financeiras.
            </p>

            {/* Key Benefits List */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 text-sm font-bold text-brand-navy">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Sem obras
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                100% legal (Geração Distribuída – ANEEL)
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Sem investimento inicial
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/signup" className="btn-startpro group px-8 py-4 text-white rounded-full flex items-center gap-4 w-full sm:w-auto text-left justify-between shadow-xl shadow-primary/20 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-primary/30">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Residência ou Empresa</span>
                  <span className="text-sm font-black">Começar a economizar</span>
                </div>
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>

              <Link to="/generator-signup" className="group px-8 py-4 bg-white text-brand-navy border border-slate-200 rounded-full flex items-center gap-4 w-full sm:w-auto text-left justify-between hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Sou Geradora</span>
                  <span className="text-sm font-black">Maximizar retorno</span>
                </div>
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">bolt</span>
              </Link>
            </div>

            {/* How It Works Section */}
            <div className="text-left mb-12">
              <h2 className="text-2xl font-bold text-brand-navy mb-8 text-center">Como funciona na prática</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-10"></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 z-10">
                    <span className="material-symbols-outlined text-4xl text-primary">solar_power</span>
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">Conexão Digital</h3>
                  <p className="text-sm text-brand-slate leading-relaxed">
                    A Solinvestti conecta sua conta a uma usina solar remota.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 z-10">
                    <span className="material-symbols-outlined text-4xl text-brand-navy">handshake</span>
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">Geradora</h3>
                  <p className="text-sm text-brand-slate leading-relaxed">
                    Contrato direto com a geradora, 100% digital e sem burocracia.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 z-10">
                    <span className="material-symbols-outlined text-4xl text-green-500">trending_down</span>
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">Redução Garantida</h3>
                  <p className="text-sm text-brand-slate leading-relaxed">
                    Sua conta reduzirá conforme o plano escolhido.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 z-10">
                    <span className="material-symbols-outlined text-4xl text-amber-500">account_balance_wallet</span>
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">Investimento</h3>
                  <p className="text-sm text-brand-slate leading-relaxed">
                    A economia pode ser direcionada para ativos financeiros.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-navy relative overflow-hidden text-center px-6">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-primary font-black text-xl mb-8">"Energia é o meio. Finanças são o fim. Patrimônio é o resultado."</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white mb-8 md:mb-12 max-w-4xl mx-auto leading-tight px-4">
            Pronto para transformar sua conta de luz em um ativo financeiro?
          </h3>
          <Link to="/signup" className="btn-startpro inline-flex px-8 md:px-16 py-4 md:py-6 text-white font-black rounded-full text-sm md:text-lg uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">
            Simular Minha Economia
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
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Reduzi minha conta em quase 20% sem fazer absolutamente nada. Só me cadastrei e pronto. É genial."
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-brand-navy font-bold text-lg shrink-0">
                  RC
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Ricardo Costa</div>
                  <div className="text-xs text-brand-slate">Campinas, SP</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">R$ 450/mês</span>
                    <span className="text-[10px] bg-brand-navy/5 text-brand-navy px-2 py-0.5 rounded-full font-bold">-18%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Para meu escritório, a economia anual paga quase um mês de aluguel. E o melhor: sustentabilidade real."
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-brand-navy font-bold text-lg shrink-0">
                  AM
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Amanda Martins</div>
                  <div className="text-xs text-brand-slate">São Paulo, SP</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">R$ 2.100/mês</span>
                    <span className="text-[10px] bg-brand-navy/5 text-brand-navy px-2 py-0.5 rounded-full font-bold">-20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
                <span className="material-symbols-outlined material-symbols-filled text-lg text-amber-400">star</span>
              </div>
              <p className="text-brand-slate text-lg mb-8 leading-relaxed italic">
                "Não é só sobre economizar, é sobre ver seu dinheiro virar patrimônio. O conceito é revolucionário."
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-brand-navy font-bold text-lg shrink-0">
                  FL
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Felipe Lima</div>
                  <div className="text-xs text-brand-slate">Belo Horizonte, MG</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Investidor</span>
                    <span className="text-[10px] bg-brand-navy/5 text-brand-navy px-2 py-0.5 rounded-full font-bold">Dividendos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-brand-navy mb-4">Dúvidas Frequentes</h2>
            <p className="text-brand-slate">Entenda como a Solinvestti simplifica sua vida.</p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Isso é legal?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Sim, 100% legal. Operamos sob a Lei 14.300/2022 que regulamenta a Geração Distribuída no Brasil. É um direito seu gerar sua própria energia ou aderir a um consórcio de energia solar.
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Posso assinar na minha casa e na minha empresa?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Sim! As assinaturas serão analisadas separadamente, mas você pode contratar nossos serviços tanto como Pessoa Física quanto como Pessoa Jurídica.
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Preciso fazer alguma obra ou instalação de placas solares?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Não. Ao assinar conosco, você não precisa se preocupar com obras, instalações ou manutenção. A usina parceira produz a energia e nós conectamos os créditos à sua conta.
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>A distribuidora (ex: CEMIG, CPFL) está de acordo com isso?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Sim. Todas as distribuidoras atendem ao regramento estabelecido pela Agência Nacional de Energia Elétrica (ANEEL) que regulamentou a geração distribuída.
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Começo a economizar assim que assinar?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Após a assinatura, a distribuidora tem um prazo regulamentar (geralmente até 90 dias) para fazer a ativação dos créditos na sua conta. Durante esse período, você paga sua conta normalmente.
              </div>
            </details>

            {/* FAQ Item 6 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Na falta de energia elétrica quem devo procurar?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                A distribuidora local. Ela continua sendo responsável pela entrega da energia através dos fios e postes. Se faltar luz, é com ela que você deve falar.
              </div>
            </details>

            {/* FAQ Item 7 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Tenho que pagar alguma coisa para virar cliente?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Não! Não há taxa de adesão, investimento ou mensalidade extra. Você paga apenas pela energia que consumir, mas com desconto garantido.
              </div>
            </details>

            {/* FAQ Item 8 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>Tem fidelidade? Se eu quiser sair, consigo?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Acreditamos na liberdade. Nossos planos residenciais não possuem fidelidade. Você pode cancelar a qualquer momento, bastando um aviso prévio para desconectarmos sua unidade.
              </div>
            </details>

            {/* FAQ Item 9 */}
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                <span>E se a economia não acontecer?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                Garantimos a economia em contrato. Se por algum motivo a usina gerar menos que o previsto, você simplesmente paga a diferença para a concessionária, sem prejuízo financeiro.
              </div>
            </details>
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
