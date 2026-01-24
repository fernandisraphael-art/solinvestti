
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const PARTNERS = [
  {
    id: 'xp',
    name: 'XP Investimentos',
    tagline: 'Maior corretora do Brasil',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    tagline: 'Maior banco de investimentos',
    color: 'from-blue-800 to-blue-950',
  },
  {
    id: 'genial',
    name: 'Genial Investimentos',
    tagline: 'Taxas competitivas',
    color: 'from-cyan-400 to-blue-500',
  }
];

const InvestmentPartners: React.FC<{ userData: any; onSelect: (data: any) => void }> = ({ userData, onSelect }) => {
  const navigate = useNavigate();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  const handlePartnerSelect = (partner: any) => {
    setSelectedPartner(partner.id);
  };

  const handleConfirm = () => {
    const partner = PARTNERS.find(p => p.id === selectedPartner);
    if (partner) {
      onSelect({ investmentPartner: partner });
      navigate('/investment-simulation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] font-inter flex flex-col">
      {/* Header */}
      <nav className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <Logo variant="dark" width={120} />
          <button
            onClick={() => navigate('/savings')}
            className="text-slate-500 hover:text-primary font-bold text-[10px] uppercase flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar
          </button>
        </div>
      </nav>

      {/* Conteúdo Central */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
            Onde investir sua economia?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Escolha uma corretora parceira
          </p>
        </div>

        {/* Cards - Design horizontal compacto */}
        <div className="w-full max-w-2xl space-y-3 mb-6">
          {PARTNERS.map((partner) => {
            const isSelected = selectedPartner === partner.id;

            return (
              <button
                key={partner.id}
                onClick={() => handlePartnerSelect(partner)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${isSelected
                  ? 'bg-white dark:bg-slate-900 border-primary shadow-lg shadow-primary/10'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:shadow-md'
                  }`}
              >
                {/* Logo */}
                <div className={`size-12 shrink-0 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center shadow-lg p-0.5`}>
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-slate-900 text-[10px]">
                    {partner.name.split(' ')[0]}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{partner.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${partner.color}`}>
                    {partner.tagline}
                  </p>
                </div>

                {/* Selection Indicator */}
                <div className={`size-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                  ? 'bg-primary border-primary'
                  : 'border-slate-200 dark:border-slate-700'
                  }`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Botão de confirmação */}
        <button
          onClick={handleConfirm}
          disabled={!selectedPartner}
          className={`w-full max-w-2xl py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedPartner
            ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-[0.98]'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
        >
          {selectedPartner ? (
            <>Continuar com {PARTNERS.find(p => p.id === selectedPartner)?.name} <span className="material-symbols-outlined text-lg">arrow_forward</span></>
          ) : (
            'Selecione uma corretora acima'
          )}
        </button>

        {/* Link alternativo - mesma importância */}
        <button
          onClick={() => navigate('/finalize')}
          className="mt-3 w-full max-w-2xl py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
        >
          Não quero investir, prefiro ganhar agora
        </button>
      </main>
    </div>
  );
};

export default InvestmentPartners;
