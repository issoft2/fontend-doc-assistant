// src/layouts/AdminLayout.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../useAuthStore'; // Adjust path
import { Menu, X, LogOut } from 'lucide-react';
import logo from '@/assets/images/download.webp'; // Adjust path to your logo
import { cn } from '@/lib/utils'; 


// ✅ FIXED: Define User type locally (since MeResponse doesn't have role)
interface User {
  role?: string | null;
  [key: string]: any; // Allow other properties
}

const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuthStore() as { user: User | null; logout: () => void };
  
  const navigate = useNavigate();
  const location = useLocation();

  // Admin roles (same as your Vue version)
  const adminRoles = [
    'group_admin', 'group_exe', 'group_hr', 'group_finance', 'group_operation',
    'group_production', 'group_marketing', 'group_legal', 'sub_admin', 'sub_md',
    'sub_hr', 'sub_finance', 'sub_operations', 'vendor'
  ];

  // ✅ FIXED: Safe role access with optional chaining
  const canSeeAdmin = user?.role && adminRoles.includes(String(user.role));
  
  const roleLabel = user?.role ? (() => {
    const role = String(user.role);
    if (role.startsWith('group_')) return `Group ${role.split('_')[1]?.toUpperCase()}`;
    if (role.startsWith('sub_')) return `Subsidiary ${role.split('_')[1]?.toUpperCase()}`;
    if (role === 'employee') return 'Employee';
    if (role === 'vendor') return 'Vendor';
    return role;
  })() : 'Guest';

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  const navItems = [
    { path: '/chat', label: 'Chat with Assistant' },
    { path: '/admin/ingest', label: 'Ingest & Configuration' },
      ...(user?.role === 'vendor' ? [{ path: '/admin/tenant-config', label: 'Configure Tenant' }] : []), // ✅ NEW VENDOR-ONLY

      // ✅ NEW TENANTS LINK - Vendor + Admin roles only
      { 
        path: '/admin/tenants', 
        label: '📋 Tenants', 
        roles: ['vendor', 'group_admin', 'gmd', 'group_hr', 'group_finance']
      },
      

    { path: '/admin/companies', label: 'Companies & Collections' },
    { path: '/admin/users', label: 'Users' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar (desktop / tablet) */}
      {canSeeAdmin && (
        <aside className="w-64 bg-slate-900 text-slate-100 hidden md:flex md:flex-col shadow-2xl">
          <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">OKA</span>
            </div>
            <span className="text-lg font-semibold truncate">
              Knowledgebase Assistant
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn( // ✅ FIXED: cn now imported
                  "block w-full text-left rounded-md px-3 py-2.5 font-medium transition-all duration-200 flex items-center gap-2",
                  isActive(item.path)
                    ? "bg-slate-800 text-white shadow-md shadow-indigo-500/25 border-r-2 border-indigo-400"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:shadow-md"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-400 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-[10px]">{roleLabel}</span>
              <span>Admin only</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile menu button for admins */}
            {canSeeAdmin && (
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 shadow-sm"
                onClick={toggleMobileNav}
                aria-label="Toggle menu"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}

            <div className="font-semibold text-sm text-slate-800 bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text">
              Admin Console
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 font-medium text-slate-700 hover:from-slate-100 hover:to-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 hover:text-slate-900 transition-all duration-200 shadow-sm"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Mobile nav dropdown */}
        {canSeeAdmin && mobileNavOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl text-slate-100 border-b border-slate-800 shadow-2xl">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <div className="h-7 w-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">OKA</span>
              </div>
              <span className="text-sm font-semibold truncate">
                Knowledgebase Assistant
              </span>
            </div>

            <nav className="px-3 py-4 space-y-1 text-sm">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    closeMobileNav();
                  }}
                  className={cn( // ✅ FIXED: cn now works
                    "block w-full text-left rounded-xl px-3 py-3 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-400/50 shadow-md shadow-indigo-500/25"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:shadow-md hover:shadow-slate-900/25"
                  )}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-indigo-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="px-4 py-3 border-t border-slate-800/50 text-[11px] text-slate-400 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-[10px]">{roleLabel}</span>
                <span>Admin only</span>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 bg-slate-50/50 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;