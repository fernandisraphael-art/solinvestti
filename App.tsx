
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import LandingPage from './pages/LandingPage';
import SignupFlow from './pages/SignupFlow';
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import ConsumerSavings from './pages/ConsumerSavings';
import RegistrationFinalize from './pages/RegistrationFinalize';
import InvestmentPartners from './pages/InvestmentPartners';
import InvestmentSimulation from './pages/InvestmentSimulation';
import GeneratorDashboard from './pages/GeneratorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import GeneratorSignup from './pages/GeneratorSignup';
import ConsumerDashboard from './pages/ConsumerDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemProvider, useSystem } from './contexts/SystemContext';
import { AdminService } from './lib/services/admin.service';
import AdminControls from './components/AdminControls';

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRole?: UserRole;
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth(); // Changed from isLoading to loading

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-deep flex flex-col items-center justify-center text-white">
        <div className="size-14 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" replace />;

  return children;
};

import { supabase } from './lib/supabase';

// Helper to upload file to Supabase Storage
async function uploadFile(fileBase64: string, path: string) {
  try {
    const res = await fetch(fileBase64);
    const blob = await res.blob();
    const { data, error } = await supabase.storage.from('documents').upload(path, blob);
    if (error) throw error;
    return data?.path;
  } catch (e) {
    console.error('Upload failed:', e);
    return null;
  }
}

