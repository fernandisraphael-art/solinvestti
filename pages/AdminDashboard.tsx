import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnergyProvider, Concessionaire } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { parseBatchData } from '../lib/importHelper';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Modular Components
import OverviewTab from './admin/OverviewTab';
import SuppliersTab from './admin/SuppliersTab';
import ClientsTab from './admin/ClientsTab';
import ConcessionairesTab from './admin/ConcessionairesTab';
import SettingsTab from './admin/SettingsTab';
import ProspectorTab from './admin/ProspectorTab';
import GeneratorModal from './admin/GeneratorModal';
import ClientModal from './admin/ClientModal';
import ConcessionaireModal from './admin/ConcessionaireModal';

interface AdminDashboardProps {
  generators: EnergyProvider[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDeleteGenerator: (id: string) => void;
  onUpdateGenerator: (id: string, updates: Partial<EnergyProvider>) => void;
  onAddGenerator: (gen: EnergyProvider) => void;
  onBatchAddGenerators: (batch: EnergyProvider[]) => Promise<void>;
  onActivateAll: () => Promise<void>;
  clients: any[];
  onDeleteClient: (id: string) => void;
  onUpdateClient: (id: string, updates: any) => void;
  onApproveClient: (id: string) => void;
  onActivateAllClients: () => Promise<void>;
  concessionaires: Concessionaire[];
  onAddConcessionaire: (c: Concessionaire) => void;
  onUpdateConcessionaire: (id: string, data: Partial<Concessionaire>) => void;
  onReset: () => void;
}

import { useSystem } from '../contexts/SystemContext';

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  generators,
  onToggleStatus,
  onDeleteGenerator,
  onUpdateGenerator,
  onAddGenerator,
  onBatchAddGenerators,
  onActivateAll,
  clients,
  onDeleteClient,
  onUpdateClient,
  onApproveClient,
  onActivateAllClients,
  concessionaires,
  onAddConcessionaire,
  onUpdateConcessionaire,
  onReset
}) => {
  const { error, refreshData } = useSystem();

  const handleUpdateGenerator = (id: string, updates: Partial<EnergyProvider>) => {
    console.log('[AdminDashboard] handleUpdateGenerator called:', id, updates);
    onUpdateGenerator(id, updates);
  };

  const navigate = useNavigate();
  const manualUploadRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showToast, setShowToast] = useState<{ show: boolean, msg: string, type?: 'info' | 'error' }>({ show: false, msg: '' });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [candidateSuppliers, setCandidateSuppliers] = useState<any[]>([]);
  const [editingGenerator, setEditingGenerator] = useState<EnergyProvider | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [editingConcessionaire, setEditingConcessionaire] = useState<Partial<Concessionaire> | null>(null);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) setHasApiKey(true);

    // CRITICAL: Force refresh if data is missing on mount (fixes race condition)
    if (generators.length === 0 && clients.length === 0) {
      console.log('[AdminDashboard] Data likely missing on mount, forcing refresh...');
      refreshData(true);
    }
  }, []);

  const triggerToast = (msg: string, type: 'info' | 'error' = 'info') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => setShowToast({ show: false, msg: '', type: 'info' }), 4000);
  };

  const handleSearchWeb = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      triggerToast('Ative a chave IA primeiro.', 'error');
      setIsKeyModalOpen(true);
      return;
    }

    setIsSearchingWeb(true);
    try {
      // Improved fetch for structured JSON
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Find 3 real solar plants in ${searchCity}. Return a JSON array of objects with keys: "nome", "localizacao", "responsavel", "telefone" (invent if needed), "desconto" (number 10-20). Output ONLY valid JSON.` }] }]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

      // Sanitizing JSON string in case of markdown code blocks
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr).map((p: any) => ({
        ...p,
        desconto_estimado: p.desconto || 15,
        contato: p.telefone || '---'
      }));

      setCandidateSuppliers(parsed);
      triggerToast('Prospecção concluída!');
    } catch (e: any) {
      triggerToast(e.message, 'error');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const handleSmartFill = async (city: string) => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      triggerToast('Ative a chave IA primeiro.', 'error');
      setIsKeyModalOpen(true);
      return;
    }

    if (!city || city.length < 3) {
      triggerToast('Digite uma cidade antes de buscar.', 'error');
      return;
    }

    triggerToast('IA buscando dados... Aguarde.');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Find ONE real solar energy company/plant in ${city}, Brazil. Return ONLY the data in this format, nothing else:\nNome: [Name]\nEmpresa: [Company Name]\nCidade: [City]\nEstado: [State Code]\nResponsavel: [Manager Name]\nTelefone: [Phone]\n\nIf not found, invent a realistic one.` }] }]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const lines = text.split('\n');
      const getVal = (key: string) => lines.find((l: string) => l.startsWith(key))?.split(':')[1]?.trim() || '';

      const newData = {
        name: getVal('Nome:') || 'Usina Solar IA',
        company: getVal('Empresa:') || 'Solar Energy LTDA',
        city: getVal('Cidade:') || city,
        region: getVal('Estado:') || 'BR',
        responsibleName: getVal('Responsavel:') || 'Gerente',
        responsiblePhone: getVal('Telefone:') || '',
        discount: 15,
        commission: 5,
        capacity: '0',
        status: 'pending' // Explicitly pending as requested
      };

      setEditingGenerator(prev => prev ? ({ ...prev, ...newData }) : (newData as any));
      triggerToast('Dados preenchidos via IA!');
    } catch (e: any) {
      triggerToast('Erro na busca IA.', 'error');
      console.error(e);
    }
  };

  // Proporção de Geração: 1 MWp (Instalado) gera aprox. 125.000 kWh/mês (Média Brasil)
  const KWH_PER_MW = 125000;

  const getCapacityStats = (gen: EnergyProvider) => {
    // Capacidade da Usina já está em MW (Input do Admin)
    const totalMW = typeof gen.capacity === 'number'
      ? gen.capacity
      : parseFloat(String(gen.capacity || '0').replace(/\./g, '').replace(',', '.'));

    const relevantClients = clients.filter(c =>
      (c.supplier_id === gen.id || c.supplierId === gen.id || c.provider_id === gen.id) &&
      (c.status === 'approved' || c.status === 'active')
    );

    const stats = relevantClients.reduce((acc, c) => {
      // 1. Pega consumo em kWh (ou estima pelo valor da conta)
      const billVal = Number(c.billValue || c.bill_value || 0);
      const consumptionKWh = Number(c.consumption) || (billVal / 0.85);

      // 2. Converte kWh do cliente para MW equivalentes da usina
      const equivalentMW = consumptionKWh / KWH_PER_MW;

      acc.usedMW += (equivalentMW || 0);
      acc.totalBill += billVal;

      return acc;
    }, { usedMW: 0, totalBill: 0 });

    const commissionPercentage = Number(gen.commission || 0) / 100;
    const totalCommission = stats.totalBill * commissionPercentage;

    return {
      clientCount: relevantClients.length,
      totalCommission
    };
  };

  const handleExportExcel = () => {
    try {
      const exportData = generators.map(g => {
        const { clientCount, totalCommission } = getCapacityStats(g);
        return {
          Nome: g.name,
          Tipo: g.type,
          Região: g.region,
          Cidade: g.city,
          Capacidade_MW: g.capacity,
          Status: g.status,
          Desconto: `${g.discount}%`,
          Responsável: g.responsibleName,
          Telefone: g.responsiblePhone,
          Clientes_Ativos: clientCount,
          Comissao_R$: totalCommission
        };
      });

      // Calculate totals
      const totalCommissionAll = exportData.reduce((sum, item) => sum + (Number(item['Comissao_R$']) || 0), 0);
      const totalClientsAll = exportData.reduce((sum, item) => sum + (Number(item['Clientes_Ativos']) || 0), 0);

      // Append total row
      exportData.push({
        Nome: 'TOTAL GERAL',
        Tipo: '',
        Região: '',
        Cidade: '',
        Capacidade_MW: '',
        Status: '',
        Desconto: '',
        Responsável: '',
        Telefone: '',
        Clientes_Ativos: totalClientsAll,
        Comissao_R$: totalCommissionAll
      } as any);

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Geradores");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Solinvestti_Geradores.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Excel Export Error:', error);
      triggerToast('Erro ao exportar Excel.', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape'); // Landscape for more columns

      // Title
      doc.setFontSize(16);
      doc.text("Relatório Completo de Usinas Parceiras - Solinvestti", 14, 15);

      // Subtitle with date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 22);

      // Prepare data and calculate totals
      let totalCommissionAll = 0;
      let totalClientsAll = 0;

      const bodyData = generators.map(g => {
        const { clientCount, totalCommission } = getCapacityStats(g);
        totalCommissionAll += totalCommission;
        totalClientsAll += clientCount;

        return [
          g.name || '-',
          g.type || '-',
          `${g.city || '-'} / ${g.region || '-'}`,
          g.capacity || '-',
          g.status === 'active' ? 'Ativo' : g.status === 'cancelled' ? 'Cancelado' : 'Pendente',
          g.discount ? `${g.discount}%` : '-',
          g.commission ? `${g.commission}%` : '-',
          clientCount.toString(),
          `R$ ${totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          g.responsibleName || '-',
          g.responsiblePhone || '-',
          g.accessEmail || '-'
        ];
      });

      autoTable(doc, {
        startY: 28,
        head: [[
          'Nome',
          'Tipo',
          'Local',
          'Capacidade',
          'Status',
          'Desconto',
          'Comissão',
          'Clientes',
          'V. Comissão',
          'Responsável',
          'Telefone',
          'Email'
        ]],
        body: bodyData,
        foot: [[
          'TOTAL',
          '',
          '',
          '',
          '',
          '',
          '',
          totalClientsAll.toString(),
          `R$ ${totalCommissionAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          '',
          '',
          ''
        ]],
        styles: {
          fontSize: 7, // Smaller font to fit more columns
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [16, 185, 129], // Primary color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        footStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Nome
          1: { cellWidth: 12 }, // Tipo
          2: { cellWidth: 25 }, // Local
          3: { cellWidth: 15, halign: 'center' }, // Capacidade
          4: { cellWidth: 15, halign: 'center' }, // Status
          5: { cellWidth: 12, halign: 'center' }, // Desconto
          6: { cellWidth: 12, halign: 'center' }, // Comissão
          7: { cellWidth: 12, halign: 'center' }, // Clientes (New)
          8: { cellWidth: 20, halign: 'right' },  // V. Comissão (New)
          9: { cellWidth: 20 }, // Responsável
          10: { cellWidth: 20 }, // Telefone
          11: { cellWidth: 35 }, // Email
        }
      });

      const pdfBlob = doc.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Solinvestti_Relatorio_Completo_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast('PDF exportado com sucesso!');
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      triggerToast(`Erro ao exportar PDF: ${error.message || 'Erro desconhecido'}`, 'error');
    }
  };

  const getBillUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleExportClientsExcel = () => {
    try {
      const exportData = clients.map(c => ({
        Nome: c.name,
        Email: c.email,
        Telefone: c.phone || '-',
        Cidade: c.city || '-',
        Estado: c.state || '-',
        Usina: c.generatorName || 'Não selecionada',
        Valor_Conta: c.bill_value || c.billValue || 0,
        Consumo_kWh: c.consumption || 0,
        Status: c.status === 'active' || c.status === 'approved' ? 'Aprovado' : c.status === 'pending_approval' ? 'Pendente' : 'Rejeitado',
        Link_Fatura: c.bill_url ? getBillUrl(c.bill_url) : 'Sem fatura'
      }));

      // Calculate totals
      const totalBill = clients.reduce((sum, c) => sum + (Number(c.bill_value || c.billValue) || 0), 0);
      const totalConsumption = clients.reduce((sum, c) => sum + (Number(c.consumption) || 0), 0);

      // Append total row
      exportData.push({
        Nome: 'TOTAL GERAL',
        Email: '',
        Telefone: '',
        Cidade: '',
        Estado: '',
        Usina: '',
        Valor_Conta: totalBill,
        Consumo_kWh: totalConsumption,
        Status: '',
        Link_Fatura: ''
      } as any);

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Solinvestti_Clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast('Excel de Clientes exportado com sucesso!');
    } catch (error) {
      console.error('Client Excel Export Error:', error);
      triggerToast('Erro ao exportar Excel de clientes.', 'error');
    }
  };

  const handleExportClientsPDF = () => {
    try {
      const doc = new jsPDF('landscape');

      doc.setFontSize(16);
      doc.text("Relatório de Clientes - Solinvestti", 14, 15);

      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 22);

      // Calculate totals
      const totalBill = clients.reduce((sum, c) => sum + (Number(c.bill_value || c.billValue) || 0), 0);
      const totalConsumption = clients.reduce((sum, c) => sum + (Number(c.consumption) || 0), 0);

      autoTable(doc, {
        startY: 28,
        head: [[
          'Nome',
          'Email',
          'Telefone',
          'Cidade/UF',
          'Usina',
          'Valor Conta',
          'Consumo',
          'Status',
          'Fatura'
        ]],
        body: clients.map(c => [
          c.name || '-',
          c.email || '-',
          c.phone || '-',
          `${c.city || '-'}/${c.state || '-'}`,
          c.generatorName || '-',
          `R$ ${Number(c.bill_value || c.billValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${c.consumption || 0} kWh`,
          c.status === 'active' || c.status === 'approved' ? 'Aprovado' : c.status === 'pending_approval' ? 'Pendente' : 'Rejeitado',
          c.bill_url ? 'Sim' : 'Não'
        ]),
        foot: [[
          'TOTAL',
          '',
          '',
          '',
          '',
          `R$ ${totalBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${totalConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kWh`,
          '',
          ''
        ]],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        footStyles: {
          fillColor: [15, 23, 42], // Brand Navy
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      const pdfBlob = doc.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Solinvestti_Relatorio_Clientes_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast('PDF de Clientes exportado com sucesso!');
    } catch (error: any) {
      console.error('Client PDF Export Error:', error);
      triggerToast(`Erro ao exportar PDF: ${error.message}`, 'error');
    }
  };

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        if (!bstr) throw new Error("Falha ao ler arquivo");

        const wb = XLSX.read(bstr, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          triggerToast('Arquivo vazio ou formato inválido', 'error');
          return;
        }

        const batch = parseBatchData(data);
        if (batch.length === 0) {
          triggerToast('Nenhum dado válido encontrado nas colunas esperadas', 'error');
          return;
        }

        await onBatchAddGenerators(batch);
        triggerToast(`Sucesso! ${batch.length} usinas importadas.`);
      } catch (err: any) {
        console.error('Import Error:', err);
        triggerToast(`Erro na importação: ${err.message || 'Erro desconhecido'}`, 'error');
      }
    };
    reader.onerror = () => triggerToast('Erro ao ler arquivo', 'error');
    reader.readAsArrayBuffer(file);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Visão Geral', icon: 'grid_view' },
    { id: 'suppliers', label: `Gestão Usinas`, icon: 'factory', count: generators.length },
    { id: 'concessionaires', label: `Distribuidoras`, icon: 'account_balance', count: concessionaires.length },
    { id: 'clients', label: `Base Clientes`, icon: 'groups', count: clients.length },
    { id: 'settings', label: `Configurações`, icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-brand-deep flex font-sans text-white">
      <Sidebar
        userType="Master Admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={sidebarItems}
        onLogout={() => {
          localStorage.clear();
          window.location.href = '/';
        }}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          userName="Admin"
          title={
            activeTab === 'overview' ? 'Visão Geral' :
              activeTab === 'suppliers' ? 'Ativos Geradores' :
                activeTab === 'suppliers_prospect' ? 'Prospecção Inteligente' :
                  activeTab === 'clients' ? 'Gestão de Clientes' :
                    activeTab === 'concessionaires' ? 'Distribuidoras' :
                      activeTab === 'settings' ? 'Configurações' : ''
          }
        />


        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-3 text-red-400">
              <span className="material-symbols-outlined">wifi_off</span>
              <p className="text-sm font-bold">Erro de Conexão: {error}</p>
            </div>
            <button
              onClick={() => refreshData()}
              className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-white hover:underline flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Tentar Novamente
            </button>
          </div>
        )}

        <div className="mt-10 px-6 overflow-y-auto pb-20 scroll-smooth h-full custom-scrollbar">
          {activeTab === 'overview' && <OverviewTab generators={generators} clients={clients} concessionaires={concessionaires} />}

          {activeTab === 'suppliers' && (
            <SuppliersTab
              generators={generators}
              clients={clients}
              onToggleStatus={onToggleStatus}
              onDeleteGenerator={(id) => {
                console.log('[AdminDashboard] onDeleteGenerator passed to SuppliersTab called for:', id);
                onDeleteGenerator(id);
              }}
              onUpdateGenerator={handleUpdateGenerator}
              onEditGenerator={setEditingGenerator}
              onNewGenerator={() => setEditingGenerator({ id: '', name: '', type: 'Solar', region: '', capacity: '0', status: 'pending', discount: 15, commission: 5 } as any)}
              onActivateAll={onActivateAll}
              onProspect={() => setActiveTab('suppliers_prospect')}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              onImport={() => manualUploadRef.current?.click()}
            />
          )}

          {activeTab === 'suppliers_prospect' && (
            <ProspectorTab
              isSearching={isSearchingWeb}
              searchCity={searchCity}
              setSearchCity={setSearchCity}
              onSearch={handleSearchWeb}
              candidateSuppliers={candidateSuppliers}
              onAddCandidate={(c) => {
                onAddGenerator({ ...c, id: `ai-${Date.now()}`, status: 'active' });
                setCandidateSuppliers(prev => prev.filter(p => p.nome !== c.nome));
              }}
              onRejectCandidate={(c) => setCandidateSuppliers(prev => prev.filter(p => p.nome !== c.nome))}
            />
          )}

          {activeTab === 'concessionaires' && (
            <ConcessionairesTab
              concessionaires={concessionaires}
              onEdit={(c) => setEditingConcessionaire(c)}
              onAdd={() => setEditingConcessionaire({})}
            />
          )}

          {activeTab === 'settings' && <SettingsTab onReset={() => setIsResetModalOpen(true)} />}

          {activeTab === 'clients' && (
            <ClientsTab
              clients={clients}
              onEditClient={(client) => {
                console.log('AdminDashboard: setting editingClient to:', client?.name);
                setEditingClient(client);
              }}
              onDeleteClient={(id) => {
                if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
                  onDeleteClient(id);
                }
              }}
              onApproveClient={onApproveClient}
              onUpdateClient={onUpdateClient}
              onActivateAll={onActivateAllClients}
              onExportExcel={handleExportClientsExcel}
              onExportPDF={handleExportClientsPDF}
            />
          )}
        </div>
      </div>

      {/* Modals outside main for safety */}
      {
        editingGenerator && (
          <GeneratorModal
            generator={editingGenerator}
            onClose={() => setEditingGenerator(null)}
            onSmartFill={handleSmartFill}
            onSave={(data) => {
              if (data.id) handleUpdateGenerator(data.id, data);
              else onAddGenerator(data);
              setEditingGenerator(null);
              triggerToast('Salvo com sucesso!');
            }}
            onUpdateField={(f, v) => setEditingGenerator(prev => prev ? ({ ...prev, [f]: v }) : null)}
          />
        )
      }

      {
        editingClient && (
          <ClientModal
            client={editingClient}
            onClose={() => setEditingClient(null)}
            onSave={(id, updates) => {
              console.log('AdminDashboard: onSave for client:', id);
              onUpdateClient(id, updates);
              setEditingClient(null);
              triggerToast('Dados do cliente atualizados!');
            }}
          />
        )
      }

      {
        editingConcessionaire && (
          <ConcessionaireModal
            concessionaire={editingConcessionaire}
            onClose={() => setEditingConcessionaire(null)}
            onSave={(data) => {
              if (data.id) onUpdateConcessionaire(data.id, data);
              else onAddConcessionaire(data as Concessionaire);
              setEditingConcessionaire(null);
              triggerToast('Distribuidora salva com sucesso!');
            }}
          />
        )
      }

      {
        isResetModalOpen && (
          <div className="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl z-[70] flex items-center justify-center p-6">
            <div className="bg-[#0F172A] border border-red-500/20 w-full max-w-lg rounded-[3rem] p-12 text-center shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-4">Hard Reset</h3>
              <p className="text-white/40 mb-8">Esta ação apagará todos os dados. Tem certeza?</p>
              <div className="flex gap-4">
                <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold uppercase text-[10px]">Cancelar</button>
                <button onClick={() => { onReset(); setIsResetModalOpen(false); }} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold uppercase text-[10px]">Confirmar Reset</button>
              </div>
            </div>
          </div>
        )
      }

      {
        showToast.show && (
          <div className={`fixed bottom-10 right-10 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest animate-in slide-in-from-right-10 duration-300 z-[100] ${showToast.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary text-brand-navy shadow-lg shadow-primary/20'}`}>
            {showToast.msg}
          </div>
        )
      }

      {/* Hidden inputs moved inside main container or just before closing div */}
      <input type="file" ref={manualUploadRef} className="hidden" onChange={handleManualUpload} accept=".xlsx,.csv" />
    </div >
  );
};

export default AdminDashboard;
