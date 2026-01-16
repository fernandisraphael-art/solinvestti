
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegistrationFinalizeProps {
  userData: any;
  onConfirm: (password?: string) => Promise<{ success: boolean; needsConfirmation: boolean } | void>;
  onFileSelect: (fileBase64: string) => void;
}

const RegistrationFinalize: React.FC<RegistrationFinalizeProps> = ({ userData, onConfirm, onFileSelect }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsEmailAuth, setNeedsEmailAuth] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isUpdate = userData.isAlreadyRegistered;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    if (!isUpdate) {
      if (!userData.energyBillFile) {
        alert("Por favor, anexe sua fatura de energia para continuar.");
        return;
      }
      // Password validation removed
    }

    setIsFinalizing(true);
    try {
      const result = await onConfirm(password);
      if (result && 'needsConfirmation' in result && result.needsConfirmation) {
        setNeedsEmailAuth(true);
      }
      setSuccess(true);
    } catch (error: any) {
      console.error("Error finalizing:", error);
      alert(`Falha ao finalizar cadastro: ${error.message || 'Erro inesperado'}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (success) {
    if (needsEmailAuth) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-8 text-center font-sans text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
          <div className="size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-8 animate-bounce">
            <span className="material-symbols-outlined text-5xl">mark_email_read</span>
          </div>
          <h2 className="text-4xl font-display font-black mb-4 text-brand-navy dark:text-white">
            Confirme sua Senha
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-12 text-lg font-medium leading-relaxed">
            Para sua segurança, enviamos um link para confirmar sua senha de acesso em <span className="text-brand-navy dark:text-white font-bold">{userData.email}</span>.
            <br className="mb-4" />
            Por favor, clique no link enviado para ativar seu acesso e entrar no portal.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-startpro text-white font-black px-16 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform uppercase text-xs tracking-widest"
          >
            Ir para Área de Login <span className="material-symbols-outlined">login</span>
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-8 text-center font-sans text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
        <div className="size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-8 animate-bounce">
          <span className="material-symbols-outlined text-5xl">verified</span>
        </div>
        <h2 className="text-3xl font-display font-black mb-4 text-brand-navy dark:text-white">
          {isUpdate ? 'Estratégia Atualizada!' : 'Cadastro Realizado com Sucesso!'}
        </h2>
        {isUpdate ? (
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-12 text-sm font-medium leading-relaxed">
            Olá {userData.name}, sua nova estratégia de rendimento com a {userData.selectedProvider?.name} já foi aplicada ao seu perfil.
          </p>
        ) : (
          <div className="max-w-2xl mb-12 space-y-6">
            <div className="bg-primary/10 rounded-2xl p-6 text-left">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">bolt</span>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy dark:text-white mb-2">Geradora de Energia</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    A <span className="font-bold text-primary">{userData.selectedProvider?.name}</span> entrará em contato assim que a conexão for liberada pela concessionária.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-navy/10 dark:bg-white/10 rounded-2xl p-6 text-left">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-brand-navy dark:text-primary text-2xl mt-1">trending_up</span>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy dark:text-white mb-2">Corretora de Investimentos</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    A <span className="font-bold text-brand-navy dark:text-white">{userData.investmentPartner?.name || 'nossa corretora parceira'}</span> fará uma análise do seu perfil e entrará em contato para montar o seu plano de investimento personalizado.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Você receberá atualizações por e-mail em <span className="font-bold">{userData.email}</span>
            </p>
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          className="btn-startpro text-white font-black px-16 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform uppercase text-xs tracking-widest"
        >
          Voltar para o Início <span className="material-symbols-outlined">home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-deep flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[680px] bg-white dark:bg-brand-navy shadow-premium rounded-[3.5rem] p-10 lg:p-16 border border-slate-100 dark:border-white/5 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <header className="text-center mb-12 relative z-10">
          <div className="size-16 rounded-[1.2rem] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8 shadow-inner-soft">
            <span className="material-symbols-outlined text-3xl">{isUpdate ? 'published_with_changes' : 'task_alt'}</span>
          </div>
          <h2 className="text-4xl font-display font-black mb-3 text-brand-navy dark:text-white">
            {isUpdate ? 'Confirmar Nova Estratégia' : 'Resumo e Finalização'}
          </h2>
          <p className="text-brand-slate dark:text-slate-400 text-sm font-medium">
            {isUpdate
              ? `Você está migrando sua alocação para a ${userData.selectedProvider?.name}.`
              : `Valide os dados da sua adesão institucional com a ${userData.selectedProvider?.name}.`
            }
          </p>
        </header>

        <div className="space-y-10 relative z-10">
          {!isUpdate && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-4 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group ${userData.energyBillFile ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-white/5 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
              <span className={`material-symbols-outlined text-5xl mb-5 block transition-transform group-hover:scale-110 ${userData.energyBillFile ? 'text-primary' : 'text-slate-300 group-hover:text-primary'}`}>
                {userData.energyBillFile ? 'task_alt' : 'upload_file'}
              </span>
              <p className="font-black text-brand-navy dark:text-white mb-1 uppercase text-[11px] tracking-widest">
                {fileName ? fileName : 'Anexar Fatura de Energia'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                {userData.energyBillFile ? 'Fatura anexada com sucesso' : 'Obrigatório para primeira homologação'}
              </p>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-white/5 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner-soft">
            <h4 className="font-black text-[11px] mb-8 text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">analytics</span> Parâmetros da Operação
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Titular</span>
                <span className="text-sm font-black text-brand-navy dark:text-white">{userData.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Planta Parceira</span>
                <span className="text-sm font-black text-primary">{userData.selectedProvider?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Manager</span>
                <span className="text-sm font-black text-brand-navy dark:text-white">{userData.investmentPartner?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Economia Líquida</span>
                <span className="text-2xl font-display font-black text-primary">R$ {(Number(userData.billValue || 0) * (userData.selectedProvider?.discount / 100 || 0.18)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Password creation removed as per legacy requirement - Admin approves first */}

          <button
            disabled={isFinalizing}
            onClick={handleFinish}
            className="w-full btn-startpro text-white font-black py-7 rounded-[2rem] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.3em]"
          >
            {isFinalizing
              ? 'Processando Solicitação...'
              : (isUpdate ? 'Confirmar Nova Alocação' : 'Confirmar e Finalizar')
            }
            <span className="material-symbols-outlined text-sm">{isUpdate ? 'sync_saved_locally' : 'verified'}</span>
          </button>
        </div>
      </div>

      <p className="mt-12 text-[10px] text-brand-slate/40 font-black uppercase tracking-[0.3em] flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">verified_user</span>
        Ambiente de Segurança Nível 4 Solinvestti
      </p>
    </div>
  );
};

export default RegistrationFinalize;
