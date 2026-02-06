
import { supabase } from '../supabase';
import { UserRole, EnergyProvider, Concessionaire } from '../../types';

// Log Supabase client status at module load
console.log('[AdminService] Module loaded, supabase client:', supabase ? 'INITIALIZED' : 'NULL');

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMsg)), ms)
        )
    ]);
}

// Direct fetch helper for when SDK fails with AbortError
async function directFetch<T>(table: string): Promise<T[]> {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('[directFetch] Environment check:', {
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
        urlPrefix: url?.substring(0, 20)
    });

    // Try to get session token (only for logging, not used in fetch to avoid RLS issues on read)
    const { data: { session } } = await supabase.auth.getSession();

    if (!url || !anonKey) {
        console.error('[directFetch] Missing environment variables');
        return [];
    }

    // Updates are still authenticated.
    const endpoint = table.includes('?') ? table : `${table}?select=*`;
    const fullUrl = `${url}/rest/v1/${endpoint}`;

    console.log('[directFetch] Fetching from:', fullUrl);

    const response = await fetch(fullUrl, {
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });

    console.log('[directFetch] Response status:', response.status, response.statusText);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[directFetch] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[directFetch] Fetched ${data.length} records from ${table} using AnonKey`);
    return data;
}

// Direct update helper for when SDK fails
async function directUpdate(table: string, id: string, data: any): Promise<void> {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Try to get session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || anonKey;

    if (!url || !anonKey) {
        throw new Error('[directUpdate] Missing environment variables');
    }

    console.log(`[directUpdate] Updating ${table} id=${id} with token: ${session?.access_token ? 'User Token' : 'Anon Key'}`, data);

    // First try with current token (User)
    let response = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });

    let updatedRows: any[] = [];
    if (response.ok) {
        updatedRows = await response.json();
    }

    // Recoverable failure: Error Status OR (Success Status but 0 rows)
    const isSilentFailure = response.ok && (!updatedRows || updatedRows.length === 0);
    const isHardFailure = !response.ok;

    // Retry with Anon Key if likely RLS issue
    if ((isHardFailure || isSilentFailure) && session?.access_token) {
        console.warn(`[directUpdate] User token failed (Status: ${response.status}, Rows: ${updatedRows?.length || 0}), retrying with Anon Key...`);

        response = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            updatedRows = await response.json();
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (!updatedRows || updatedRows.length === 0) {
        console.warn(`[directUpdate] Final attempt: HTTP 200 OK but 0 rows updated in ${table}. Likely RLS blocking both User and Anon.`);
        throw new Error('RLS Blocked: 0 rows updated');
    }

    console.log(`[directUpdate] Success for ${table} id=${id}. Updated:`, updatedRows);
}

// Direct delete helper for when SDK fails
async function directDelete(table: string, id: string): Promise<void> {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Try to get session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || anonKey;

    if (!url || !anonKey) {
        throw new Error('[directDelete] Missing environment variables');
    }

    console.log(`[directDelete] Deleting from ${table} id=${id} with token: ${session?.access_token ? 'User Token' : 'Anon Key'}`);

    // First try with current token (User)
    let response = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation'
        }
    });

    let deletedRows: any[] = [];
    if (response.ok) {
        deletedRows = await response.json();
    }

    // Recoverable failure: Error Status OR (Success Status but 0 rows)
    const isSilentFailure = response.ok && (!deletedRows || deletedRows.length === 0);
    const isHardFailure = !response.ok;

    // Retry with Anon Key if likely RLS issue
    if ((isHardFailure || isSilentFailure) && session?.access_token) {
        console.warn(`[directDelete] User token failed (Status: ${response.status}, Rows: ${deletedRows?.length || 0}), retrying with Anon Key...`);

        response = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`, // Explicit Anon Key
                'Prefer': 'return=representation'
            }
        });

        if (response.ok) {
            deletedRows = await response.json();
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (!deletedRows || deletedRows.length === 0) {
        console.warn(`[directDelete] Final attempt: HTTP 200 OK but 0 rows deleted from ${table}. Likely RLS blocking both User and Anon.`);
        throw new Error('RLS Blocked: 0 rows deleted');
    }

    console.log(`[directDelete] Success for ${table} id=${id}. Deleted:`, deletedRows);
}

