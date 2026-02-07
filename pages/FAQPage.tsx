
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const FAQPage: React.FC = () => {
    return (
        <div className="flex flex-col w-full bg-white font-sans min-h-screen">
            <nav className="fixed w-full z-50 glass-nav h-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex justify-between items-center">
                    <Link to="/">
                        <Logo variant="dark" width={280} />
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-brand-navy font-bold text-[11px] uppercase tracking-widest px-4 hover:text-primary transition-colors">
                            Voltar ao Início
                        </Link>
                        <Link to="/auth" className="text-brand-navy font-bold text-[11px] uppercase tracking-widest px-4 hover:text-primary transition-colors">
                            Entrar
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-12 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mb-6">Central de Ajuda</h1>
                    <p className="text-lg text-brand-slate max-w-2xl mx-auto">
                        Encontre respostas para as principais dúvidas sobre nossa plataforma e serviços.
                    </p>
                </div>
            </div>

            {/* FAQ Section - Reused from LandingPage */}
            <section className="py-12 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="space-y-4">
                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer" open>
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Isso é legal?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Sim, 100% legal. Operamos sob a Lei 14.300/2022 que regulamenta a Geração Distribuída no Brasil. É um direito seu gerar sua própria energia ou aderir a um consórcio de energia solar.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Posso assinar na minha casa e na minha empresa?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Sim! As assinaturas serão analisadas separadamente, mas você pode contratar nossos serviços tanto como Pessoa Física quanto como Pessoa Jurídica.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Preciso fazer alguma obra ou instalação de placas solares?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Não. Ao assinar conosco, você não precisa se preocupar com obras, instalações ou manutenção. A usina parceira produz a energia e nós conectamos os créditos à sua conta.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>A distribuidora (ex: CEMIG, CPFL) está de acordo com isso?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Sim. Todas as distribuidoras atendem ao regramento estabelecido pela Agência Nacional de Energia Elétrica (ANEEL) que regulamentou a geração distribuída.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Começo a economizar assim que assinar?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Após a assinatura, a distribuidora tem um prazo regulamentar (geralmente até 90 dias) para fazer a ativação dos créditos na sua conta. Durante esse período, você paga sua conta normalmente.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Na falta de energia elétrica quem devo procurar?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                A distribuidora local. Ela continua sendo responsável pela entrega da energia através dos fios e postes. Se faltar luz, é com ela que você deve falar.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Tenho que pagar alguma coisa para virar cliente?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Não! Não há taxa de adesão, investimento ou mensalidade extra. Você paga apenas pela energia que consumir, mas com desconto garantido.
                            </div>
                        </details>

                        <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
                            <summary className="flex justify-between items-center font-bold text-brand-navy list-none">
                                <span>Tem fidelidade? Se eu quiser sair, consigo?</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="mt-4 text-brand-slate text-sm leading-relaxed">
                                Acreditamos na liberdade. Nossos planos residenciais não possuem fidelidade. Você pode cancelar a qualquer momento, bastando um aviso prévio para desconectarmos sua unidade.
                            </div>
                        </details>

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

            <footer className="bg-white py-12 border-t border-slate-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">© 2025 SOLINVESTTI Finance & Energy. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQPage;
