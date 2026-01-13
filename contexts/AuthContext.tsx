
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { AuthService } from '../lib/services/auth.service';

interface AuthContextType {
    user: { role: UserRole | null, name: string } | null;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<{ role: UserRole | null, name: string } | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ role: UserRole | null, name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const session = await AuthService.getSession();
                if (session) {
                    const profile = await AuthService.fetchProfile(session.user.id);
                    setUser({ role: profile.role as UserRole, name: profile.name || 'Usuário' });
                }
            } catch (err) {
                console.error('Auth Init Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = AuthService.onAuthStateChange(async (_event, session) => {
            if (session) {
                const profile = await AuthService.fetchProfile(session.user.id);
                setUser({ role: profile.role as UserRole, name: profile.name || 'Usuário' });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