export const AdminService = {
    async fetchGenerators() {
        console.log('[AdminService.fetchGenerators] Starting fetch...');

        // Use direct fetch first (more reliable for public data)
        // RLS policy "Generators are viewable by everyone" allows public read
        try {
            console.log('[AdminService.fetchGenerators] Using direct fetch (public access)...');
            // Cache busting handled by headers if needed, but parameter 't' breaks PostgREST
            const data = await directFetch<any>('generators');

            if (data && data.length > 0) {
                console.log('[AdminService.fetchGenerators] Direct fetch success, count:', data.length);
                return data.map((g: any) => ({
                    ...g,
                    responsibleName: g.responsible_name,
                    responsiblePhone: g.responsible_phone,
                    annualRevenue: g.annual_revenue,
                    estimatedSavings: g.estimated_savings,
                    accessEmail: g.access_email,
                    accessPassword: g.access_password,
                    logoUrl: g.logo_url,
                    agreements: g.agreements
                }));
            }
        } catch (fetchErr: any) {
            console.warn('[AdminService.fetchGenerators] Direct fetch failed, trying SDK:', fetchErr?.message);
        }

        // Fallback: Try SDK
        if (supabase) {
            try {
                console.log('[AdminService.fetchGenerators] Trying SDK fallback...');
                const { data, error } = await supabase.from('generators').select('*').order('name', { ascending: true });

                if (!error && data) {
                    console.log('[AdminService.fetchGenerators] SDK success, count:', data.length);
                    return data?.map((g: any) => ({
                        ...g,
                        responsibleName: g.responsible_name,
                        responsiblePhone: g.responsible_phone,
                        annualRevenue: g.annual_revenue,
                        estimatedSavings: g.estimated_savings,
                        accessEmail: g.access_email,
                        accessPassword: g.access_password,
                        logoUrl: g.logo_url,
                        agreements: g.agreements
                    })) || [];
                }

                if (error) {
                    console.error('[AdminService.fetchGenerators] SDK error:', error.message);
                }
            } catch (err: any) {
                console.error('[AdminService.fetchGenerators] SDK exception:', err?.message);
            }
        }

        console.error('[AdminService.fetchGenerators] All methods failed, returning empty array');
        return [];
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
        console.log('[AdminService.fetchConcessionaires] Starting fetch...');

        // Use direct fetch first (more reliable)
        try {
            console.log('[AdminService.fetchConcessionaires] Using direct fetch...');
            // Forces SDK Fallback because RLS for Anon returns empty, bypassing authentication
            throw new Error('Skipping DirectFetch due to RLS blocks');

            // const data = await directFetch<any>('concessionaires');
            // return data || [];
        } catch (fetchErr: any) {
            console.warn('[AdminService.fetchConcessionaires] Direct fetch skipped/failed, using SDK:', fetchErr?.message);
        }

        // Fallback: Try SDK
        if (supabase) {
            try {
                console.log('[AdminService.fetchConcessionaires] Trying SDK fallback...');
                const { data, error } = await supabase.from('concessionaires').select('*');
                if (!error && data) {
                    console.log('[AdminService.fetchConcessionaires] SDK success, count:', data.length);
                    return data;
                }
                if (error) {
                    console.error('[AdminService.fetchConcessionaires] SDK error:', error.message);
                }
            } catch (err: any) {
                console.error('[AdminService.fetchConcessionaires] SDK exception:', err?.message);
            }
        }

        console.error('[AdminService.fetchConcessionaires] All methods failed');
        return [];
    },

    async fetchClients() {
        console.log('[AdminService.fetchClients] Starting fetch...');

        // Use direct fetch first (more reliable)
        try {
            console.log('[AdminService.fetchClients] Using direct fetch...');
            // Forces SDK Fallback because RLS for Anon returns empty, bypassing authentication
            throw new Error('Skipping DirectFetch due to RLS blocks');

            // const data = await directFetch<any>('clients');
            // ... (rest of mapping code)
        } catch (fetchErr: any) {
            console.warn('[AdminService.fetchClients] Direct fetch skipped/failed, using SDK:', fetchErr?.message);
        }

        // Fallback: Try SDK
        if (supabase) {
            try {
                console.log('[AdminService.fetchClients] Trying SDK fallback...');
                const { data, error } = await supabase
                    .from('clients')
                    .select('*, generators(name)');

                if (!error && data) {
                    console.log('[AdminService.fetchClients] SDK success, count:', data.length);
                    return data?.map((c: any) => ({
                        ...c,
                        generatorName: c.generators?.name || 'Não selecionada'
                    })) || [];
                }
                if (error) {
                    console.error('[AdminService.fetchClients] SDK error:', error.message);
                }
            } catch (err: any) {
                console.error('[AdminService.fetchClients] SDK exception:', err?.message);
            }
        }

        console.error('[AdminService.fetchClients] All methods failed');
        return [];
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
        console.log('[AdminService.updateGenerator] Updating id:', id);

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
        if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
        if (updates.agreements !== undefined) dbUpdates.agreements = updates.agreements;

        // Verify session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AdminService.updateGenerator] Session:', session?.user?.email || 'NO SESSION');

        // Try SDK first
        if (supabase) {
            try {
                console.log('[AdminService.updateGenerator] Using authenticated SDK...');

                // Select to verify update happened
                const { error, count } = await supabase.from('generators').update(dbUpdates).eq('id', id).select('*', { count: 'exact', head: false });

                if (error) {
                    console.error('[AdminService.updateGenerator] SDK error:', error.message);
                    throw error;
                }

                // If no rows affected, treat as failure (RLS or ID mismatch)
                if (count === 0 || count === null) {
                    console.warn('[AdminService.updateGenerator] SDK updated 0 rows. Might be RLS issue. Trying fallback...');
                    throw new Error('SDK updated 0 rows');
                }

                console.log('[AdminService.updateGenerator] SDK success, affected rows:', count);
                return;
            } catch (sdkErr: any) {
                console.error('[AdminService.updateGenerator] SDK failed:', sdkErr?.message);
                // Continue to fallback
            }
        }

        // Fallback: directUpdate
        try {
            console.log('[AdminService.updateGenerator] Trying directUpdate fallback...');
            await directUpdate('generators', id, dbUpdates);
            console.log('[AdminService.updateGenerator] directUpdate success');
        } catch (directErr: any) {
            console.error('[AdminService.updateGenerator] directUpdate failed:', directErr?.message);
            throw directErr;
        }
    },

    async deleteGenerator(id: string) {
        console.log('[AdminService.deleteGenerator] Deleting id:', id);

        // Verify session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AdminService.deleteGenerator] Session:', session?.user?.email || 'NO SESSION');

        if (!session) {
            console.error('[AdminService.deleteGenerator] No active session - delete will likely fail due to RLS');
        }

        // Try SDK first
        if (supabase) {
            try {
                console.log('[AdminService.deleteGenerator] Using authenticated SDK...');
                // Ensure count is returned (using 'exact' is deprecated/optional, but select() works)
                const { error, count } = await supabase.from('generators').delete().eq('id', id).select('*', { count: 'exact', head: false });

                if (error) {
                    console.error('[AdminService.deleteGenerator] SDK error:', error.message);
                    throw error;
                }

                // If no rows affected, treat as failure (RLS or ID mismatch)
                if (count === 0 || count === null) {
                    console.warn('[AdminService.deleteGenerator] SDK deleted 0 rows. Might be RLS issue. Trying fallback...');
                    throw new Error('SDK deleted 0 rows');
                }

                console.log('[AdminService.deleteGenerator] SDK success, affected rows:', count);
                return;
            } catch (sdkErr: any) {
                console.error('[AdminService.deleteGenerator] SDK failed:', sdkErr?.message);
                // Try directDelete fallback
            }
        }

        // Fallback: directDelete
        try {
            console.log('[AdminService.deleteGenerator] Trying directDelete fallback...');
            await directDelete('generators', id);
            console.log('[AdminService.deleteGenerator] directDelete success');
        } catch (directErr: any) {
            console.error('[AdminService.deleteGenerator] directDelete failed:', directErr?.message);
            throw directErr;
        }
    },

    async updateClient(id: string, updates: any) {
        console.log('[AdminService.updateClient] Updating id:', id);

        // Use direct update first (more reliable)
        try {
            await directUpdate('clients', id, updates);
            console.log('[AdminService.updateClient] Direct update success');

            // Send activation email if status changed to approved
            if (updates.status === 'approved' || updates.status === 'active') {
                try {
                    // Fetch client data to get email and name
                    const clients = await this.fetchClients();
                    const client = clients.find(c => c.id === id);

                    if (client && client.email) {
                        console.log('[AdminService.updateClient] Sending activation email to:', client.email);

                        // Call email API
                        const response = await fetch('/api/send-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                to: client.email,
                                name: client.name,
                                billValue: client.bill_value || client.billValue
                            }),
                        });

                        if (response.ok) {
                            console.log('[AdminService.updateClient] Activation email sent successfully');
                        } else {
                            const error = await response.json();
                            console.error('[AdminService.updateClient] Failed to send email:', error);
                        }
                    }
                } catch (emailError: any) {
                    // Don't fail the update if email fails
                    console.error('[AdminService.updateClient] Email sending failed (non-blocking):', emailError.message);
                }
            }

            return;
        } catch (directErr: any) {
            console.warn('[AdminService.updateClient] Direct update failed:', directErr?.message);
        }

        // Fallback: Try SDK
        if (supabase) {
            const { error } = await supabase.from('clients').update(updates).eq('id', id);
            if (error) throw error;

            // Send activation email if status changed to approved (SDK fallback)
            if (updates.status === 'approved' || updates.status === 'active') {
                try {
                    const clients = await this.fetchClients();
                    const client = clients.find(c => c.id === id);

                    if (client && client.email) {
                        console.log('[AdminService.updateClient] Sending activation email to:', client.email);

                        const response = await fetch('/api/send-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                to: client.email,
                                name: client.name,
                                billValue: client.bill_value || client.billValue
                            }),
                        });

                        if (response.ok) {
                            console.log('[AdminService.updateClient] Activation email sent successfully');
                        } else {
                            const error = await response.json();
                            console.error('[AdminService.updateClient] Failed to send email:', error);
                        }
                    }
                } catch (emailError: any) {
                    console.error('[AdminService.updateClient] Email sending failed (non-blocking):', emailError.message);
                }
            }
        }
    },

    async deleteClient(id: string) {
        console.log('[AdminService.deleteClient] Deleting id:', id);

        // Use direct delete first (more reliable)
        try {
            await directDelete('clients', id);
            console.log('[AdminService.deleteClient] Direct delete success');
            return;
        } catch (directErr: any) {
            console.warn('[AdminService.deleteClient] Direct delete failed:', directErr?.message);
        }

        // Fallback: Try SDK
        if (supabase) {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
        }
    },

    async addConcessionaire(data: any) {
        const { error } = await supabase.from('concessionaires').insert(data);
        if (error) throw error;
    },

    async sendApprovalEmail(clientName: string, clientEmail: string) {
        const apiKey = (import.meta as any).env.VITE_RESEND_API_KEY;
        if (!apiKey) {
            console.warn('Resend API key missing. Email not sent.');
            return;
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    from: 'Solinvestti <onboarding@resend.dev>',
                    to: [clientEmail],
                    subject: 'Solinvestti | Seu cadastro foi aprovado! 💡',
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
                            <h2 style="color: #0c112b;">Olá ${clientName}, temos ótimas notícias!</h2>
                            <p style="font-size: 16px; line-height: 1.6;">Seu cadastro na <strong>Solinvestti</strong> foi aprovado com sucesso.</p>
                            <p style="font-size: 16px; line-height: 1.6;">Em breve, a geradora de energia selecionada entrará em contato para encaminhar os contratos para sua assinatura.</p>
                            <p style="font-size: 16px; line-height: 1.6;">Seja bem-vindo à economia inteligente!</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #999;">Esta é uma mensagem automática da Solinvestti.</p>
                        </div>
                    `
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Failed to send email:', err);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    },

    async approveClient(client: any) {
        // 1. Update DB
        const { error } = await supabase.from('clients').update({ status: 'approved' }).eq('id', client.id);
        if (error) throw error;

        // 2. Send Email
        if (client.email) {
            await this.sendApprovalEmail(client.name, client.email);
        }
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

    async activateAllClients() {
        const { error } = await supabase
            .from('clients')
            .update({ status: 'approved' })
            .eq('status', 'pending_approval');

        if (error) throw error;
    },

    async batchAddGenerators(generators: any[]) {
        console.log(`[AdminService.batchAddGenerators] Starting batch import of ${generators.length} items...`);

        // Chunk size small enough to avoid timeout/payload limits
        const CHUNK_SIZE = 50;

        for (let i = 0; i < generators.length; i += CHUNK_SIZE) {
            const chunk = generators.slice(i, i + CHUNK_SIZE);
            console.log(`[AdminService.batchAddGenerators] Processing chunk ${i / CHUNK_SIZE + 1} (${chunk.length} items)...`);

            // Map to DB format
            const dbData = chunk.map(gen => ({
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
                icon: gen.icon,
                // Ensure new columns are included if present in object
                logo_url: gen.logoUrl,
                agreements: gen.agreements
            }));

            // Use Supabase insert (batch)
            const { error } = await supabase.from('generators').insert(dbData);

            if (error) {
                console.error('[AdminService.batchAddGenerators] Error in chunk:', error);
                throw error;
            }

            // Small delay to be nice to the DB
            await new Promise(r => setTimeout(r, 100));
        }

        console.log('[AdminService.batchAddGenerators] Batch import complete!');
    },

    async resetDatabase() {
        try {
            console.log('[AdminService.resetDatabase] Trying RPC reset...');
            const { error } = await supabase.rpc('reset_database');
            if (error) throw error;
            console.log('[AdminService.resetDatabase] RPC reset success');
        } catch (rpcErr: any) {
            console.warn('[AdminService.resetDatabase] RPC failed, falling back to manual deletion:', rpcErr.message);

            // Manual deletion order: Clients (FK to Gen) -> Generators
            try {
                // Delete Clients
                const clients = await this.fetchClients(); // Uses directFetch fallback internally
                console.log(`[AdminService.resetDatabase] Deleting ${clients.length} clients...`);
                for (const c of clients) {
                    await directDelete('clients', c.id);
                }

                // Delete Generators
                const gens = await this.fetchGenerators();
                console.log(`[AdminService.resetDatabase] Deleting ${gens.length} generators...`);
                for (const g of gens) {
                    await directDelete('generators', g.id);
                }

                // Delete Concessionaires
                const concess = await this.fetchConcessionaires();
                console.log(`[AdminService.resetDatabase] Deleting ${concess.length} concessionaires...`);
                for (const c of concess) {
                    await directDelete('concessionaires', c.id);
                }

                console.log('[AdminService.resetDatabase] Manual reset success');
            } catch (manualErr: any) {
                console.error('[AdminService.resetDatabase] Manual reset failed:', manualErr.message);
                throw manualErr;
            }
        }
    }
};
