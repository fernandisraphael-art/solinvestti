
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { UserRole, EnergyProvider, Concessionaire } from './types';
import { ENERGY_PROVIDERS } from './constants';
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
import { supabase } from './lib/supabase';

// Define ProtectedRoute outside of App to prevent remounting
const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRole?: UserRole;
  user: { role: UserRole | null, name: string } | null;
  isLoading: boolean;
}> = ({ children, allowedRole, user, isLoading }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-deep flex flex-col items-center justify-center text-white">
        <div className="size-14 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole | null, name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setUser({ role: data.role as UserRole, name: data.name || 'Usuário' });
      setUserData(prev => ({ ...prev, name: data.name || prev.name, profileImage: data.avatar_url || prev.profileImage }));
      fetchEntities(data.role as UserRole, userId);
    } else {
      setIsLoading(false);
    }
  };

  const fetchEntities = async (role: UserRole, userId: string) => {
    try {
      // 1. Fetch Generators
      const { data: genData } = await supabase.from('generators').select('*');
      if (genData && genData.length > 0) {
        setGenerators(genData.map((g: any) => ({
          ...g,
          rating: Number(g.rating),
          discount: Number(g.discount),
          estimatedSavings: Number(g.estimated_savings),
          commission: Number(g.commission),
          responsibleName: g.responsible_name,
          responsiblePhone: g.responsible_phone,
          icon: 'wb_sunny',
          color: 'from-emerald-600 to-teal-500',
          logoUrl: g.logo_url || null,
          accessEmail: g.access_email,
          accessPassword: g.access_password,
          // Map new fields
          annualRevenue: Number(g.annual_revenue),
          company: g.company,
          landline: g.landline,
          city: g.city,
          website: g.website
        })));

        // If user is a generator, find their specific data
        if (role === UserRole.GENERATOR) {
          const myGen = genData.find(g => g.user_id === userId);
          if (myGen) {
            setCurrentGeneratorData({
              socialName: myGen.name,
              cnpj: '', // Not in DB yet
              email: '', // Not in DB yet
              contactName: myGen.responsible_name || '',
              contactPhone: myGen.responsible_phone || '',
              energyCapacity: myGen.capacity || '0',
              locationState: myGen.region?.split('/')?.[1]?.trim() || '',
              locationCity: myGen.region?.split('/')?.[0]?.trim() || '',
              discount: Number(myGen.discount),
              commission: Number(myGen.commission),
              address: '',
              agreements: 'Contrato de Adesão Solar Padrão',
              logoUrl: myGen.logo_url || null
            });
          }
        }
      } else {
        // DB is empty, clear local state
        setGenerators([]);
      }

      // 2. Fetch Concessionaires
      const { data: concData } = await supabase.from('concessionaires').select('*');
      if (concData && concData.length > 0) {
        setConcessionaires(concData);
      } else {
        setConcessionaires([]);
      }

      // 3. Fetch Clients (Simplified for now)
      const { data: clientData } = await supabase.from('clients').select('*');
      if (clientData) {
        setGlobalClients(clientData.map(c => ({
          ...c,
          billValue: Number(c.bill_value),
          date: new Date(c.created_at).toLocaleDateString('pt-BR'),
          accessEmail: c.access_email,
          accessPassword: c.access_password
        })));
      }

    } catch (err) {
      console.error('Error fetching entities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [globalClients, setGlobalClients] = useState<any[]>([]);
  const [globalNegotiations, setGlobalNegotiations] = useState<any[]>([]);

  const [concessionaires, setConcessionaires] = useState<Concessionaire[]>([]);

  const [generators, setGenerators] = useState<EnergyProvider[]>([]);

  const [currentGeneratorData, setCurrentGeneratorData] = useState({
    contactName: '',
    contactPhone: '',
    socialName: '',
    cnpj: '',
    address: '',
    email: '',
    energyCapacity: '0',
    locationState: '',
    locationCity: '',
    discount: 15,
    commission: 5,
    agreements: 'Contrato de Adesão Solar Padrão',
    logoUrl: null as string | null
  });

  const resetSystem = async () => {
    try {
      await supabase.rpc('reset_database');
    } catch (error: any) {
      console.error('Erro ao resetar banco de dados:', error);
      alert('Erro ao resetar sistema: ' + error.message);
    }

    setGlobalClients([]);
    setGlobalNegotiations([]);
    setGenerators([]);
    setConcessionaires([]);
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
      energyBillFile: null
    });
  };

  const updateUserData = (newData: Partial<typeof userData>) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const registerNewClient = async (clientData: any, password?: string) => {
    try {
      let userId = user?.role ? (await supabase.auth.getUser()).data.user?.id : null;
      let needsConfirmation = false;

      // 1. If not logged in and has password, create account
      if (!userId && password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: clientData.email,
          password: password,
          options: {
            data: {
              full_name: clientData.name,
              role: UserRole.CONSUMER
            }
          }
        });
        if (authError) throw authError;

        if (authData.user) {
          userId = authData.user.id;

          // Check if email confirmation is required (no session provided)
          if (!authData.session) {
            needsConfirmation = true;
          }

          // Create profile
          await supabase.from('profiles').insert({
            id: userId,
            name: clientData.name,
            role: UserRole.CONSUMER
          });
        }
      }

      // 2. Insert/Update client record
      const { error } = await supabase.from('clients').insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        state: clientData.state,
        city: clientData.city,
        bill_value: Number(clientData.billValue),
        status: clientData.energyBillFile ? 'Fatura Enviada' : 'Aguardando Documentação',
        provider_id: clientData.selectedProvider?.id || null,
        user_id: userId,
        access_email: clientData.email,
        access_password: password
      });

      if (error) throw error;

      // Only auto-login/refresh if we have a session (no confirmation needed)
      if (!needsConfirmation && userId) {
        fetchEntities(UserRole.CONSUMER, userId);
        updateUserData({ isAlreadyRegistered: true });
      }

      return { success: true, needsConfirmation };
    } catch (err: any) {
      console.error('Error registering client:', err);
      alert(err.message || 'Erro ao processar adesão.');
      return { success: false, needsConfirmation: false };
    }
  };

  const handleGeneratorSignup = (formData: any) => {
    const newGenId = `gen-${Date.now()}`;
    const newGen: EnergyProvider = {
      id: newGenId,
      name: formData.socialName,
      type: 'Solar',
      region: `${formData.locationCity} / ${formData.locationState}`,
      discount: 15,
      rating: 0,
      estimatedSavings: 0,
      color: 'from-emerald-600 to-teal-500',
      icon: 'wb_sunny',
      status: 'pending',
      responsibleName: formData.contactName,
      responsiblePhone: formData.contactPhone,
      capacity: formData.energyCapacity,
      commission: 5
    };

    setGenerators(prev => [...prev, newGen]);
    setCurrentGeneratorData({
      ...currentGeneratorData,
      ...formData
    });

    // Force local login to bypass email validation wait time if requested
    setUser({
      role: UserRole.GENERATOR,
      name: formData.contactName
    });
  };

  const handleAddGenerator = async (gen: EnergyProvider) => {
    const { error } = await supabase.from('generators').insert({
      name: gen.name,
      type: gen.type,
      region: gen.region,
      discount: gen.discount,
      status: gen.status,
      capacity: gen.capacity,
      responsible_name: gen.responsibleName,
      responsible_phone: gen.responsiblePhone
    });
    if (!error) {
      const { data: newUser } = await supabase.auth.getUser();
      if (newUser.user) fetchEntities(user?.role || UserRole.ADMIN, newUser.user.id);
    }
  };

  const updateGeneratorData = (newData: Partial<typeof currentGeneratorData>) => {
    setCurrentGeneratorData(prev => ({ ...prev, ...newData }));
    setGenerators(prev => prev.map(g =>
      g.name === currentGeneratorData.socialName ? {
        ...g,
        discount: newData.discount ?? g.discount,
        commission: newData.commission ?? g.commission,
        capacity: newData.energyCapacity ?? g.capacity,
        region: (newData.locationCity || newData.locationState) ? `${newData.locationCity ?? currentGeneratorData.locationCity} / ${newData.locationState ?? currentGeneratorData.locationState}` : g.region
      } : g
    ));
  };

  const toggleGeneratorStatus = async (id: string, currentStatus: string) => {
    // Logic: If 'active' -> 'pending' (removed from ranking). If 'pending'/'inactive' -> 'active'.
    const newStatus = (currentStatus === 'active') ? 'pending' : 'active';

    const { error } = await supabase.from('generators').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setGenerators(prev => prev.map(g => g.id === id ? { ...g, status: newStatus as any } : g));
    }
  };

  const deleteGenerator = async (id: string) => {
    // Delete from DB
    const { error } = await supabase.from('generators').delete().eq('id', id);

    if (!error) {
      // Update local state
      setGenerators(prev => prev.filter(g => g.id !== id));
      // Optional: If we wanted to delete the Auth User too, we'd need a server-side function (Admin API).
      // For now, removing the generator profile is sufficient for the Dashboard.
    } else {
      console.error('Erro ao excluir usina:', error);
    }
  };

  const updateGenerator = async (id: string, updates: Partial<EnergyProvider>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.responsibleName !== undefined) dbUpdates.responsible_name = updates.responsibleName;
    if (updates.responsiblePhone !== undefined) dbUpdates.responsible_phone = updates.responsiblePhone;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.commission !== undefined) dbUpdates.commission = updates.commission;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.landline !== undefined) dbUpdates.landline = updates.landline;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.annualRevenue !== undefined) dbUpdates.annual_revenue = updates.annualRevenue;
    if (updates.region !== undefined) dbUpdates.region = updates.region;

    const { error } = await supabase.from('generators').update(dbUpdates).eq('id', id);
    if (!error) {
      const { data: newUser } = await supabase.auth.getUser();
      if (newUser.user) fetchEntities(user?.role || UserRole.ADMIN, newUser.user.id);
    } else {
      console.error('Error updating generator:', error);
    }
  };

  const deleteClient = async (id: string) => {
    console.log('Iniciando deleteClient no App.tsx para ID:', id);
    alert('DEBUG: App.tsx recebeu ordem de excluir ID: ' + id);
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      console.log('Deleção no Supabase concluída com sucesso');
      alert('DEBUG: Supabase retornou SUCESSO na exclusão!');
      setGlobalClients(prev => {
        const filtered = prev.filter(c => c.id !== id);
        return filtered;
      });
    } else {
      console.error('Erro ao excluir cliente no Supabase:', error);
      alert('ERRO SUPABASE: ' + error.message);
    }
  };

  const updateClient = async (id: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.billValue !== undefined) dbUpdates.bill_value = Number(updates.billValue);
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.accessEmail !== undefined) dbUpdates.access_email = updates.accessEmail;
    if (updates.accessPassword !== undefined) dbUpdates.access_password = updates.accessPassword;

    const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
    if (!error) {
      const { data: newUser } = await supabase.auth.getUser();
      fetchEntities(user?.role || UserRole.ADMIN, newUser.user?.id || 'admin-bypass');
    } else {
      console.error('Error updating client:', error);
    }
  };

  const handleUpdateProfile = async (updates: { name?: string, phone?: string, avatar?: string }) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // 1. Update Profiles table
    const profileUpdates: any = {};
    if (updates.name) profileUpdates.name = updates.name;
    if (updates.avatar) profileUpdates.avatar_url = updates.avatar;

    await supabase.from('profiles').update(profileUpdates).eq('id', authUser.id);

    // 2. Update Clients table if user_id matches
    const clientUpdates: any = {};
    if (updates.name) clientUpdates.name = updates.name;
    if (updates.phone) clientUpdates.phone = updates.phone;

    await supabase.from('clients').update(clientUpdates).eq('user_id', authUser.id);

    // 3. Refresh State
    setUserData(prev => ({
      ...prev,
      name: updates.name || prev.name,
      phone: updates.phone || prev.phone,
      profileImage: updates.avatar || prev.profileImage
    }));

    // Also update Auth state name if needed
    if (updates.name) {
      setUser(prev => prev ? { ...prev, name: updates.name! } : null);
    }
  };

  const handleLogin = (role: UserRole, name: string) => {
    setUser({ role, name });
    // Force fetch to ensure UI reflects DB state (even for empty DB)
    fetchEntities(role, 'admin-bypass');
    if (role === UserRole.CONSUMER) {
      updateUserData({ isAlreadyRegistered: true });
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AuthPage onLogin={handleLogin} fixedRole={UserRole.ADMIN} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupFlow onComplete={updateUserData} />} />
          <Route path="/generator-signup" element={<GeneratorSignup onComplete={handleGeneratorSignup} />} />

          <Route path="/marketplace" element={<ConsumerMarketplace userData={userData} generators={generators} onSelect={updateUserData} />} />
          <Route path="/savings" element={<ConsumerSavings userData={userData} />} />
          <Route path="/investments" element={<InvestmentPartners userData={userData} onSelect={updateUserData} />} />
          <Route path="/investment-simulation" element={<InvestmentSimulation userData={userData} onComplete={updateUserData} />} />
          <Route path="/finalize" element={<RegistrationFinalize userData={userData} onConfirm={(password) => registerNewClient(userData, password)} onFileSelect={(file) => updateUserData({ energyBillFile: file })} />} />
          <Route path="/consumer-dashboard" element={<ProtectedRoute user={user} isLoading={isLoading} allowedRole={UserRole.CONSUMER}><ConsumerDashboard userData={userData} onUpdateProfile={handleUpdateProfile} /></ProtectedRoute>} />

          <Route path="/generator/*" element={
            <ProtectedRoute user={user} isLoading={isLoading} allowedRole={UserRole.GENERATOR}>
              <GeneratorDashboard
                generatorData={currentGeneratorData}
                onUpdate={updateGeneratorData}
                clients={globalClients.filter(c => c.providerName === currentGeneratorData.socialName)}
                negotiations={globalNegotiations.filter(n => n.providerName === currentGeneratorData.socialName)}
              />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute user={user} isLoading={isLoading} allowedRole={UserRole.ADMIN}>
              <AdminDashboard
                generators={generators}
                onToggleStatus={toggleGeneratorStatus}
                onDeleteGenerator={deleteGenerator}
                onUpdateGenerator={updateGenerator}
                onAddGenerator={handleAddGenerator}
                onBatchAddGenerators={async (batch) => {
                  const session = await supabase.auth.getSession();
                  const uid = session.data.session?.user.id;

                  // Add user_id to each generator in the batch
                  const payload = batch.map(gen => ({
                    user_id: uid, // Important for RLS
                    name: gen.name,
                    type: gen.type,
                    region: gen.region,
                    discount: gen.discount,
                    status: gen.status,
                    capacity: gen.capacity,
                    responsible_name: gen.responsibleName,
                    responsible_phone: gen.responsiblePhone,
                    commission: gen.commission,
                    access_email: gen.accessEmail,
                    access_password: gen.accessPassword,
                    company: gen.company,
                    landline: gen.landline,
                    city: gen.city,
                    website: gen.website,
                    annual_revenue: gen.annualRevenue
                  }));

                  // Use RPC to bypass RLS for this specific operation
                  const { error } = await supabase.rpc('batch_insert_generators', { payload });

                  if (!error) {
                    if (uid) {
                      await fetchEntities(user?.role || UserRole.ADMIN, uid);
                    } else {
                      // Manual state update fallback
                      const { data: list } = await supabase.from('generators').select('*');
                      if (list) {
                        setGenerators(list.map((g: any) => ({
                          ...g,
                          rating: Number(g.rating),
                          discount: Number(g.discount),
                          estimatedSavings: Number(g.estimated_savings),
                          commission: Number(g.commission),
                          responsibleName: g.responsible_name,
                          responsiblePhone: g.responsible_phone,
                          icon: 'wb_sunny',
                          color: 'from-emerald-600 to-teal-500',
                          logoUrl: g.logo_url || null,
                          accessEmail: g.access_email,
                          accessPassword: g.access_password
                        })));
                      }
                    }
                  } else {
                    console.error('Batch import error:', error);
                    alert('Erro ao importar usinas. Detalhes: ' + error.message);
                  }
                }}
                clients={globalClients}
                onDeleteClient={deleteClient}
                onUpdateClient={updateClient}
                concessionaires={concessionaires}
                onAddConcessionaire={async (c) => {
                  const { error } = await supabase.from('concessionaires').insert({
                    name: c.name,
                    responsible: c.responsible,
                    contact: c.contact,
                    status: c.status,
                    region: c.region
                  });
                  if (!error) {
                    const { data: newUser } = await supabase.auth.getUser();
                    if (newUser.user) fetchEntities(user?.role || UserRole.ADMIN, newUser.user.id);
                  }
                }}
                onUpdateConcessionaire={async (id, data) => {
                  const { error } = await supabase.from('concessionaires').update(data).eq('id', id);
                  if (!error) {
                    const { data: newUser } = await supabase.auth.getUser();
                    if (newUser.user) fetchEntities(user?.role || UserRole.ADMIN, newUser.user.id);
                  }
                }}
                onReset={resetSystem}
              />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            user?.role === UserRole.ADMIN ? <Navigate to="/admin" /> :
              user?.role === UserRole.GENERATOR ? <Navigate to="/generator" /> :
                <Navigate to="/consumer-dashboard" />
          } />
        </Routes>

        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100]">
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
            <span className="material-symbols-outlined hidden dark:block">light_mode</span>
          </button>


        </div>
      </div>
    </HashRouter>
  );
};

export default App;
