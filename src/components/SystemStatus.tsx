import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SystemStatus() {
    const [auditLoading, setAuditLoading] = useState(false);

    const runAudit = async () => {
        setAuditLoading(true);
        try {
            const start = Date.now();
            const { error } = await supabase.from('profiles').select('id').limit(1);
            const latency = Date.now() - start;
            if (error) throw error;
            alert(`Connection Success!\nLatency: ${latency}ms\nEnvironment: PRODUCTION\nEndpoint: ${import.meta.env.VITE_SUPABASE_URL?.substring(0, 15)}...`);
        } catch (err: any) {
            alert(`Connection Failed!\nError: ${err.message}\nPossible issue: VPN, Network, or Missing Config.`);
        } finally {
            setAuditLoading(false);
        }
    };

    return (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</span>
                {import.meta.env.VITE_SUPABASE_URL ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <span className="text-[10px] font-black text-lime uppercase">Live Mode</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-500 uppercase italic">Mock Mode</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-mono text-gray-600">
                <span>API ENDPOINT:</span>
                <span className="text-gray-500">
                    {import.meta.env.VITE_SUPABASE_URL 
                        ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 12)}...` 
                        : 'NOT_CONFIGURED'}
                </span>
            </div>

            <button
                onClick={runAudit}
                disabled={auditLoading}
                className="w-full py-2 text-[9px] font-black text-gray-500 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition-all uppercase tracking-tighter disabled:opacity-50"
            >
                {auditLoading ? 'Auditing pulse...' : 'Run Connection Audit'}
            </button>
        </div>
    );
}
