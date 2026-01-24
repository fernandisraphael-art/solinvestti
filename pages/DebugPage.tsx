import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DebugPage: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [envStatus, setEnvStatus] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].slice(0, 8)} - ${msg}`]);
    };

    const runDiagnostics = async () => {
        setLoading(true);
        setLogs([]);
        addLog('Starting diagnostics...');

        // 1. Check Environment Variables
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setEnvStatus({
            url: url ? `Present (${url.substring(0, 15)}...)` : 'MISSING',
            key: key ? `Present (${key.substring(0, 10)}...)` : 'MISSING'
        });

        addLog(`Env URL: ${url ? 'OK' : 'MISSING'}`);
        addLog(`Env Key: ${key ? 'OK' : 'MISSING'}`);

        if (!url || !key) {
            addLog('CRITICAL: Missing environment variables. Connection will fail.');
            setLoading(false);
            return;
        }

        // 2. Test Supabase SDK
        addLog('Testing Supabase SDK...');
        try {
            if (!supabase) {
                addLog('SDK Error: Client is null');
            } else {
                const start = performance.now();
                const { data, error } = await supabase.from('generators').select('count', { count: 'exact', head: true });
                const end = performance.now();

                if (error) {
                    addLog(`SDK Error: ${error.message} (${error.code})`);
                    if (error.message.includes('FetchError')) addLog('Hint: Check CORS or Network');
                } else {
                    addLog(`SDK Success! Count: ${data === null ? 'null (head request)' : 'OK'}`);
                    addLog(`SDK Latency: ${(end - start).toFixed(2)}ms`);
                }
            }
        } catch (err: any) {
            addLog(`SDK Exception: ${err.message}`);
        }

        // 3. Test Direct Fetch
        addLog('Testing Direct REST API...');
        try {
            const start = performance.now();
            const response = await fetch(`${url}/rest/v1/generators?select=id&limit=1`, {
                method: 'GET',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            });
            const end = performance.now();

            addLog(`Direct Fetch Status: ${response.status} ${response.statusText}`);
            addLog(`Direct Fetch Latency: ${(end - start).toFixed(2)}ms`);

            if (!response.ok) {
                const text = await response.text();
                addLog(`Direct Fetch Response: ${text.substring(0, 100)}`);
            } else {
                const json = await response.json();
                addLog(`Direct Fetch Data: Found ${json.length} items`);
            }

        } catch (err: any) {
            addLog(`Direct Fetch Exception: ${err.message}`);
        }

        setLoading(false);
        addLog('Diagnostics complete.');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-mono">
            <h1 className="text-2xl font-bold text-white mb-6">Solinvestti Connection Debugger</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold text-emerald-400 mb-4">Environment Status</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>VITE_SUPABASE_URL</span>
                                <span className={envStatus.url?.includes('MISSING') ? 'text-red-400' : 'text-emerald-400'}>
                                    {envStatus.url || 'Not Checked'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>VITE_SUPABASE_ANON_KEY</span>
                                <span className={envStatus.key?.includes('MISSING') ? 'text-red-400' : 'text-emerald-400'}>
                                    {envStatus.key || 'Not Checked'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={runDiagnostics}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Running Tests...' : 'Run Diagnostics'}
                    </button>

                    <div className="bg-blue-900/20 p-4 rounded-lg text-sm text-blue-200 border border-blue-500/30">
                        <p className="font-bold mb-2">Instructions:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Click "Run Diagnostics" to test connection.</li>
                            <li>If "Environment Variables" are MISSING, configure them in Vercel Settings.</li>
                            <li>If SDK fails but Direct Fetch works, it's a library issue (CORS/Version).</li>
                            <li>If both fail, check Supabase project status or network firewall.</li>
                        </ul>
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-black/50 p-6 rounded-xl border border-slate-700 h-[600px] overflow-y-auto font-sm">
                    <h2 className="text-xl font-bold text-slate-400 mb-4 sticky top-0 bg-black/0">Execution Logs</h2>
                    {logs.length === 0 && <span className="text-slate-600 italic">Ready to start...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="border-b border-slate-800/50 py-1 hover:bg-white/5 px-2">
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DebugPage;
