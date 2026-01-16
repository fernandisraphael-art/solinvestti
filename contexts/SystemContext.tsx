
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EnergyProvider, Concessionaire } from '../types';
import { AdminService } from '../lib/services/admin.service';

interface SystemContextType {
    generators: EnergyProvider[];
    concessionaires: Concessionaire[];
    clients: any[];
    isLoading: boolean;
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
    const [maintenanceMode, setMaintenanceMode] = useState(false);

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
        setIsLoading(true);
        try {
            console.log('SystemContext: Initiating refreshData...');
            const [genData, concData, clientData] = await Promise.all([
                AdminService.fetchGenerators(),
                AdminService.fetchConcessionaires(),
                AdminService.fetchClients()
            ]);

            console.log('SystemContext: Data fetched successfully:', {
                genCount: genData?.length,
                concCount: concData?.length,
                clientCount: clientData?.length
            });

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

            setConcessionaires(concData);
            setClients(clientData.map(c => ({
                ...c,
                billValue: Number(c.bill_value),
                date: new Date(c.created_at).toLocaleDateString('pt-BR'),
                accessEmail: c.access_email,
                accessPassword: c.access_password
            })));
        } catch (err) {
            console.error('System Refresh Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <SystemContext.Provider value={{ generators, concessionaires, clients, isLoading, refreshData, maintenanceMode, toggleMaintenanceMode }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) throw new Error('useSystem must be used within SystemProvider');
    return context;
};
