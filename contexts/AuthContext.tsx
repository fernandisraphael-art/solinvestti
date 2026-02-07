
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { AuthService } from '../lib/services/auth.service';

interface AuthContextType {
    user: { role: UserRole | null, name: string } | null;
    isLoading: boolean;
    loading: boolean; // Alias for isLoading
    setUser: React.Dispatch<React.SetStateAction<{ role: UserRole | null, name: string } | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ role: UserRole | null, name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const initAuth = async () => {
            // AGGRESSIVE: Set loading to false after just 500ms to ensure UI never hangs
            const fastUnlock = setTimeout(() => {
                console.log('[AuthContext] Fast unlock - UI ready');
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }, 500);

            try {
                const session = await AuthService.getSession();
                clearTimeout(fastUnlock);

                if (session && isMountedRef.current) {
                    const profile = await AuthService.fetchProfile(session.user.id);
                    setUser({ role: profile.role as UserRole, name: profile.name || 'Usuário' });
                }
            } catch (err: any) {
                clearTimeout(fastUnlock);
                // Silently ignore AbortError
                if (err?.name !== 'AbortError' && !err?.message?.includes('AbortError')) {
                    console.error('Auth Init Error:', err);
                }
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = AuthService.onAuthStateChange(async (_event, session) => {
            if (!isMountedRef.current) return;

            if (session) {
                try {
                    const profile = await AuthService.fetchProfile(session.user.id);
                    if (isMountedRef.current) {
                        setUser({ role: profile.role as UserRole, name: profile.name || 'Usuário' });
                    }
                } catch (err: any) {
                    if (err?.name !== 'AbortError' && !err?.message?.includes('AbortError')) {
                        console.error('Auth Change Error:', err);
                    }
                }
            } else {
                if (isMountedRef.current) {
                    setUser(null);
                }
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, loading: isLoading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
