
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { EnergyProvider, Concessionaire } from '../types';
import { AdminService } from '../lib/services/admin.service';

interface SystemContextType {
    generators: EnergyProvider[];
    concessionaires: Concessionaire[];
    clients: any[];
    isLoading: boolean;
    error: string | null;
    refreshData: (force?: boolean) => Promise<void>;
    maintenanceMode: boolean;
    toggleMaintenanceMode: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [generators, setGenerators] = useState<EnergyProvider[]>([]);
    const [concessionaires, setConcessionaires] = useState<Concessionaire[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const isMountedRef = useRef(true);
    const retryCountRef = useRef(0);

    useEffect(() => {
        const stored = localStorage.getItem('solinvestti_maintenance');
        if (stored) setMaintenanceMode(JSON.parse(stored));
    }, []);

    const toggleMaintenanceMode = () => {
        const newVal = !maintenanceMode;
        setMaintenanceMode(newVal);
        localStorage.setItem('solinvestti_maintenance', JSON.stringify(newVal));
    };

    const refreshData = async (force?: boolean) => {
        console.log('[SystemContext] refreshData called...', { force });
        if (!isMountedRef.current) {
            console.log('[SystemContext] Component not mounted, skipping.');
            return;
        }
        // CRITICAL: Check page location FIRST before any async calls
        // App uses HashRouter, so check hash not pathname (pathname is always '/')
        const hash = window.location.hash || '';

        // Only skip fetch on the actual landing page OR login/auth pages
        // Public routes like /signup, /marketplace NEED generators to be loaded
        const isActualLandingPage = hash === '' || hash === '#/' || hash === '#';
        const isLoginPage = hash.includes('login') || hash.includes('auth');
        const isPublicFlowPage = hash.includes('signup') || hash.includes('marketplace') ||
            hash.includes('savings') || hash.includes('investment') ||
            hash.includes('finalize');

        // Skip only if on landing/login AND NOT on public flow pages AND NOT forced
        if ((isActualLandingPage || isLoginPage) && !isPublicFlowPage && !force) {
            console.log('[SystemContext] On Landing/Login Page (and not forced), skipping data fetch immediately.');
            setIsLoading(false);
            return;
        }

        console.log('[SystemContext] Proceeding with data fetch for:', hash);

        setIsLoading(true);
        setError(null);

        // Check if we have a session first (only if not on login page)
        const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());

        try {
            console.log('[SystemContext] Starting data fetch...');
            // Fetch each data type independently to prevent one failure from breaking all
            let genData: any[] = [];
            let concData: any[] = [];
            let clientData: any[] = [];

            // Helper to retry fetch on AbortError
            const fetchWithRetry = async <T,>(
                fetcher: () => Promise<T>,
                maxRetries = 3
            ): Promise<T | null> => {
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        return await fetcher();
                    } catch (err: any) {
                        if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) {
                            // Wait a bit before retrying
                            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
                            continue;
                        }
                        console.error('Fetch error:', err);
                        return null;
                    }
                }
                return null;
            };

            // ALWAYS fetch generators (public data for marketplace)
            // This allows unauthenticated users to see available providers during signup
            genData = (await fetchWithRetry(() => AdminService.fetchGenerators())) || [];
            console.log('[SystemContext] Generators fetched:', genData.length);

            // Only fetch sensitive data if user is authenticated
            if (session) {
                concData = (await fetchWithRetry(() => AdminService.fetchConcessionaires())) || [];
                console.log('[SystemContext] Concessionaires fetched:', concData.length);

                clientData = (await fetchWithRetry(() => AdminService.fetchClients())) || [];
                console.log('[SystemContext] Clients fetched:', clientData.length);
            } else {
                console.log('[SystemContext] No session, skipping sensitive data fetch (clients/concessionaires)');
            }

            // Only update state if component is still mounted
            if (!isMountedRef.current) return;

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
                logoUrl: g.logoUrl || g.logo_url || null,
                accessEmail: g.access_email,
                accessPassword: g.access_password,
                annualRevenue: Number(g.annual_revenue),
                company: g.company,
                landline: g.landline,
                city: g.city,
                website: g.website
            })));

            setConcessionaires(concData || []);
            setClients((clientData || []).map(c => ({
                ...c,
                billValue: Number(c.bill_value),
                date: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'N/A',
                accessEmail: c.access_email,
                accessPassword: c.access_password
            })));
        } catch (err: any) {
            // Only log non-abort errors
            if (err?.name !== 'AbortError' && !err?.message?.includes('AbortError')) {
                console.error('System Refresh Error:', err);
                setError(err.message || 'Erro deconhecido ao carregar dados.');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        retryCountRef.current = 0;

        // Handler for hash changes (route navigation in HashRouter)
        const handleHashChange = () => {
            const hash = window.location.hash || '';
            const isPublicFlowPage = hash.includes('signup') || hash.includes('marketplace') ||
                hash.includes('savings') || hash.includes('investment') ||
                hash.includes('finalize');

            console.log('[SystemContext] Hash changed to:', hash, 'isPublicFlow:', isPublicFlowPage, 'generators:', generators.length);

            // If navigating to a public flow page and generators are empty, force refresh
            if (isPublicFlowPage && generators.length === 0) {
                console.log('[SystemContext] Forcing refresh for public flow page with empty generators');
                refreshData(true);
            }
        };

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Delay initial fetch slightly to avoid race condition with Supabase SDK initialization
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                refreshData();
            }
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timeoutId);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [generators.length]);

    return (
        <SystemContext.Provider value={{ generators, concessionaires, clients, isLoading, error, refreshData, maintenanceMode, toggleMaintenanceMode }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) throw new Error('useSystem must be used within SystemProvider');
    return context;
};
