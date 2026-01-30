
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { EnergyProvider, Concessionaire } from '../types';
import { AdminService } from '../lib/services/admin.service';

interface SystemContextType {
    generators: EnergyProvider[];
    concessionaires: Concessionaire[];
    clients: any[];
    isLoading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
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

    const refreshData = async () => {
        console.log('[SystemContext] refreshData called...');
        if (!isMountedRef.current) {
            console.log('[SystemContext] Component not mounted, skipping.');
            return;
        }
        setIsLoading(true);
        setError(null);

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

            // Fetch with retry for each service
            genData = (await fetchWithRetry(() => AdminService.fetchGenerators())) || [];
            console.log('[SystemContext] Generators fetched:', genData.length);

            concData = (await fetchWithRetry(() => AdminService.fetchConcessionaires())) || [];
            console.log('[SystemContext] Concessionaires fetched:', concData.length);

            clientData = (await fetchWithRetry(() => AdminService.fetchClients())) || [];
            console.log('[SystemContext] Clients fetched:', clientData.length);

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
                logoUrl: g.logo_url || null,
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

        // Delay initial fetch slightly to avoid race condition with Supabase SDK initialization
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                refreshData();
            }
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timeoutId);
        };
    }, []);

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
