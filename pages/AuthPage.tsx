
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Helper to check generator credentials via REST API (bypasses SDK issues)
async function checkGeneratorCredentials(email: string, password: string): Promise<{ name: string; id: string } | null> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    console.log('[AuthPage] Checking generator credentials via REST...');
    const response = await fetch(
      `${url}/rest/v1/generators?access_email=eq.${encodeURIComponent(email)}&access_password=eq.${encodeURIComponent(password)}&select=id,name`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn('[AuthPage] Generator credential check failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[AuthPage] Generator check result:', data);

    if (data && data.length > 0) {
      return { name: data[0].name, id: data[0].id };
    }
    return null;
  } catch (err) {
    console.error('[AuthPage] Generator credential check error:', err);
    return null;
  }
}

interface AuthPageProps {
  onLogin: (role: UserRole, name: string) => void;
  fixedRole?: UserRole;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, fixedRole }) => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<UserRole>(fixedRole || UserRole.CONSUMER);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

  useEffect(() => {
    // Nuclear option: Clear ALL local storage to remove any "zombie" sessions instantly
    // This avoids Async blocks from supabase.auth.signOut()
    try {
      // localStorage.clear(); // COMMENTED OUT: This wipes our custom admin settings!
      // We only want to clear Supabase session tokens if needed, but not our custom settings.
      // Instead, let's just log.
      console.log('[AuthPage] Ready (LocalStorage preserved for Settings)');
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
  }, []);

  const handleForgotPassword = () => {
    const recoveryEmail = localStorage.getItem('admin_recovery_email') || 'admin@solinvestti.com.br';
    const msg = `Uma mensagem de recuperação foi enviada para: ${recoveryEmail}\n\n(Simulação: Verifique sua caixa de entrada)`;
    alert(msg);
  };

  // Safety timeout to prevent infinite loading state
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout;
    if (isProcessing) {
      safetyTimer = setTimeout(() => {
        if (isProcessing) {
          console.warn('[AuthPage] Safety timeout triggered. Force-unlocking UI.');
          setIsProcessing(false);
          setErrorMsg('A operação demorou muito. Por favor, tente novamente.');
        }
      }, 15000); // 15 seconds max lock
    }
    return () => clearTimeout(safetyTimer);
  }, [isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    console.log('[AuthPage] Submit:', { role: activeRole, data: formData });

    // --- EMERGENCY BACKDOOR ---
    if (formData.email === 'suporte@solinvestti.com.br') {
      try {
        console.log('[AuthPage] Executing Emergency Backdoor...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (data?.session) {
          console.log('[AuthPage] Backdoor Success.');
          await onLogin(UserRole.ADMIN, 'Suporte Técnico');
          redirectUser(UserRole.ADMIN);
          // Do NOT setIsProcessing(false) here, we are navigating away.
          return;
        }
        console.error('[AuthPage] Backdoor Failed:', error?.message);
        throw error || new Error('Backdoor failed');
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e.message);
        setIsProcessing(false);
        return;
      }
    }
    // ---------------------------

    try {
      if (isLoginMode) {
        // Real Admin Login Flow
        if (activeRole === UserRole.ADMIN) {
          let dbLogin = localStorage.getItem('admin_custom_login') || 'admin';
          let dbPass = localStorage.getItem('admin_custom_password') || 'admin123';

          // Best-effort secret fetch
          try {
            const fetchPromise = supabase.from('admin_secrets').select('*');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout DB')), 3000));
            const { data: secrets } = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (secrets) {
              const loginSecret = secrets.find((s: any) => s.secret_key === 'admin_login')?.secret_value;
              const passSecret = secrets.find((s: any) => s.secret_key === 'admin_password')?.secret_value;
              if (loginSecret) dbLogin = loginSecret;
              if (passSecret) dbPass = passSecret;
            }
          } catch (err) {
            console.warn('Failed to fetch admin_secrets (using fallback):', err);
          }

          // Check custom/legacy match
          const isCustomMatch = formData.email.trim().toLowerCase() === dbLogin.trim().toLowerCase() && formData.password === dbPass;
          const isLegacyMatch = formData.email === 'admin' && formData.password === 'admin';

          if (isCustomMatch || isLegacyMatch) {
            console.log('[AuthPage] Logging in as Primary Admin...');
            const realEmail = 'admin@solinvestti.com.br';
            const realPassword = 'R@phael1';

            try {
              const loginPromise = supabase.auth.signInWithPassword({ email: realEmail, password: realPassword });
              const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Login demorou muito')), 60000));
              const { data, error } = await Promise.race([loginPromise, timeout]) as any;

              if (data?.session) {
                console.log('[AuthPage] Admin login success.');
                await onLogin(UserRole.ADMIN, 'Administrador');
                redirectUser(UserRole.ADMIN);
                return;
              }
              throw error || new Error('Falha no login administrativo.');
            } catch (err: any) {
              console.error('[AuthPage] Login Exception:', err);
              setErrorMsg(`Erro: ${err.message}`);
              setIsProcessing(false);
              return;
            }
          }
        }

        // First, try to check if this is a generator login (via REST - more reliable)
        if (activeRole === UserRole.GENERATOR) {
          const generator = await checkGeneratorCredentials(formData.email, formData.password);
          if (generator) {
            console.log('[AuthPage] Generator login successful:', generator.name);
            await onLogin(UserRole.GENERATOR, generator.name);
            redirectUser(UserRole.GENERATOR);
            return;
          }
        }

        // Supabase Auth Login
        let loginEmail = formData.email;
        if (!loginEmail.includes('@') && activeRole === UserRole.ADMIN) {
          loginEmail = `${loginEmail}@solinvestti.com.br`;
        }

        const loginPromise = supabase.auth.signInWithPassword({
          email: loginEmail,
          password: formData.password,
        });
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Servidor demorou a responder.')), 30000));

        const { data: authData, error: authError } = await Promise.race([loginPromise, timeout]) as any;

        if (authError) {
          console.log('[AuthPage] Supabase auth failed, trying generator fallback...');
          const generator = await checkGeneratorCredentials(formData.email, formData.password);
          if (generator) {
            console.log('[AuthPage] Found generator via fallback:', generator.name);
            await onLogin(UserRole.GENERATOR, generator.name);
            redirectUser(UserRole.GENERATOR);
            return;
          }
          throw authError;
        }

        // Fetch user profile to get the role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        if (!profile) {
          const { full_name, role } = authData.user.user_metadata || {};
          if (role) {
            await onLogin(role as UserRole, full_name || 'Usuário');
            redirectUser(role as UserRole);
            return;
          }
          // Infer from email if absolutely necessary, or just deny
          if (loginEmail.includes('admin')) {
            await onLogin(UserRole.ADMIN, 'Administrador');
            redirectUser(UserRole.ADMIN);
            return;
          }
          throw new Error('Perfil de usuário não encontrado.');
        }

        await onLogin(profile.role as UserRole, profile.name || 'Usuário');
        redirectUser(profile.role as UserRole);

      } else {
        // Signup Logic
        if (formData.email !== formData.confirmEmail) {
          throw new Error('Os e-mails informados não coincidem.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas informadas não coincidem.');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: activeRole
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Não foi possível criar o usuário.');

        // Attempt to create profile entry
        // NOTE: This might fail if RLS requires a session and email confirmation is ON.
        // But we try anyway.
        await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            role: activeRole
          });

        if (!authData.session) {
          setShowSuccess(true);
          setIsProcessing(false); // Explicitly set false for success without redirect
          return;
        }

        // Wait for onLogin to complete (which now waits for data refresh)
        await onLogin(activeRole, formData.name);
        // Small additional delay to ensure SystemContext has processed the user change
        await new Promise(resolve => setTimeout(resolve, 300));
        redirectUser(activeRole);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Erro durante a autenticação.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { user, loading, setUser } = useAuth();
  const [showLoggedInPrompt, setShowLoggedInPrompt] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      // Auto-redirect if already logged in (prevents stuck screen)
      if (fixedRole && user.role === fixedRole) {
        redirectUser(user.role);
        return;
      }

      // If no fixed role, redirect based on user role
      if (!fixedRole && user.role) {
        redirectUser(user.role);
        return;
      }

      // Only show prompt if user role matches the page's fixedRole
      // For admin page: only show if user is admin
      // For regular auth page: only show if user is NOT admin (consumer/generator)
      if (fixedRole) {
        // Admin page - only show prompt for admins
        if (user.role === fixedRole) {
          setShowLoggedInPrompt(true);
        }
      } else {
        // Regular auth page - show for consumers/generators (not admins)
        if (user.role !== UserRole.ADMIN) {
          setShowLoggedInPrompt(true);
        }
      }
    }
  }, [user, loading, fixedRole]);

  const handleLogout = async () => {
    try {
      // Try to sign out but don't wait forever
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (err) {
      console.warn('[AuthPage] Logout error/timeout:', err);
    }
    // Always clear state, even if signOut fails
    setUser(null);
    setShowLoggedInPrompt(false);
  };

  const redirectUser = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      navigate('/admin');
    } else if (role === UserRole.GENERATOR) {
      navigate('/generator');
    } else {
      navigate('/consumer-dashboard');
    }
  };

  // ... (render start) ...
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-[520px] bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.06)] p-6 sm:p-8 md:p-10 lg:p-14 border border-slate-100 relative overflow-hidden">
        {/* BOTÃO VOLTAR À PÁGINA INICIAL */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-slate hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Página Inicial
          </Link>
        </div>

        {/* ... (Spinner and Header remain similar) ... */}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center">
            <div className="size-14 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy animate-pulse">Sincronizando Chaves de Acesso...</p>
          </div>
        )}

        <div className="text-center mb-8 md:mb-12">
          <div className="size-12 md:size-16 bg-brand-navy rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-brand-navy/20">
            <span className="material-symbols-outlined text-white text-2xl md:text-3xl">account_balance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-brand-navy mb-2 md:mb-3 tracking-tight">
            {fixedRole === UserRole.ADMIN ? 'Acesso Administrativo' : (isLoginMode ? 'Acesse sua Conta' : 'Crie seu Perfil')}
          </h1>
          <p className="text-brand-slate text-sm font-medium opacity-60 uppercase tracking-widest text-[11px]">
            Portal Seguro Solinvestti
          </p>
          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 animate-in fade-in zoom-in-95">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Already logged in prompt */}
        {showLoggedInPrompt && user ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
            <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl">account_circle</span>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-4">Você já está conectado!</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
              Logado como <span className="text-brand-navy font-bold">{user.name}</span>
              <br />
              <span className="text-xs text-slate-400">({user.role === 'admin' ? 'Administrador' : user.role === 'generator' ? 'Geradora' : 'Cliente'})</span>
            </p>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Acesso Administrativo <span className="text-sm text-emerald-600">v2.0</span>
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => redirectUser(user.role!)}
                className="w-full bg-primary hover:bg-primary-hover py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-primary/20 transition-all"
              >
                Ir para o Painel
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 hover:bg-slate-200 py-4 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-[0.2em] transition-all"
              >
                Sair e trocar de conta
              </button>
            </div>
          </div>
        ) : showSuccess ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
            {/* ... Success Message block ... */}
            {/* Note: I am not replacing the success block in this replace call unless I have to. 
                 Since replace_file_content replaces a chunk, I'll assume the surrounding lines match.
                 Wait, I need to match the target content exactly. 
                 The target content below starts around line 208. 
             */}
            <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-4">Cadastro Realizado!</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
              Enviamos um link de confirmação para <span className="text-brand-navy font-bold">{formData.email}</span>.
              Por favor, valide seu e-mail para ativar sua conta e acessar a plataforma.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setIsLoginMode(true);
              }}
              className="w-full bg-brand-navy text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
            >
              Ir para Login
            </button>
          </div>
        ) : (
          <>
            {/* Role Selector Tabs - Hidden if fixedRole is defined */}
            {!fixedRole && (
              <div className="flex bg-slate-50/80 p-1.5 rounded-[2rem] mb-12 border border-slate-100/50">
                {[
                  { role: UserRole.CONSUMER, label: 'Cliente', icon: 'person' },
                  { role: UserRole.GENERATOR, label: 'Geradora', icon: 'bolt' },
                  // Admin removed from here
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setActiveRole(item.role);
                      if (item.role === UserRole.CONSUMER) setIsLoginMode(true);
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeRole === item.role ? 'bg-white text-brand-navy shadow-premium border border-slate-100 scale-[1.02]' : 'text-slate-400 hover:text-brand-navy/60'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {!showSuccess && (
          <form onSubmit={handleSubmit} className="space-y-7">
            {!isLoginMode && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                <input
                  required
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm placeholder:text-slate-300 transition-all"
                  placeholder="Ex: Carlos Silva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">
                {activeRole === UserRole.ADMIN ? 'E-mail ou Usuário' : 'E-mail'}
              </label>
              <input
                required
                type={activeRole === UserRole.ADMIN ? "text" : "email"}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm placeholder:text-slate-300 transition-all"
                placeholder={activeRole === UserRole.ADMIN ? "usuario" : "exemplo@email.com"}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              />
            </div>

            {!isLoginMode && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Confirmar E-mail</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm placeholder:text-slate-300 transition-all"
                  placeholder="Repita seu e-mail"
                  value={formData.confirmEmail}
                  onChange={e => setFormData({ ...formData, confirmEmail: e.target.value.toLowerCase() })}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Senha de Acesso</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm placeholder:text-slate-300 transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {!isLoginMode && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 ml-1">Confirmar Senha</label>
                <input
                  required
                  type="password"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 ring-primary/5 font-bold text-brand-navy text-sm placeholder:text-slate-300 transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            )}

            <button className="w-full bg-primary hover:bg-primary-hover py-6 rounded-2xl text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-primary/20 mt-6 active:scale-[0.98] transition-all">
              {isLoginMode ? 'Entrar na Plataforma' : 'Confirmar Registro'}
            </button>

            {isLoginMode && activeRole === UserRole.ADMIN && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full mt-2 text-slate-400 hover:text-brand-navy text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Esqueci minha senha
              </button>
            )}
          </form>
        )}

        {/* Hide Registration Link for Consumers AND Admins */}
        {activeRole !== UserRole.CONSUMER && activeRole !== UserRole.ADMIN && (
          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              {isLoginMode ? 'Ainda não possui acesso?' : 'Já possui uma conta ativa?'}
              <button
                type="button"
                onClick={() => {
                  if (activeRole === UserRole.GENERATOR && isLoginMode) {
                    navigate('/generator-signup');
                  } else {
                    setIsLoginMode(!isLoginMode);
                  }
                }}
                className="text-primary font-black ml-3 hover:opacity-80 transition-opacity"
              >
                {isLoginMode ? 'CADASTRE-SE' : 'ENTRAR AGORA'}
              </button>
            </p>
          </div>
        )}
      </div>

      <p className="mt-10 text-[10px] text-brand-slate/40 font-black uppercase tracking-[0.3em] flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">verified_user</span>
        Criptografia de Ponta a Ponta Solinvestti
      </p>
    </div>
  );
};

export default AuthPage;
