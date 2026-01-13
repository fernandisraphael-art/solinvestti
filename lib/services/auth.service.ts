
import { supabase } from '../supabase';
import { UserRole } from '../../types';

export const AuthService = {
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async fetchProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, name, avatar_url')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    onAuthStateChange(callback: (event: any, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
