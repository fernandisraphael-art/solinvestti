
import React, { useMemo, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import { LOGO_URL } from '../constants/assets';

interface ConsumerDashboardProps {
  userData: any;
}

const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ userData }) => {
  const navigate = useNavigate();
  const [showAdminArea, setShowAdminArea] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    name: userData.name || 'Investidor',
    email: userData.email || 'investidor@solinvestti.com',
    phone: userData.phone || '(11) 99999-9999',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const billValue = Number(userData.billValue) || 500;
  const discountPercent = userData.selectedProvider?.discount || 18;
  const monthlySavings = billValue * (discountPercent / 100);
  const isInvesting = !!userData.investmentPartner;

  const simulation = userData.investmentSimulation;
  const timeframeMonths = simulation?.months || 12;
  const currentTotalWealth = simulation ? simulation.finalValue : 0;
  const currentTotalInvested = simulation ? simulation.totalInvested : 0;
  const currentTotalProfit = simulation ? (simulation.finalValue - simulation.totalInvested) : 0;

  const performanceData = useMemo(() => {
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    let accumulatedSavings = 0;
    let accumulatedInvestment = 0;
    const yieldRate = 1.15;

    return monthsNames.map((month) => {
      accumulatedSavings += monthlySavings;
      if (isInvesting) {
        accumulatedInvestment = (accumulatedInvestment + monthlySavings) * (1 + (yieldRate / 100));
      } else {
        accumulatedInvestment = accumulatedSavings;
      }
      return {
        month,
        savings: accumulatedSavings,
        totalWealth: accumulatedInvestment,
        profit: isInvesting ? accumulatedInvestment - accumulatedSavings : 0
      };
    });
  }, [monthlySavings, isInvesting]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString('pt-BR');

      // Estilos de Cabeçalho
      doc.setFillColor(15, 23, 42); // Navy
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("SOLINVESTTI", 20, 25);
      doc.setFontSize(10);
      doc.text("EXTRATO ANUAL DE PATRIMÔNIO DIGITAL", 20, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text("Relatório Consolidado de Eficiência", 20, 55);

      // Info do Cliente
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`TITULAR: ${editData.name.toUpperCase()}`, 20, 65);
      doc.text(`DATA DE EMISSÃO: ${date}`, 20, 70);
      doc.text(`PARCEIRO CUSTODIANTE: ${userData.investmentPartner?.name || 'N/A'}`, 20, 75);

      // Caixa de Resumo
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, 85, 170, 45, 3, 3);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text("Resumo de Performance (12 Meses)", 30, 95);

      doc.setFontSize(10);
      doc.text(`Economia Mensal Gerada: R$ ${monthlySavings.toLocaleString('pt-BR')}`, 30, 105);
      doc.text(`Total Acumulado Reinvestido: R$ ${currentTotalInvested.toLocaleString('pt-BR')}`, 30, 112);

      doc.setTextColor(16, 185, 129); // Primary Green
      doc.setFontSize(14);
      doc.text(`Patrimônio Final Projetado: R$ ${currentTotalWealth.toLocaleString('pt-BR')}`, 30, 122);

      // Rodapé Legal
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      const footerText = "Este documento é um relatório informativo de projeção patrimonial baseado em performance histórica e não garante rentabilidade futura. Solinvestti Finance & Energy v4.0";
      doc.text(footerText, 20, 280);

      // Logotipo Solinvestti (Placeholder Visual no PDF via formas se imagem falhar, mas tentamos imagem)
      try {
        doc.addImage(LOGO_URL, 'PNG', 160, 10, 30, 12);
      } catch (e) { console.warn("Erro ao carregar logo Solinvestti para o PDF"); }

      // Logotipo Parceiro
      if (userData.investmentPartner?.logo) {
        try {
          doc.addImage(userData.investmentPartner.logo, 'JPEG', 160, 55, 20, 20);
        } catch (e) { console.warn("Erro ao carregar logo do parceiro para o PDF"); }
      }

      doc.save(`Extrato_Solinvestti_${editData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao processar o seu extrato. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-primary selection:text-white relative">

      {/* MODAL: ÁREA ADMINISTRATIVA */}
      {showAdminArea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 bg-brand-navy/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-[500px] h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            <header className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-display font-black text-brand-navy uppercase tracking-tight">Dados Cadastrais</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Configurações de Segurança</p>
              </div>
              <button onClick={() => setShowAdminArea(false)} className="size-12 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div onClick={() => fileInputRef.current?.click()} className="size-32 rounded-full border-4 border-white shadow-premium overflow-hidden cursor-pointer group relative bg-slate-100 flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Perfil" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                  )}
                  <div className="absolute inset-0 bg-brand-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toque para alterar imagem</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">E-mail</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Telefone / WhatsApp</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span> Alterar Senha do Relatório
                </h4>
                <div>
                  <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Senha Atual</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Nova Senha</label>
                    <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" placeholder="Nova" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Repetir</label>
                    <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm" placeholder="Confirme" />
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowAdminArea(false)} className="flex-1 btn-startpro text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                Salvar Alterações
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="glass-nav sticky top-0 z-50 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/"><Logo variant="dark" /></Link>
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setShowAdminArea(true)} className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2 group">
                PAINEL ADMINISTRATIVO <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">settings</span>
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-right">
                <p className="text-[9px] font-black text-brand-slate uppercase tracking-widest opacity-60">Sessão Ativa</p>
                <p className="text-xs font-bold text-brand-navy">{editData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowAdminArea(true)} className="size-11 rounded-full bg-white shadow-premium flex items-center justify-center border border-slate-100 hover:scale-110 transition-transform overflow-hidden">
                {profileImage ? (<img src={profileImage} alt="User" className="w-full h-full object-cover" />) : (<span className="material-symbols-outlined text-brand-navy">account_circle</span>)}
              </button>
              <button onClick={handleLogout} className="size-11 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all text-brand-navy" title="Sair do Relatório">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">Custódia e Performance Energética</span>
            <h2 className="text-5xl font-display font-extrabold text-brand-navy mb-4">Gestão de Patrimônio</h2>
            <p className="text-lg text-brand-slate leading-relaxed">
              Acompanhe a evolução do seu capital gerado através da eficiência energética com a <span className="text-brand-navy font-bold">{userData.selectedProvider?.name || 'sua Usina'}</span>.
            </p>
          </div>

          <div className="w-full lg:w-[420px] bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><span className="material-symbols-outlined text-6xl">insights</span></div>
            <label className="block text-[10px] font-black text-brand-slate uppercase tracking-widest mb-4">Economia Estimada (Méd. Mensal)</label>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-primary font-black text-2xl">R$</span>
              <span className="text-5xl font-display font-extrabold text-brand-navy">{monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase"><span className="material-symbols-outlined text-[16px]">verified</span> Meta de Eficiência Ativa</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-10 lg:p-12 rounded-[3rem] shadow-premium border border-slate-100">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-xl font-display font-extrabold text-brand-navy">Ciclo de 12 Meses</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evolução do Primeiro Ano</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="size-2.5 bg-slate-100 rounded-full border border-slate-200"></span><span className="text-[9px] font-black uppercase text-brand-slate">Economia</span></div>
                <div className="flex items-center gap-2"><span className="size-2.5 bg-primary rounded-full"></span><span className="text-[9px] font-black uppercase text-brand-slate">Crescimento</span></div>
              </div>
            </div>
            <div className="h-72 flex items-end justify-between gap-3 px-2 mb-4">
              {performanceData.map((data, i) => {
                const isProjected = i > new Date().getMonth();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute bottom-full mb-4 bg-brand-navy text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl pointer-events-none text-center min-w-[120px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{data.month} {isProjected ? '(Projeção)' : ''}</p>
                      <p className="text-xs font-black">R$ {data.totalWealth.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="w-full flex flex-col items-center justify-end gap-1 h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${isProjected ? 'bg-primary/30' : 'bg-primary'}`}
                        style={{ height: `${(data.totalWealth / (performanceData[11].totalWealth || 1)) * 100}%` }}
                      ></div>
                      <div className={`w-full rounded-b-sm ${isProjected ? 'bg-slate-50' : 'bg-slate-100'}`} style={{ height: `4px` }}></div>
                    </div>
                    <span className={`mt-4 text-[9px] font-black uppercase tracking-tighter ${isProjected ? 'text-slate-300' : 'text-brand-slate'}`}>{data.month}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-[9px] font-bold text-slate-400 italic">
              *As projeções podem variar conforme o consumo e a economia no mês.
            </p>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {isInvesting && (
              <div className="bg-brand-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[380px]">
                <div className="absolute top-0 right-0 p-8 opacity-10"><span className="material-symbols-outlined text-6xl">account_balance_wallet</span></div>
                <div className="mb-8">
                  <div className="inline-flex px-3 py-1 rounded-full bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest mb-4 border border-primary/20">Estratégia {timeframeMonths} Meses</div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Patrimônio Líquido Projetado</p>
                  <h4 className="text-4xl lg:text-5xl font-display font-extrabold tracking-tighter">R$ {currentTotalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</h4>
                </div>
                <div className="space-y-5 mt-auto">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-5"><span className="text-white/40">Horizonte de Capital</span><span className="text-white bg-white/10 px-3 py-1 rounded-lg">{timeframeMonths} Meses</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span className="text-white/40">Total Reinvestido</span><span className="text-primary">R$ {currentTotalInvested.toLocaleString('pt-BR')}</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span className="text-white/40">Lucro de Operação</span><span className="text-primary">R$ {currentTotalProfit.toLocaleString('pt-BR')}</span></div>
                </div>
                <p className="mt-8 text-[9px] font-bold text-white/30 italic">*Valores baseados na performance da {userData.investmentPartner?.name || 'carteira conservadora'}.</p>
              </div>
            )}

            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium">
              <h5 className="text-[10px] font-black text-brand-navy uppercase tracking-widest mb-6">Status da Estratégia</h5>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="size-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl"><span className="material-symbols-outlined">verified</span></div>
                <div>
                  <p className="text-[11px] font-black text-brand-navy uppercase">{userData.investmentPartner?.name || 'Apenas Economia'}</p>
                  <p className="text-[9px] text-brand-slate font-medium">Conta homologada e ativa</p>
                </div>
              </div>
              <button onClick={() => navigate('/investments')} className="w-full mt-6 py-4 border-2 border-slate-100 hover:border-primary text-brand-navy hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Alterar Estratégia</button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex items-center gap-6">
            <div className="size-14 bg-brand-navy/5 text-brand-navy rounded-2xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined">receipt_long</span></div>
            <div>
              <p className="text-xs font-bold text-brand-navy">Última fatura processada: Outubro/2024</p>
              <p className="text-[10px] text-brand-slate mt-1">Sincronizado com a {userData.selectedProvider?.name || 'concessionária local'}.</p>
            </div>
          </div>

          <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="size-14 bg-primary/5 text-primary rounded-[1.2rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[28px]">download</span>
              </div>
              <p className="text-xs font-bold text-brand-navy uppercase tracking-tight">Extrato Anual de Patrimônio</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="text-primary font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all disabled:opacity-50"
            >
              {isGeneratingPDF ? 'Gerando...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest">© 2024 SOLINVESTTI Finance & Energy</p>
          <div className="flex gap-8">
            <button className="text-[10px] font-black text-brand-navy uppercase tracking-widest hover:text-primary transition-colors">Solicitar Resgate</button>
            <button className="text-[10px] font-black text-brand-navy uppercase tracking-widest hover:text-primary transition-colors">Suporte 24h</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerDashboard;
