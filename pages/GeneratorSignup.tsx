
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { maskPhone, maskCNPJ, maskCEP, normalizeText } from '../lib/masks';

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
            const street = data.logradouro || 'Bairro Identificado';
            const neighborhood = data.bairro || '';
            setFormData(prev => ({
              ...prev,
              address: `${street}${neighborhood ? `, ${neighborhood}` : ''}`,
              locationState: data.uf,
              locationCity: data.localidade
            }));
          } else {
            setFormData(prev => ({ ...prev, address: 'CEP não encontrado' }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
          setFormData(prev => ({ ...prev, address: 'Erro ao buscar endereço' }));
        } finally {
          setIsLoadingCep(false);
        }
      };
      fetchAddress();
    }
  }, [formData.cep]);

  const AddressInfo = () => {
    if (!formData.cep || formData.cep.replace(/\D/g, '').length < 8) return null;

    return (
      <div className={`md:col-span-2 p-6 rounded-3xl border-2 transition-all duration-500 mt-2 ${isLoadingCep ? 'bg-slate-50 border-slate-100 animate-pulse' : 'bg-emerald-50/30 border-emerald-500/20 shadow-sm animate-in fade-in zoom-in-95'}`}>
        <div className="flex items-start gap-4">
          <div className={`size-10 rounded-xl flex items-center justify-center ${isLoadingCep ? 'bg-slate-200' : 'bg-emerald-500/20 text-emerald-600'}`}>
            <span className="material-symbols-outlined text-lg">
              {isLoadingCep ? 'sync' : 'location_on'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-1">
              Endereço de Operação Identificado:
            </p>
            {isLoadingCep ? (
              <p className="text-xs font-bold text-brand-slate">Buscando informações...</p>
            ) : formData.address === 'CEP não encontrado' ? (
              <p className="text-xs font-black text-red-400 uppercase">Atenção: CEP Inválido ou Não Localizado</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-black text-brand-navy">
                  {formData.address || 'Logradouro não disponível'}
                </p>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  {formData.locationCity || '---'} / {formData.locationState || '--'}
                </p>
              </div>
            )}
          </div>
          {!isLoadingCep && formData.locationCity && formData.address !== 'CEP não encontrado' && (
            <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded-lg">
              <span className="material-symbols-outlined text-sm">check_circle</span>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    console.log("🚀 Iniciando submissão do formulário...", formData);
    setIsSubmitting(true);

    try {
      // 3. Create Generator Registry
      const generatorPayload = {
        name: formData.socialName,
        type: 'Solar',
        region: `${formData.locationCity} / ${formData.locationState}`,
        responsible_name: formData.contactName,
        responsible_phone: formData.contactPhone,
        capacity: Number(formData.energyCapacity),
        access_email: formData.email,
        access_password: '', // Senha vazia
        status: 'pending',
        rating: 5,
        discount: 15,
        commission: 5,
        estimated_savings: 0,
        city: formData.locationCity,
        company: formData.socialName,
        color: 'from-emerald-500 to-teal-600',
        icon: 'solar_power'
      };

      let insertError: any = null;

      // Tentativa 1: SDK
      try {
        const { error } = await supabase.from('generators').insert(generatorPayload);
        if (error) insertError = error;
      } catch (err: any) {
        insertError = err;
      }

      // Tentativa 2: Fallback direto (se houver erro no SDK)
      if (insertError) {
        console.warn('⚠️ SDK Insert falhou, tentando direct fetch...', insertError);
        try {
          // Import dinâmico ou assumindo que a função está disponível
          // Como não posso importar dinamicamente fácil aqui sem mudar topos, vou assumir import
          // Mas wait, preciso importar a função. Vou adicionar o import no topo depois.
          // Por enquanto, vou colar a lógica aqui se não conseguir importar no replace único ou usar require?
          // Não, imports devem ser no topo. Vou usar fetch direto aqui mesmo para garantir.

          const url = import.meta.env.VITE_SUPABASE_URL;
          const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

          if (!url || !key) throw new Error('Configuração ausente');

          const res = await fetch(`${url}/rest/v1/generators`, {
            method: 'POST',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(generatorPayload)
          });

          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Erro API: ${txt}`);
          }

          // Sucesso no fallback! Limpar erro
          console.log('✅ Fallback insert via fetch funcionou!');
          insertError = null;

        } catch (fallbackErr: any) {
          console.error('❌ Falha fatal no insert:', fallbackErr);
          // Manter o erro original ou o do fallback
          insertError = fallbackErr || insertError;
        }
      }

      if (insertError) {
        // Verificar duplicata real
        const isDuplicate = insertError.message?.includes('duplicate') || insertError.code === '23505';
        if (!isDuplicate) {
          throw insertError; // Lança o erro para o catch principal mostrar o alert
        }
        console.log('⚠️ Duplicata detectada (ignorado).');
      }

      // 4. Trigger Email Notification via Edge Function (FAIL-SAFE)
      try {
        console.log('📧 Tentando enviar e-mail...');
        await supabase.functions.invoke('send-registration-email', {
          body: { generator: formData }
        }).catch(() => {
          console.log('⚠️ Edge function não disponível, ignorando...');
        });
      } catch (emailErr) {
        console.error('⚠️ Falha de conexão ao tentar disparar e-mail:', emailErr);
      }

      // 5. Refresh data so admin sees the new generator immediately
      try {
        await onComplete();
      } catch (refreshErr) {
        console.warn('⚠️ Falha ao atualizar lista de geradores:', refreshErr);
      }

      // 6. Sucesso FINAL
      setIsSubmitting(false);
      setShowSuccess(true);

    } catch (error: any) {
      console.error("❌ Erro fatal no cadastro:", error);
      alert(error.message || "Erro ao realizar cadastro.");
    } finally {
      setIsSubmitting(false);
      console.log('🔚 Processo de submissão finalizado.');
    }
  };

  // Tela de Sucesso
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[500px] bg-white rounded-[3rem] shadow-premium p-12 text-center border border-slate-100">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-primary text-4xl">verified</span>
          </div>
          <h2 className="text-3xl font-display font-black text-brand-navy mb-4">
            Usina Cadastrada!
          </h2>
          <p className="text-brand-slate text-sm leading-relaxed mb-8">
            Um <span className="font-bold text-brand-navy">especialista da Solinvestti</span> entrará em contato para validação da sua geradora e ativação no nosso Marketplace.
          </p>
          <div className="bg-primary/5 rounded-2xl p-4 mb-8">
            <p className="text-xs text-primary font-bold uppercase tracking-wider">
              Aguarde nosso contato em até 48 horas úteis
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full btn-startpro py-5 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            Voltar ao Início <span className="material-symbols-outlined">home</span>
          </button>
        </div>
      </div>
    );
  }

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
                      onChange={e => setFormData({ ...formData, contactName: normalizeText(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Telefone Direto / WhatsApp</label>
                    <input
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy transition-all"
                      placeholder="(00) 00000-0000"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: maskPhone(e.target.value) })}
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
                        onChange={e => setFormData({ ...formData, socialName: normalizeText(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">CNPJ</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-sm"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={e => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
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
                        onChange={e => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                      />
                      {isLoadingCep && (
                        <div className="absolute right-4 bottom-4 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <AddressInfo />
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">E-mail para Contato</h4>
                    <input
                      required
                      type="email"
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy text-xs"
                      placeholder="E-mail Institucional"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={handleBack} className="flex-1 bg-slate-100 text-brand-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Voltar</button>
                    <button type="button" onClick={handleNext} disabled={!formData.socialName || !formData.cnpj || !formData.email} className="flex-1 btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30">Continuar</button>
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
                        onChange={e => setFormData({ ...formData, locationState: normalizeText(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-3">Cidade</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/10 font-bold text-brand-navy"
                        placeholder="Ex: Juiz de Fora"
                        value={formData.locationCity}
                        onChange={e => setFormData({ ...formData, locationCity: normalizeText(e.target.value) })}
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
