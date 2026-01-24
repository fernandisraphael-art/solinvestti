
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { maskCurrency } from '../lib/masks';

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

  // Snapshot user data for success screen to avoid flicker/empty state when parent resets userData
  const [finalData, setFinalData] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);

      // Read file for preview/upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onFileSelect(base64); // Pass to parent
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
    }

    // Save snapshot of data before it might be cleared by parent
    setFinalData({ ...userData });
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

  if (success && finalData) {
    if (needsEmailAuth) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 text-center font-sans text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
          <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 animate-bounce">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black mb-2 text-brand-navy dark:text-white">
            Confirme sua Senha
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm font-medium leading-relaxed">
            Enviamos um link de confirmação para <span className="text-brand-navy dark:text-white font-bold">{finalData.email}</span>.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-startpro text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform uppercase text-[10px] tracking-widest"
          >
            Ir para Login <span className="material-symbols-outlined text-sm">login</span>
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 text-center font-sans text-slate-900 dark:text-slate-100 animate-in fade-in duration-700">
        <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 animate-bounce">
          <span className="material-symbols-outlined text-3xl">verified</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-black mb-2 text-brand-navy dark:text-white">
          {isUpdate ? 'Estratégia Atualizada!' : 'Cadastro Realizado!'}
        </h2>
        {isUpdate ? (
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-6 text-sm font-medium leading-relaxed">
            {finalData.name}, sua estratégia com a {finalData.selectedProvider?.name} foi aplicada.
          </p>
        ) : (
          <div className="max-w-md mb-6 space-y-3">

            {/* LOGIC FIX: Show Investment OR Provider message, not both/mixed */}
            {finalData.investmentPartner ? (
              <div className="bg-brand-navy/10 dark:bg-white/10 rounded-xl p-3 text-left flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-navy dark:text-primary text-xl">trending_up</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold">{finalData.investmentPartner?.name || 'Corretora'}</span> fará análise do seu perfil.
                </p>
              </div>
            ) : (
              <div className="bg-primary/10 rounded-xl p-3 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-primary">{finalData.selectedProvider?.name}</span> entrará em contato em breve.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-white/10 mt-2 px-3">
              <span className="material-symbols-outlined text-primary text-xl">mail</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Você receberá um e-mail de confirmação do cadastro.
              </p>
            </div>

          </div>
        )}
        <button
          onClick={() => navigate('/')}
          className="btn-startpro text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform uppercase text-[10px] tracking-widest"
        >
          Voltar ao Início <span className="material-symbols-outlined text-sm">home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-deep flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[520px] bg-white dark:bg-brand-navy shadow-premium rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12"></div>

        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-400 hover:text-primary font-bold text-[10px] uppercase flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar
        </button>

        <header className="text-center mb-6 relative z-10">
          <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">{isUpdate ? 'published_with_changes' : 'task_alt'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black mb-1 text-brand-navy dark:text-white">
            {isUpdate ? 'Confirmar Estratégia' : 'Resumo e Finalização'}
          </h2>
          <p className="text-brand-slate dark:text-slate-400 text-xs font-medium">
            {isUpdate
              ? `Migrando alocação para ${userData.selectedProvider?.name}.`
              : `Adesão com a ${userData.selectedProvider?.name}.`
            }
          </p>
        </header>

        <div className="space-y-4 relative z-10">
          {!isUpdate && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer group ${userData.energyBillFile ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10 hover:border-primary/50'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
              <span className={`material-symbols-outlined text-3xl mb-1 block ${userData.energyBillFile ? 'text-primary' : 'text-slate-300'}`}>
                {userData.energyBillFile ? 'task_alt' : 'upload_file'}
              </span>
              <p className="font-black text-brand-navy dark:text-white text-[10px] uppercase tracking-wider">
                {fileName ? fileName : 'Anexar Fatura'}
              </p>
              <p className="text-[9px] text-slate-400 uppercase">
                {userData.energyBillFile ? 'Anexado' : 'Obrigatório'}
              </p>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <h4 className="font-black text-[9px] mb-3 text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">analytics</span> Parâmetros
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Titular</span>
                <span className="font-black text-brand-navy dark:text-white">{userData.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Planta</span>
                <span className="font-black text-primary">{userData.selectedProvider?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Asset Manager</span>
                <span className="font-black text-brand-navy dark:text-white">{userData.investmentPartner?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-2 mt-2">
                <span className="font-bold text-slate-500 uppercase">Economia</span>
                <span className="text-lg font-display font-black text-primary">R$ {(Number(userData.billValue || 0) * (userData.selectedProvider?.discount / 100 || 0.18)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button
            disabled={isFinalizing}
            onClick={handleFinish}
            className="w-full btn-startpro text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest"
          >
            {isFinalizing
              ? 'Processando...'
              : (isUpdate ? 'Confirmar Alocação' : 'Confirmar e Finalizar')
            }
            <span className="material-symbols-outlined text-sm">{isUpdate ? 'sync_saved_locally' : 'verified'}</span>
          </button>
        </div>
      </div>

      <p className="mt-4 text-[9px] text-brand-slate/40 font-black uppercase tracking-widest flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">verified_user</span>
        Ambiente Seguro Solinvestti
      </p>
    </div>
  );
};

export default RegistrationFinalize;
