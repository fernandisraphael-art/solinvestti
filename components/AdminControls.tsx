import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { UserRole } from '../types';

const AdminControls: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Only show for Admins
    if (user?.role !== UserRole.ADMIN) return null;

    // Per user request: Only show the "Painel Admin" shortcut when Maintenance Mode is ON.
    // "quando o usuario desabilidar esse botal suma com o atalho das paginas"
    const { maintenanceMode } = useSystem();
    if (!maintenanceMode) return null;

    // Optional: Hide if already on admin dashboard (to avoid redundancy, or keep it to allow "refresh"/return to root admin)
    // Actually, user said "monitorar", so having it everywhere is fine. 
    // But if on /admin/* it might overlay other things?
    // Let's hide it ONLY if exact path is '/admin' (the dashboard) to avoid clutter, 
    // OR keep it everywhere but maybe style it differently?
    // User said: "when I am logged as admin leave it on ALL pages".
    // I'll keep it simple. If I am on /admin, maybe the button is "Dashboard" and does nothing?
    // Let's just navigate to '/admin'. 

    // Hide on the admin dashboard itself to prevent obstruction/redundancy?
    // If I am in /admin/generators, the "Back to Admin" button takes me to /admin (overview). That is useful.
    // If I am on /admin (root), it's redundant but harmless.

    // Let's hiding it from the login page obviously.
    if (location.pathname === '/admin-login' || location.pathname === '/auth') return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <button
                onClick={() => navigate('/admin')}
                className="group bg-[#0F172A] border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold uppercase tracking-wider text-[10px] hover:bg-brand-deep hover:scale-105 active:scale-95 transition-all hover:border-primary/50"
            >
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-[#0F172A] transition-colors">
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                </div>
                <span>Painel Admin</span>
            </button>
        </div>
    );
};

export default AdminControls;
