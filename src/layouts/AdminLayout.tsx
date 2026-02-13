// src/layouts/AdminLayout.tsx - MOBILE PERFECT VERSION
import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../useAuthStore';
import { Menu, X, LogOut } from 'lucide-react';
import logo from '@/assets/images/download.webp';
import { cn } from '@/lib/utils';

interface User {
  role?: string | null;
  [key: string]: any;
}

const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuthStore() as { user: User | null; logout: () => void };
  
  const navigate = useNavigate();
  const location = useLocation();

  const adminRoles = [
    'group_admin', 'group_exe', 'group_hr', 'group_finance', 'group_operation',
    'group_production', 'group_marketing', 'group_legal', 'sub_admin', 'sub_md',
    'sub_hr', 'sub_finance', 'sub_operations', 'vendor'
  ];

  const canSeeAdmin = user?.role && adminRoles.includes(String(user.role));
  
  const roleLabel = user?.role ? (() => {
    const role = String(user.role);
    if (role.startsWith('group_')) return `Group ${role.split('_')[1]?.toUpperCase()}`;
    if (role.startsWith('sub_')) return `Subsidiary ${role.split('_')[1]?.toUpperCase()}`;
    if (role === 'employee') return 'Employee';
    if (role === 'vendor') return 'Vendor';
    return role;
  })() : 'Guest';

  const navItems = [
    { path: '/chat', label: ' Chat with Assistant', icon: '💬' },
    ...(user?.role === 'vendor' ? [{ path: '/admin/tenant-config', label: '➕ New Tenant', icon: '➕' }] : []),
    { path: '/admin/tenants', label: 'Tenants', icon: '📋', roles: ['vendor', 'group_admin', 'gmd', 'group_hr', 'group_finance'] },
    { path: '/admin/organizations', label: 'Organizations', icon: '🏢', roles: ['vendor', 'group_admin', 'group_hr', 'group_finance'] },
     { path: '/admin/collections', label: 'Collections', icon: '📂' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/ingestion', label: 'Ingestion', icon: '📥 ' },

  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(String(user?.role));
  });

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileNav = () => setMobileNavOpen(prev => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen font-[500] text-white antialiased flex flex-col lg:flex-row bg-[#0a0613]/95">
      {/* 🎨 ENHANCED BACKGROUND */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            background: 'linear-gradient(135deg, #0a0613 0%, #150d27 50%, #1a0f3a 100%)',
          }}
        />
        <div className="absolute top-24 right-24 w-72 h-72 lg:w-96 lg:h-96 bg-[#9b87f5]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 left-24 w-80 h-80 lg:w-96 lg:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* DESKTOP SIDEBAR - HIDDEN ON MOBILE */}
      {canSeeAdmin && (
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="hidden lg:flex w-80 lg:w-96 flex-shrink-0 flex flex-col z-40 shadow-2xl backdrop-blur-2xl border-r border-white/10 isolate"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 6, 19, 0.98) 0%, rgba(21, 13, 39, 0.98) 70%, rgba(155, 135, 245, 0.06) 100%)',
          }}
        >
          {/* Logo Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-b border-white/10 backdrop-blur-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(155, 135, 245, 0.15) 0%, rgba(155, 135, 245, 0.05) 100%)',
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="h-16 w-16 lg:h-20 lg:w-20 bg-gradient-to-r from-[#9b87f5] via-purple-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center p-3 border border-white/20"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
              >
                <img src={logo} alt="OKA" className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl object-cover opacity-95" />
              </motion.div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-[600] tracking-tight bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-lg">
                  Knowledgebase
                </h1>
                <p className="text-sm lg:text-base text-[#9b87f5] font-light opacity-90 mt-1">AI Assistant Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-8 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {visibleNavItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => navigate(item.path)}
                className={cn(
                  "group relative w-full text-left rounded-3xl px-6 py-5 lg:py-6 font-[500] text-lg lg:text-xl leading-relaxed transition-all duration-400 flex items-center gap-4 h-20 lg:h-24 overflow-hidden shadow-xl border border-white/10 backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(155,135,245,0.3)] hover:border-[#9b87f5]/40 hover:scale-[1.02]",
                  isActive(item.path)
                    ? "bg-gradient-to-r from-[#9b87f5]/25 via-purple-600/20 to-indigo-600/20 text-white shadow-[0_20px_50px_rgba(155,135,245,0.5)] border-[#9b87f5]/50 !scale-[1.02]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <span className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5 rounded-2xl shadow-lg flex-shrink-0 transition-all duration-300",
                  isActive(item.path)
                    ? "bg-gradient-to-r from-[#9b87f5] to-purple-500 shadow-[#9b87f5]/60 scale-110"
                    : "bg-white/30 group-hover:bg-[#9b87f5]/70 group-hover:scale-110"
                )} />
                <span className="truncate font-medium">{item.icon} {item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute right-6 w-2 h-12 lg:h-16 bg-gradient-to-b from-[#9b87f5] via-purple-500 to-indigo-500 rounded-xl shadow-xl"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-t border-white/10 backdrop-blur-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, rgba(155, 135, 245, 0.08) 0%, rgba(10, 6, 19, 0.95) 100%)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 text-emerald-200 border border-emerald-400/40 font-mono font-medium text-base lg:text-lg shadow-lg backdrop-blur-sm">
                  {roleLabel}
                </span>
                <span className="text-white/70 font-medium text-sm lg:text-base">Admin Dashboard</span>
              </div>
              <motion.button
                onClick={handleLogout}
                className="p-4 rounded-3xl border-2 border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl hover:shadow-[0_20px_40px_rgba(155,135,245,0.4)] hover:border-[#9b87f5]/40 hover:bg-gradient-to-br hover:from-[#9b87f5]/20 hover:to-purple-600/20 hover:text-white transition-all duration-400 group"
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.96 }}
              >
                <LogOut className="h-6 w-6 lg:h-7 lg:w-7 group-hover:-rotate-180 transition-all duration-500" />
              </motion.button>
            </div>
          </motion.div>
        </motion.aside>
      )}

      {/* MAIN CONTENT AREA - FULL WIDTH ON MOBILE */}
      <div className="flex-1 flex flex-col min-h-screen isolate relative z-10 w-full lg:ml-0">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="backdrop-blur-2xl bg-white/8 border-b border-white/10 shadow-2xl sticky top-0 z-30 flex-shrink-0 isolate w-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="px-6 lg:px-12 py-6 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              {canSeeAdmin && (
                <motion.button
                  className="p-3 lg:p-4 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl hover:bg-white/20 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300"
                  onClick={toggleMobileNav}
                  whileTap={{ scale: 0.95 }}
                >
                  {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.button>
              )}
              <motion.div 
                className="font-[600] text-2xl lg:text-4xl tracking-tight bg-gradient-to-r from-[#9b87f5] via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                Admin Console
              </motion.div>
            </div>
            <div className="flex items-center gap-4 hidden lg:block">
              <div className="text-right text-sm lg:text-base text-white/60 font-medium">
                Welcome back, <span className="text-[#9b87f5] font-semibold">{user?.email?.split('@')[0] || 'Admin'}</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* MOBILE NAV OVERLAY - FULLSCREEN + HIGHER Z-INDEX */}
        {canSeeAdmin && mobileNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-[#0a0613]/98 backdrop-blur-2xl z-50 flex flex-col shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 6, 19, 0.98) 0%, rgba(21, 13, 39, 0.98) 100%)',
            }}
            onClick={closeMobileNav}
          >
            <div className="flex-1 overflow-y-auto p-8 space-y-6 pt-20" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-gradient-to-r from-[#9b87f5] via-purple-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center p-2.5 border border-white/20">
                    <img src={logo} alt="OKA" className="w-9 h-9 rounded-2xl object-cover opacity-95" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-[600] bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent">
                      Knowledgebase
                    </h1>
                    <p className="text-sm text-[#9b87f5] font-light">AI Assistant</p>
                  </div>
                </div>
                <motion.button
                  onClick={closeMobileNav}
                  className="p-3 rounded-3xl bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-7 w-7" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {visibleNavItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    onClick={() => {
                      navigate(item.path);
                      closeMobileNav();
                    }}
                    className={cn(
                      "group w-full text-left rounded-3xl px-8 py-6 font-[500] text-xl leading-relaxed transition-all duration-400 flex items-center gap-6 h-24 shadow-xl border border-white/10 backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(155,135,245,0.3)] hover:border-[#9b87f5]/40 hover:scale-[1.02]",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-[#9b87f5]/25 via-purple-600/20 to-indigo-600/20 text-white shadow-[0_20px_50px_rgba(155,135,245,0.5)] border-[#9b87f5]/50 !scale-[1.02]"
                        : "text-white/80 hover:text-white hover:bg-white/15"
                    )}
                  >
                    <span className={cn(
                      "w-6 h-6 rounded-2xl shadow-lg flex-shrink-0 transition-all duration-300",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-[#9b87f5] to-purple-500 shadow-[#9b87f5]/60 scale-110"
                        : "bg-white/30 group-hover:bg-[#9b87f5]/70 group-hover:scale-110"
                    )} />
                    <span className="font-semibold">{item.icon} {item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* MAIN CONTENT - CLEAN TRANSPARENT MOBILE */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 overflow-y-auto p-6 lg:p-12 xl:p-16 isolate bg-transparent/0 relative z-10 w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent/20 lg:ml-0"
          style={{ minHeight: 0 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