const App: React.FC = () => {
  const { user, setUser, isLoading } = useAuth();
  const { generators, concessionaires, clients, refreshData } = useSystem();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    billValue: '0',
    selectedProvider: null as any,
    investmentPartner: null as any,
    investmentSimulation: null as any,
    isAlreadyRegistered: false,
    energyBillFile: null as string | null,
    profileImage: null as string | null
  });

  const updateUserData = (newData: Partial<typeof userData>) => setUserData(prev => ({ ...prev, ...newData }));

  const handleLogin = async (role: UserRole, name: string) => {
    setUser({ role, name });
    updateUserData({ name, isAlreadyRegistered: role === UserRole.CONSUMER });
    await refreshData();
  };

  const handleClientRegistration = async (password?: string) => {
    // 1. Create User in Supabase Auth (optional, may fail if user exists)
    if (!userData.email) return;

    // Auto-generate password if not provided (admin approval flow)
    const finalPassword = password || Math.random().toString(36).slice(-8) + "Aa1!";

    let userId: string | null = null;

    // Try to create auth user, but don't block if it fails (user might already exist)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: finalPassword,
        options: {
          data: {
            full_name: userData.name,
            role: 'CONSUMER'
          }
        }
      });

      if (authError) {
        console.warn("Auth signup warning (might be duplicate):", authError.message);
        // If user already exists, we can still proceed with client insertion
      } else {
        userId = authData.user?.id || null;
      }
    } catch (authErr: any) {
      console.warn("Auth signup failed:", authErr.message);
      // Continue anyway - we still want to create the client record
    }

    try {
      // 2. Upload Bill if exists
      let billUrl = null;
      if (userData.energyBillFile) {
        try {
          const path = `bills/${Date.now()}_${userData.name.replace(/\s/g, '_')}.pdf`;
          billUrl = await uploadFile(userData.energyBillFile, path);
        } catch (uploadErr) {
          console.warn("Upload failed but continuing registration:", uploadErr);
          // Don't throw, let the registration proceed even without the file if bucket is missing
        }
      }

      // 3. Insert into 'clients' table (this is the critical part)
      // Handle Brazilian number format: "500,00" or "500.00" or just "500"
      let billString = String(userData.billValue).replace('R$', '').trim();
      // If contains comma, it's Brazilian format with decimals
      if (billString.includes(',')) {
        // Remove thousand separators (dots) and replace comma with dot for decimal
        billString = billString.replace(/\./g, '').replace(',', '.');
      }
      const cleanBill = parseFloat(billString) || 0;

      const { error: dbError } = await supabase.from('clients').insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        city: userData.city,
        state: userData.state,
        bill_value: cleanBill,
        consumption: Number((cleanBill / 0.85).toFixed(2)),
        provider_id: userData.selectedProvider?.id,
        status: 'pending_approval',
        investment_partner_id: userData.investmentPartner?.id, // This is now a UUID
        bill_url: billUrl,
        user_id: userId // May be null if auth failed, that's OK
      });

      if (dbError) {
        console.error("Database Error details:", dbError);
        throw new Error(`Erro no banco de dados: ${dbError.message}`);
      }

      // Refresh global state so admin sees the new client immediately
      refreshData();

      return { success: true, needsConfirmation: false };

    } catch (err: any) {
      console.error("Registration Error Final:", err);
      // More user friendly error messages
      let userMsg = "Erro inesperado ao finalizar seu cadastro.";
      if (err.message?.includes("uuid")) {
        userMsg = "Erro interno de configuração de dados (ID inválido). Por favor, tente novamente.";
      } else if (err.message) {
        userMsg = err.message;
      }

      alert(userMsg);
      throw err;
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen">
        <AdminControls />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AuthPage onLogin={handleLogin} fixedRole={UserRole.ADMIN} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupFlow onComplete={updateUserData} />} />
          <Route path="/generator-signup" element={<GeneratorSignup onComplete={() => { }} />} />

          <Route path="/marketplace" element={
            <ConsumerMarketplace
              userData={userData}
              generators={generators.filter(g => !g.isFull && g.status === 'active')}
              onSelect={updateUserData}
            />
          } />
          <Route path="/savings" element={<ConsumerSavings userData={userData} />} />
          <Route path="/investments" element={<InvestmentPartners userData={userData} onSelect={updateUserData} />} />
          <Route path="/investment-simulation" element={<InvestmentSimulation userData={userData} onComplete={updateUserData} />} />
          <Route path="/finalize" element={<RegistrationFinalize userData={userData} onConfirm={handleClientRegistration} onFileSelect={file => updateUserData({ energyBillFile: file })} />} />

          <Route path="/consumer-dashboard" element={<ProtectedRoute allowedRole={UserRole.CONSUMER}><ConsumerDashboard userData={userData} onUpdateProfile={() => { }} /></ProtectedRoute>} />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole={UserRole.ADMIN}>
              <AdminDashboard
                generators={generators}
                onToggleStatus={async (id, status) => {
                  const newStatus = status === 'active' ? 'pending' : 'active';
                  await AdminService.toggleGeneratorStatus(id, newStatus);
                  refreshData();
                }}
                onDeleteGenerator={async (id) => { await AdminService.deleteGenerator(id); refreshData(); }}
                onUpdateGenerator={async (id, updates) => { await AdminService.updateGenerator(id, updates); refreshData(); }}
                onAddGenerator={async (gen) => { await AdminService.addGenerator(gen); refreshData(); }}
                onBatchAddGenerators={async (batch) => { await AdminService.batchAddGenerators(batch); refreshData(); }}
                onActivateAll={async () => { await AdminService.activateAllGenerators(); refreshData(); }}
                clients={clients}
                onDeleteClient={async (id) => { await AdminService.deleteClient(id); refreshData(); }}
                onUpdateClient={async (id, updates) => { await AdminService.updateClient(id, updates); refreshData(); }}
                onApproveClient={async (id) => {
                  await AdminService.updateClient(id, { status: 'approved' });
                  refreshData();
                }}
                concessionaires={concessionaires}
                onAddConcessionaire={async (data) => { await AdminService.addConcessionaire(data); refreshData(); }}
                onUpdateConcessionaire={async (id, data) => { await AdminService.updateConcessionaire(id, data); refreshData(); }}
                onReset={async () => { await AdminService.resetDatabase(); refreshData(); }}
              />
            </ProtectedRoute>
          } />

          <Route path="/generator/*" element={
            <ProtectedRoute allowedRole={UserRole.GENERATOR}>
              {(() => {
                // Find generator by email or metadata
                const currentGen = generators.find(g =>
                  g.accessEmail === user?.email ||
                  g.access_email === user?.email ||
                  g.name?.toLowerCase() === user?.name?.toLowerCase() ||
                  g.responsibleName?.toLowerCase() === user?.name?.toLowerCase()
                );

                // Filter clients where provider_id matches this generator
                const genClients = clients.filter(c =>
                  c.provider_id === currentGen?.id ||
                  c.providerId === currentGen?.id
                );

                const activeClients = genClients.filter(c =>
                  c.status === 'active' || c.status === 'approved'
                ).map(c => ({
                  id: c.id,
                  name: c.name,
                  status: 'Ativo',
                  billValue: c.bill_value || c.billValue || 0,
                  date: new Date(c.created_at || Date.now()).toLocaleDateString('pt-BR')
                }));

                const pendingNegotiations = genClients.filter(c =>
                  c.status !== 'active' && c.status !== 'approved'
                ).map(c => ({
                  id: c.id,
                  name: c.name,
                  status: c.status === 'pending_approval' ? 'Análise de Crédito' : 'Aguardando Documentação',
                  billValue: c.bill_value || c.billValue || 0,
                  date: new Date(c.created_at || Date.now()).toLocaleDateString('pt-BR')
                }));

                return (
                  <GeneratorDashboard
                    generatorData={{
                      contactName: currentGen?.responsibleName || currentGen?.responsible_name || user?.name || '',
                      socialName: currentGen?.name || '',
                      cnpj: (currentGen as any)?.cnpj || '',
                      energyCapacity: String(currentGen?.capacity || '0'),
                      locationState: currentGen?.region?.split('/')?.[1]?.trim() || currentGen?.state || 'MG',
                      locationCity: currentGen?.region?.split('/')?.[0]?.trim() || currentGen?.city || 'Sua Cidade',
                      discount: currentGen?.discount || 15,
                      commission: currentGen?.commission || 5,
                      agreements: '',
                      logoUrl: currentGen?.logoUrl || (currentGen as any)?.logo_url
                    }}
                    onUpdate={async (updates) => {
                      if (currentGen?.id) {
                        await AdminService.updateGenerator(currentGen.id, updates);
                        await refreshData();
                      }
                    }}
                    clients={activeClients}
                    negotiations={pendingNegotiations}
                  />
                );
              })()}
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            user?.role === UserRole.ADMIN ? <Navigate to="/admin" /> :
              user?.role === UserRole.GENERATOR ? <Navigate to="/generator" /> :
                <Navigate to="/consumer-dashboard" />
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
