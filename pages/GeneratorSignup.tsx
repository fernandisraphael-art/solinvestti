
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface GeneratorSignupProps {
  onComplete: (data: any) => void;
}

const GeneratorSignup: React.FC<GeneratorSignupProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Responsável
    contactName: '',
    contactPhone: '',
    // Empresa & Acesso
    socialName: '',
    cnpj: '',
    cep: '',
    address: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    // Operacional
    energyCapacity: '',
    locationState: '',
    locationCity: '',
  });

  // Busca automática de CEP
  useEffect(() => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const fetchAddress = async () => {
        setIsLoadingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              address: `${data.logradouro}, ${data.bairro}`,
              locationState: data.uf,
              locationCity: data.localidade
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        } finally {
          setIsLoadingCep(false);
        }
      };
      fetchAddress();
    }
  }, [formData.cep]);

  // Ensure Location is filled when entering Step 3 if CEP provided
  useEffect(() => {
    if (step === 3 && !formData.locationState && formData.cep) {
      const cleanCep = formData.cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        // Retry fetch for location data specifically
        fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) {
              setFormData(prev => ({
                ...prev,
                locationState: data.uf,
                locationCity: data.localidade
              }));
            }
          })
          .catch(err => console.error("Retry fetch failed", err));
      }
    }
  }, [step]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.email !== formData.confirmEmail) {
        throw new Error('Os e-mails informados não coincidem.');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas informadas não coincidem.');
      }

      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao iniciar cadastro. Tente novamente.");
      }

      if (authData.user) {
        // 2. Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.contactName,
            role: UserRole.GENERATOR
          });

        if (profileError) throw profileError;

        const { error: genError } = await supabase.rpc('create_generator_registry', {
          p_user_id: authData.user.id,
          p_name: formData.socialName,
          p_region: `${formData.locationCity} / ${formData.locationState}`,
          p_responsible_name: formData.contactName,
          p_responsible_phone: formData.contactPhone,
          p_capacity: Number(formData.energyCapacity),
          p_email: formData.email,
          p_password: formData.password
        });

        if (genError) throw genError;

        // 4. Force auto-login callback and redirect
        // As requested: bypass email validation check on frontend and proceed.
        // Note: Supabase "Confirm Email" setting must be DISABLED for session to exist.
        onComplete(formData);
        navigate('/generator');
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      alert(error.message || "Erro ao realizar cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[950px] bg-white rounded-[3rem] shadow-premium overflow-hidden flex flex-col lg:flex-row border border-slate-100">

        {/* Sidebar Informativa StartPro */}
        <div className="lg:w-5/12 bg-brand-navy p-12 text-white flex flex-col justify-between relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-16 group">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-2xl">account_balance</span>
              </div>
              <span className="font-display font-black text-xl tracking-tighter uppercase">Solinvestti</span>
            </Link>

            <h2 className="text-4xl font-display font-black leading-tight mb-8">
              Conecte sua usina ao <br />
              <span className="text-primary italic">futuro digital.</span>
            </h2>

            <div className="space-y-8">
              <div className={`flex items-start gap-4 transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-brand-navy shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}>1</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mt-1">Sua Conta</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Identificação do Responsável</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-brand-navy shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}>2</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mt-1">Dados Jurídicos</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Empresa & Acesso ao Portal</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-brand-navy shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}>3</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mt-1">Capacidade</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Operações & Localização</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-10 border-t border-white/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Parceiros Certificados</p>
            <div className="flex gap-4 opacity-30 grayscale">
              <span className="material-symbols-outlined">verified</span>
              <span className="material-symbols-outlined">security</span>
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
        </div>

        {/* Área do Formulário Dinâmico */}
        <div className="lg:w-7/12 p-10 lg:p-16 relative bg-white">
          {/* BOTÃO VOLTAR À PÁGINA INICIAL */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-slate hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Página Inicial
            </Link>
          </div>

          {isSubmitting && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center px-10">
              <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-display font-black text-brand-navy mb-2 uppercase">Validando Infraestrutura</h3>
              <p className="text-brand-slate text-sm font-medium">Estamos verificando os dados junto à nossa base de conformidade regulatória.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ETAPA 1: ESTABELECIMENTO DE CONTA */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="mb-10">
                  <h3 className="text-3xl font-display font-black text-brand-navy mb-2">Estabeleça sua Conta</h3>
                  <p className="text-brand-slate text-sm font-medium">Comece criando o seu perfil de gestor da usina.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Nome Completo do Responsável</label>
                    <input
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy transition-all"
                      placeholder="Ex: Alexandre de Souza"
                      value={formData.contactName}
                      onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Telefone Direto / WhatsApp</label>
                    <input
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy transition-all"
                      placeholder="(00) 00000-0000"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!formData.contactName || !formData.contactPhone}
                      className="w-full btn-startpro text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                      Criar sua Conta <span className="material-symbols-outlined text-sm">east</span>
                    </button>
                    <p className="text-center text-[10px] text-brand-slate font-bold uppercase mt-6 tracking-wider">
                      Já possui acesso? <Link to="/auth" className="text-primary hover:underline">Fazer Login</Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2: DADOS DA EMPRESA E ACESSO */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="mb-10">
                  <h3 className="text-3xl font-display font-black text-brand-navy mb-2">Dados da Empresa</h3>
                  <p className="text-brand-slate text-sm font-medium">Agora, vincule a sua entidade geradora e crie seus acessos.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Razão Social / Nome Fantasia</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="Ex: Usina Fotovoltaica Sol LTDA"
                        value={formData.socialName}
                        onChange={e => setFormData({ ...formData, socialName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">CNPJ</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">CEP (Busca Automática)</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="00000-000"
                        maxLength={9}
                        value={formData.cep}
                        onChange={e => setFormData({ ...formData, cep: e.target.value })}
                      />
                      {isLoadingCep && (
                        <div className="absolute right-4 bottom-4 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    {formData.address && (
                      <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[9px] font-black text-brand-slate uppercase tracking-widest mb-1">Endereço Identificado</p>
                        <p className="text-xs font-bold text-brand-navy">{formData.address} - {formData.locationCity}/{formData.locationState}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Configurar Acesso ao Portal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        required
                        type="email"
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-xs"
                        placeholder="E-mail Institucional"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                      <input
                        required
                        type="email"
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-xs"
                        placeholder="Confirmar E-mail"
                        value={formData.confirmEmail}
                        onChange={e => setFormData({ ...formData, confirmEmail: e.target.value })}
                      />
                      <input
                        required
                        type="password"
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-xs"
                        placeholder="Criar Senha"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                      <input
                        required
                        type="password"
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-xs"
                        placeholder="Confirmar Senha"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={handleBack} className="flex-1 bg-slate-100 text-brand-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Voltar</button>
                    <button type="button" onClick={handleNext} disabled={!formData.socialName || !formData.cnpj || !formData.email || !formData.password} className="flex-1 btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30">Continuar</button>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: CAPACIDADE E LOCALIZAÇÃO */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="mb-10">
                  <h3 className="text-3xl font-display font-black text-brand-navy mb-2">Capacidade Técnica</h3>
                  <p className="text-brand-slate text-sm font-medium">Informe o potencial energético e a região de operação.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Energia Disponível (MW/ano)</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                      placeholder="Ex: 50"
                      value={formData.energyCapacity}
                      onChange={e => setFormData({ ...formData, energyCapacity: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Estado (UF)</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="Ex: MG"
                        value={formData.locationState}
                        onChange={e => setFormData({ ...formData, locationState: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Cidade</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="Ex: Juiz de Fora"
                        value={formData.locationCity}
                        onChange={e => setFormData({ ...formData, locationCity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-brand-navy font-bold leading-relaxed">
                      *Ao finalizar o cadastro, sua usina passará por uma auditoria técnica de conformidade para ativação imediata no Marketplace Solinvestti.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={handleBack} className="flex-1 bg-slate-100 text-brand-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Voltar</button>
                    <button type="submit" className="flex-1 btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Finalizar Cadastro</button>
                  </div>
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default GeneratorSignup;
