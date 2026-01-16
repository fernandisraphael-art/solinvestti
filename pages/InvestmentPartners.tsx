
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const PARTNERS = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // XP
    name: 'XP Investimentos',
    tagline: 'A maior corretora do Brasil',
    description: 'Acesse fundos exclusivos de infraestrutura e energia com a solidez da XP.',
    color: 'from-amber-400 to-amber-600',
    logo: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000', // BTG
    name: 'BTG Pactual',
    tagline: 'O maior banco de investimentos da AL',
    description: 'Expertise em ativos reais e gestão de patrimônio focada em resultados.',
    color: 'from-blue-800 to-blue-950',
    logo: 'https://images.unsplash.com/photo-1550565118-3d1428df7301?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Genial
    name: 'Genial Investimentos',
    tagline: 'Sua vida financeira levada a sério',
    description: 'Plataforma intuitiva e taxas competitivas para pequenos e grandes investidores.',
    color: 'from-cyan-400 to-blue-500',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 'ad6960d7-756d-498c-8438-2d88688487e8', // TSR
    name: 'TSR Investimentos',
    tagline: 'Soluções financeiras de alta performance',
    description: 'Acesse estratégias profissionais e potencialize seus ganhos com a TSR.',
    color: 'from-blue-600 to-indigo-700',
    logo: '/logos/tsr.png'
  }
];

const InvestmentPartners: React.FC<{ userData: any; onSelect: (data: any) => void }> = ({ userData, onSelect }) => {
  const navigate = useNavigate();

  const handlePartnerSelect = (partner: any) => {
    onSelect({ investmentPartner: partner });
    navigate('/investment-simulation');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] font-inter">
      {/* Header Fixo */}
      <nav className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo variant="dark" width={180} />
          </div>
          <button
            onClick={() => navigate('/savings')}
            className="text-slate-500 hover:text-primary font-bold text-xs uppercase flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar à Economia
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            Potencialize sua Riqueza
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">Onde investir sua economia?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Escolha um de nossos parceiros homologados para abrir sua conta e começar a ver seu lucro de energia trabalhar para você com a Solinvestti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity`}></div>

              {/* Logo Placeholder */}
              <div className={`size-20 rounded-3xl bg-gradient-to-br ${partner.color} mb-6 flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-black/40 p-1`}>
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center font-black text-slate-900 text-xl tracking-tighter overflow-hidden">
                  {partner.logo.startsWith('/') ? (
                    <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    partner.name.split(' ')[0]
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{partner.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-r ${partner.color}`}>
                {partner.tagline}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                {partner.description}
              </p>

              <button
                onClick={() => handlePartnerSelect(partner)}
                className={`mt-auto w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r ${partner.color} shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2`}
              >
                Selecionar <span className="material-symbols-outlined text-sm">trending_up</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-slate-900 dark:bg-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-1">Prefere decidir depois?</h4>
            <p className="text-slate-400 text-sm italic">Você pode finalizar sua adesão à usina agora e escolher um parceiro a qualquer momento pelo app Solinvestti.</p>
          </div>
          <button
            onClick={() => navigate('/finalize')}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition-colors whitespace-nowrap"
          >
            Apenas Finalizar Cadastro
          </button>
        </div>
      </main>
    </div>
  );
};

export default InvestmentPartners;
