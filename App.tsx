
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
import FAQPage from './pages/FAQPage';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemProvider, useSystem } from './contexts/SystemContext';
import { AdminService } from './lib/services/admin.service';
import AdminControls from './components/AdminControls';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';

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
    console.log('[Upload] Starting upload, path:', path);

    // Convert base64 to blob
    const res = await fetch(fileBase64);
    const blob = await res.blob();
    console.log('[Upload] Blob created, size:', blob.size, 'type:', blob.type);

    // Determine file extension from mime type
    let finalPath = path;
    if (blob.type.includes('image/')) {
      const ext = blob.type.split('/')[1] || 'png';
      finalPath = path.replace(/\.[^/.]+$/, `.${ext}`);
    } else if (blob.type.includes('pdf')) {
      finalPath = path.replace(/\.[^/.]+$/, '.pdf');
    }
    console.log('[Upload] Final path:', finalPath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('documents').upload(finalPath, blob, {
      cacheControl: '3600',
      upsert: true
    });

    if (error) {
      console.error('[Upload] Supabase error:', error);
      throw error;
    }

    console.log('[Upload] Success, data:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(data.path);
    console.log('[Upload] Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (e) {
    console.error('[Upload] Failed:', e);
    return null;
  }
}


const App: React.FC = () => {
  const { user, setUser, isLoading } = useAuth();
  const { generators, concessionaires, clients, refreshData, updateLocalClient, deleteLocalClient, updateLocalGenerator, deleteLocalGenerator } = useSystem();

  // Debug: Track when generators change
  console.log('[App] Rendering with generators:', generators.length, 'clients:', clients.length);

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
    // CRITICAL: Wait for data to load before navigation happens
    // This prevents race condition where user navigates to marketplace before generators are loaded
    console.log('[App] handleLogin - Waiting for data refresh...');
    try {
      await refreshData(true);
      console.log('[App] handleLogin - Data refresh complete');
    } catch (err) {
      console.error('[App] handleLogin - Data refresh failed:', err);
      // Continue anyway, the page will retry loading
    }
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

      const clientData = {
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
      };

      // Try SDK first, fallback to direct fetch if AbortError
      let insertSuccess = false;
      let newClientId: string | null = null;
      try {
        // Try SDK first

        const { data: insertedData, error: dbError } = await supabase.from('clients').insert(clientData).select('id').single();
        if (insertedData) {
          newClientId = insertedData.id;
        }

        if (dbError) {
          // Check if it's an AbortError
          if (dbError.message?.includes('AbortError') || dbError.message?.includes('aborted')) {
            console.warn('SDK AbortError, trying direct fetch fallback...');
            throw new Error('AbortError'); // Trigger fallback
          }
          console.error("Database Error details:", dbError);
          throw new Error(`Erro no banco de dados: ${dbError.message}`);
        }
        insertSuccess = true;
      } catch (sdkErr: any) {
        // Fallback: Direct API call
        if (sdkErr.message?.includes('AbortError') || sdkErr.message?.includes('aborted')) {
          console.log('Using direct API fallback for client insert...');
          const url = import.meta.env.VITE_SUPABASE_URL;
          const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

          if (!url || !key) {
            throw new Error('Configuração do Supabase não encontrada. Por favor, recarregue a página.');
          }

          const response = await fetch(`${url}/rest/v1/clients`, {
            method: 'POST',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(clientData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar cadastro: ${response.status} - ${errorText}`);
          }

          try {
            // Try to get ID from response
            const resData = await response.json();
            if (resData && resData.length > 0) {
              newClientId = resData[0].id;
            }
          } catch (e) { console.warn('Could not parse fallback response for ID', e); }

          insertSuccess = true;
          console.log('✅ Client inserted via direct API fallback');
        } else {
          throw sdkErr; // Re-throw if not AbortError
        }
      }

      if (!insertSuccess) {
        throw new Error('Falha ao salvar cadastro. Por favor, tente novamente.');
      }

      // 4. Send Admin Notification (Non-blocking)
      try {
        if (insertSuccess) {
          console.log('[App] Sending admin notification...');
          fetch('/api/send-email-graph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'admin_notification',
              signupData: {
                type: 'residencial', // Generic for client flow
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                city: userData.city,
                state: userData.state,
                id: newClientId || 'unknown-id',
                created_at: new Date().toISOString()
              }
            })
          }).catch(err => console.error('[App] Failed to send admin notification:', err));
        }
      } catch (notifyErr) {
        console.error('[App] Notification error (ignored):', notifyErr);
      }

      // Refresh global state so admin sees the new client immediately
      await refreshData();

      // Clear userData after a small delay to ensure refresh completes
      // This prevents race conditions and ensures the new client appears in the list
      setTimeout(() => {
        setUserData({
          name: '',
          email: '',
          phone: '',
          state: '',
          city: '',
          billValue: '0',
          selectedProvider: null,
          investmentPartner: null,
          investmentSimulation: null,
          isAlreadyRegistered: false,
          energyBillFile: null,
          profileImage: null
        });
      }, 500);

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
      <ScrollToTop />
      <CookieConsent />
      <div className="min-h-screen">
        <AdminControls />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/duvidas-frequentes" element={<FAQPage />} />

          <Route path="/admin-login" element={<AuthPage onLogin={handleLogin} fixedRole={UserRole.ADMIN} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupFlow onComplete={updateUserData} />} />
          <Route path="/generator-signup" element={<GeneratorSignup onComplete={refreshData} />} />

          <Route path="/marketplace" element={
            <ConsumerMarketplace
              userData={userData}
              generators={generators}
              onSelect={updateUserData}
            />
          } />
          <Route path="/savings" element={<ConsumerSavings userData={userData} />} />
          <Route path="/investments" element={<InvestmentPartners userData={userData} onSelect={updateUserData} />} />
          <Route path="/investment-simulation" element={<InvestmentSimulation userData={userData} onComplete={updateUserData} />} />
          <Route path="/finalize" element={<RegistrationFinalize userData={userData} onConfirm={handleClientRegistration} onFileSelect={file => updateUserData({ energyBillFile: file })} onUpdateData={updateUserData} />} />

          <Route path="/consumer-dashboard" element={<ProtectedRoute allowedRole={UserRole.CONSUMER}><ConsumerDashboard userData={userData} onUpdateProfile={() => { }} /></ProtectedRoute>} />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole={UserRole.ADMIN}>
              <AdminDashboard
                generators={generators}
                onToggleStatus={async (id, status) => {
                  const newStatus = status === 'active' ? 'pending' : 'active';
                  // Optimistic
                  updateLocalGenerator(id, { status: newStatus });
                  // Background
                  await AdminService.toggleGeneratorStatus(id, newStatus);
                }}
                onDeleteGenerator={async (id) => {
                  console.log('[App.tsx] onDeleteGenerator called for id:', id);
                  // Optimistic
                  deleteLocalGenerator(id);
                  // Background
                  await AdminService.deleteGenerator(id);
                }}
                onUpdateGenerator={async (id, updates) => {
                  console.log('[App.tsx] onUpdateGenerator called for id:', id, updates);
                  // Optimistic
                  updateLocalGenerator(id, updates);

                  // Background
                  const currentGen = generators.find(g => g.id === id);
                  await AdminService.updateGenerator(id, updates, currentGen?.status);
                }}
                onAddGenerator={async (gen) => { await AdminService.addGenerator(gen); refreshData(); }}
                onBatchAddGenerators={async (batch) => { await AdminService.batchAddGenerators(batch); refreshData(); }}
                onActivateAll={async () => {
                  // Optimistic
                  generators.forEach(g => updateLocalGenerator(g.id, { status: 'active' }));
                  await AdminService.activateAllGenerators();
                  // refreshData(); // Still good to sync eventually, but maybe not block
                }}
                clients={clients}
                onDeleteClient={async (id) => {
                  console.log('[App.tsx] onDeleteClient called for id:', id);
                  // Optimistic update
                  deleteLocalClient(id);
                  // Background update
                  await AdminService.deleteClient(id);
                }}
                onUpdateClient={async (id, updates, emailOptions) => {
                  // Optimistic update
                  updateLocalClient(id, updates);

                  // Background update
                  const currentClient = clients.find(c => c.id === id);
                  await AdminService.updateClient(id, updates, currentClient?.status, emailOptions);
                }}
                onApproveClient={async (id) => {
                  const client = clients.find(c => c.id === id);
                  if (client) {
                    // Optimistic update
                    updateLocalClient(id, { status: 'approved' });
                    // Background update
                    await AdminService.approveClient(client);
                  }
                }}
                onActivateAllClients={async () => {
                  // Optimistic update for all pending clients
                  const pendingClients = clients.filter(c => c.status === 'pending_approval');
                  pendingClients.forEach(c => updateLocalClient(c.id, { status: 'approved' }));

                  // Background update
                  await AdminService.activateAllClients();
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
                  date: new Date(c.created_at || Date.now()).toLocaleDateString('pt-BR'),
                  billUrl: c.bill_url || c.billUrl
                }));

                const pendingNegotiations = genClients.filter(c =>
                  c.status !== 'active' && c.status !== 'approved'
                ).map(c => ({
                  id: c.id,
                  name: c.name,
                  status: c.status === 'pending_approval' ? 'Análise de Crédito' : 'Aguardando Documentação',
                  billValue: c.bill_value || c.billValue || 0,
                  date: new Date(c.created_at || Date.now()).toLocaleDateString('pt-BR'),
                  billUrl: c.bill_url || c.billUrl
                }));

                return (
                  <GeneratorDashboard
                    generatorData={{
                      id: currentGen?.id || '',
                      contactName: currentGen?.responsibleName || currentGen?.responsible_name || user?.name || '',
                      socialName: currentGen?.name || '',
                      cnpj: (currentGen as any)?.cnpj || '',
                      energyCapacity: String(currentGen?.capacity || '0'),
                      locationState: currentGen?.region?.split('/')?.[1]?.trim() || currentGen?.state || 'MG',
                      locationCity: currentGen?.region?.split('/')?.[0]?.trim() || currentGen?.city || 'Sua Cidade',
                      discount: currentGen?.discount || 15,
                      commission: currentGen?.commission !== undefined ? currentGen.commission : 5,
                      agreements: currentGen?.agreements || (currentGen as any)?.agreements || '',
                      logoUrl: currentGen?.logoUrl || (currentGen as any)?.logo_url,
                      responsiblePhone: currentGen?.responsiblePhone || '',
                      accessEmail: currentGen?.accessEmail || '',
                      accessPassword: currentGen?.accessPassword || '',
                      company: currentGen?.company || '',
                      website: currentGen?.website || ''
                    }}
                    onUpdate={async (updates) => {
                      console.log('[App.tsx] onUpdate called with:', updates);
                      if (currentGen?.id) {
                        console.log('[App.tsx] Updating generator:', currentGen.id);
                        try {
                          // Buscar status atual para detectar transição
                          await AdminService.updateGenerator(currentGen.id, updates, currentGen.status);
                          refreshData();
                          console.log('[App.tsx] Update initiated');
                        } catch (err) {
                          console.error('[App.tsx] Update failed:', err);
                          throw err; // Propagate to GeneratorDashboard
                        }
                      } else {
                        console.warn('[App.tsx] No currentGen ID found!');
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
