
import { supabase } from '../supabase';
import { UserRole, EnergyProvider, Concessionaire } from '../../types';

export const AdminService = {
    async fetchGenerators() {
        const { data, error } = await supabase.from('generators').select('*').order('name', { ascending: true });
        if (error) throw error;
        // Map snake_case to camelCase for frontend
        return data?.map(g => ({
            ...g,
            responsibleName: g.responsible_name,
            responsiblePhone: g.responsible_phone,
            annualRevenue: g.annual_revenue,
            estimatedSavings: g.estimated_savings,
            accessEmail: g.access_email,
            accessPassword: g.access_password
        })) || [];
    },

    async batchAddGenerators(generators: EnergyProvider[]) {
        const dbData = generators.map(g => ({
            name: g.name,
            type: g.type,
            region: g.region,
            discount: g.discount,
            rating: g.rating || 5,
            estimated_savings: g.estimatedSavings || 0,
            commission: g.commission,
            status: g.status,
            color: g.color,
            icon: g.icon,
            responsible_name: g.responsibleName,
            responsible_phone: g.responsiblePhone,
            annual_revenue: g.annualRevenue,
            access_email: g.accessEmail,
            access_password: g.accessPassword,
            capacity: g.capacity,
            city: g.city,
            website: g.website,
            company: g.company,
            landline: g.landline
        }));

        const { error } = await supabase.from('generators').insert(dbData);
        if (error) throw error;
    },

    async fetchConcessionaires() {
        const { data, error } = await supabase.from('concessionaires').select('*');
        if (error) throw error;
        return data;
    },

    async fetchClients() {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        return data;
    },

    async addGenerator(gen: any) {
        const dbData = {
            name: gen.name,
            type: gen.type,
            region: gen.region,
            discount: gen.discount,
            rating: gen.rating,
            estimated_savings: gen.estimatedSavings,
            commission: gen.commission,
            status: gen.status,
            responsible_name: gen.responsibleName,
            responsible_phone: gen.responsiblePhone,
            annual_revenue: gen.annualRevenue,
            access_email: gen.accessEmail,
            access_password: gen.accessPassword,
            capacity: gen.capacity,
            city: gen.city,
            website: gen.website,
            company: gen.company,
            landline: gen.landline,
            color: gen.color,
            icon: gen.icon
        };
        const { error } = await supabase.from('generators').insert(dbData);
        if (error) throw error;
    },

    async updateGenerator(id: string, updates: any) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.region !== undefined) dbUpdates.region = updates.region;
        if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
        if (updates.estimatedSavings !== undefined) dbUpdates.estimated_savings = updates.estimatedSavings;
        if (updates.commission !== undefined) dbUpdates.commission = updates.commission;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.responsibleName !== undefined) dbUpdates.responsible_name = updates.responsibleName;
        if (updates.responsiblePhone !== undefined) dbUpdates.responsible_phone = updates.responsiblePhone;
        if (updates.annualRevenue !== undefined) dbUpdates.annual_revenue = updates.annualRevenue;
        if (updates.accessEmail !== undefined) dbUpdates.access_email = updates.accessEmail;
        if (updates.accessPassword !== undefined) dbUpdates.access_password = updates.accessPassword;
        if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.company !== undefined) dbUpdates.company = updates.company;
        if (updates.landline !== undefined) dbUpdates.landline = updates.landline;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;

        const { error } = await supabase.from('generators').update(dbUpdates).eq('id', id);
        if (error) throw error;
    },

    async deleteGenerator(id: string) {
        const { error } = await supabase.from('generators').delete().eq('id', id);
        if (error) throw error;
    },

    async updateClient(id: string, updates: any) {
        const { error } = await supabase.from('clients').update(updates).eq('id', id);
        if (error) throw error;
    },

    async deleteClient(id: string) {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
    },

    async addConcessionaire(data: any) {
        const { error } = await supabase.from('concessionaires').insert(data);
        if (error) throw error;
    },

    async updateConcessionaire(id: string, updates: any) {
        const { error } = await supabase.from('concessionaires').update(updates).eq('id', id);
        if (error) throw error;
    },

    async toggleGeneratorStatus(id: string, newStatus: string) {
        const { error } = await supabase.rpc('toggle_generator_status', {
            gen_id: id,
            new_status: newStatus
        });
        if (error) throw error;
    },

    async activateAllGenerators() {
        const { data, error } = await supabase.rpc('activate_all_generators');
        if (error) throw error;
        return data;
    },

    async resetDatabase() {
        const { error } = await supabase.rpc('reset_database');
        if (error) throw error;
    }
};
