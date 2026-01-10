
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const SignupFlow: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    billValue: '',
  });

  const handleNext = () => {
    onComplete(formData);
    navigate('/marketplace');
  };

  const isFormValid =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.state !== '' &&
    formData.billValue !== '' &&
    Number(formData.billValue) > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-deep flex flex-col items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-5xl bg-white dark:bg-brand-navy shadow-premium rounded-[3rem] overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-white/5">

        <div className="lg:w-4/12 bg-brand-navy p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <Logo variant="light" />
            </div>

            <div className="space-y-8">
              {[
                { s: 1, t: 'DADOS INICIAIS', d: 'Identificação e Consumo', active: true },
                { s: 2, t: 'ESCOLHA DA USINA', d: 'Filtro por região', active: false },
                { s: 3, t: 'ANÁLISE DE IA', d: 'Simulação detalhada', active: false },
                { s: 4, t: 'FINALIZAÇÃO', d: 'Fatura e Contrato', active: false }
              ].map((item) => (
                <div key={item.s} className={`flex items-start gap-4 transition-all ${item.active ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.active ? 'bg-primary text-brand-navy shadow-lg shadow-primary/20' : 'bg-white/20'}`}>
                    {item.s}
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">{item.t}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
            SEGURANÇA DE DADOS PADRÃO BANCÁRIO
          </div>
        </div>

        <div className="lg:w-8/12 p-8 lg:p-16 bg-white dark:bg-brand-navy">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
            <div className="mb-10">
              <Link to="/" className="inline-flex items-center gap-2 text-brand-slate hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Voltar ao Início
              </Link>
            </div>


            <h2 className="text-4xl font-display font-black mb-2 text-brand-navy dark:text-white">Identificação</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Informe seus dados para que nossa IA calcule seu potencial de patrimônio.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome Completo</label>
                <input
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-4 ring-primary/10 transition-all text-slate-900 dark:text-white font-bold"
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">E-mail</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none text-slate-900 dark:text-white"
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Telefone</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none text-slate-900 dark:text-white"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Estado (UF)</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none text-slate-900 dark:text-white font-bold appearance-none"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option value="SP">São Paulo</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RJ">Rio de Janeiro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Valor da Conta (R$)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white font-black"
                    placeholder="0,00"
                    value={formData.billValue}
                    onChange={e => setFormData({ ...formData, billValue: e.target.value })}
                  />
                </div>
              </div>


              <button
                disabled={!isFormValid}
                onClick={handleNext}
                className="w-full btn-startpro text-white font-black py-5 rounded-2xl shadow-premium mt-6 flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
              >
                Analisar Viabilidade <span className="material-symbols-outlined text-sm">analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;
