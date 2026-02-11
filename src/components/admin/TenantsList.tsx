import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listCompanies } from '@/lib/api';

interface Company {
  tenant_id: string;
  display_name?: string;
  plan?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  created_at: string;
}

interface User {
  role?: string | null;
  tenant_id?: string | null;
  [key: string]: any;
}

interface TenantListProps {
  className?: string;
}

const TenantsList: React.FC<TenantListProps> = ({ className = '' }) => {
  const authStore = useAuthStore() as { user: User | null };
  const user = authStore.user;
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState('');

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await listCompanies();
      const payload = Array.isArray(res) ? res : res?.data || [];
      setCompanies(Array.isArray(payload) ? payload : []);
      setLastLoadedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      console.error('loadCompanies error:', e);
      setError(e?.response?.data?.detail || 'Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const isVendor = user?.role === 'vendor';
  const userTenantId = user?.tenant_id || '';
  const visibleCompanies = companies.filter(company => {
    if (isVendor) return true;
    return company.tenant_id === userTenantId;
  });

  // Premium gradient badges
  const getPlanBadge = (plan?: string) => {
    const badges = {
      'free_trial': { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-300', border: 'border-amber-400/40', icon: '🧪' },
      'starter': { bg: 'from-sky-500/20 to-blue-500/20', text: 'text-sky-300', border: 'border-sky-400/40', icon: '⭐' },
      'pro': { bg: 'from-indigo-500/20 to-purple-500/20', text: 'text-indigo-300', border: 'border-indigo-400/40', icon: '🚀' },
      'enterprise': { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300', border: 'border-emerald-400/40', icon: '🏆' },
      default: { bg: 'from-slate-500/10 to-slate-600/10', text: 'text-slate-300', border: 'border-slate-400/30', icon: '—' }
    };
    const badge = badges[plan as keyof typeof badges] || badges.default;
    
    return (
      <motion.div 
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-light rounded-2xl backdrop-blur-sm shadow-xl border",
          badge.bg, badge.border
        )}
        whileHover={{ scale: 1.05 }}
      >
        <span>{badge.icon}</span>
        <span className={badge.text}>{plan || 'Unknown'}</span>
      </motion.div>
    );
  };

  const getStatusBadge = (status?: string) => {
    const badges = {
      'trialing': { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-200', border: 'border-amber-400/40', icon: '⏳' },
      'active': { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-200', border: 'border-emerald-400/40', icon: '✅' },
      'expired': { bg: 'from-red-500/20 to-rose-500/20', text: 'text-red-200', border: 'border-red-400/40', icon: '⏰' },
      'cancelled': { bg: 'from-slate-500/20 to-slate-600/20', text: 'text-slate-300', border: 'border-slate-400/30', icon: '❌' },
      default: { bg: 'from-slate-500/10 to-slate-600/10', text: 'text-slate-300', border: 'border-slate-400/30', icon: '⚪' }
    };
    const badge = badges[status as keyof typeof badges] || badges.default;
    
    return (
      <motion.div 
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-light rounded-2xl backdrop-blur-sm shadow-xl border",
          badge.bg, badge.border
        )}
        whileHover={{ scale: 1.05 }}
      >
        <span>{badge.icon}</span>
        <span className={badge.text}>{status || 'Unknown'}</span>
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex items-center justify-center min-h-[500px] backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-12 lg:p-20"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-r from-[#9b87f5]/30 to-purple-500/30 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl animate-pulse">
            <Loader2 className="w-12 h-12 lg:w-14 lg:h-14 text-[#9b87f5] animate-spin" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-light text-white mb-4 bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-2xl">
              Loading Tenants
            </h2>
            <p className="text-lg text-white/50 font-light">Fetching tenant data from server...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full h-full space-y-12 p-4 md:p-8 lg:p-12", className)} // ✅ FULL WIDTH FOR SIDEBAR
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-light mb-4 bg-gradient-to-r from-white via-[#9b87f5] to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              Tenants
            </h1>
            <p className="text-xl lg:text-2xl text-white/60 font-light max-w-2xl leading-relaxed">
              {isVendor 
                ? 'All registered tenants across your platform (Vendor view)'
                : userTenantId 
                  ? `Your organization: <span className="text-[#9b87f5] font-semibold">${userTenantId}</span>`
                  : 'No tenant assigned to your account'
              }
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col sm:flex-row gap-4 self-start lg:self-end"
          >
            <motion.div 
              className="text-left lg:text-right text-lg lg:text-xl text-white/70 font-light bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10"
            >
              <div>Total: <span className="text-[#9b87f5] font-semibold text-2xl">{visibleCompanies.length}</span></div>
              {lastLoadedAt && (
                <div className="text-base mt-1">Last updated: <span className="text-[#9b87f5]">{lastLoadedAt}</span></div>
              )}
            </motion.div>
            
            <motion.button
              onClick={loadCompanies}
              disabled={loading}
              className="h-16 lg:h-20 px-8 lg:px-12 rounded-3xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 backdrop-blur-sm text-white font-light shadow-xl hover:shadow-[0_0_40px_rgba(155,_135,_245,_0.4)] hover:border-[#9b87f5]/50 hover:bg-[#9b87f5]/30 transition-all duration-300 flex items-center gap-4 text-lg lg:text-xl whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-6 h-6 lg:w-7 lg:h-7 group-hover:rotate-12 transition-transform duration-300" />
                  Refresh List
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full p-8 lg:p-12 rounded-3xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/40 backdrop-blur-sm shadow-2xl text-red-100 font-light flex items-center gap-4"
        >
          <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-lg lg:text-xl">{error}</span>
        </motion.div>
      )}

      {/* Empty State */}
      {!visibleCompanies.length && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-16 lg:p-24 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gradient-to-r from-[#9b87f5]/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-[#9b87f5]/30 shadow-2xl animate-pulse">
            <span className="text-5xl lg:text-6xl">📋</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-2xl">
            {isVendor ? 'No Tenants Yet' : 'No Tenants Accessible'}
          </h2>
          <p className="text-xl lg:text-2xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            {isVendor
              ? 'No tenants found yet. Create your first tenant on the Configuration page.'
              : 'No tenants accessible to your account. Contact your administrator.'
            }
          </p>
        </motion.div>
      )}

      {/* Tenants Grid */}
      {visibleCompanies.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full backdrop-blur-xl bg-white/3 border border-white/5 shadow-2xl rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          {/* Grid Header */}
          <div className="backdrop-blur-sm bg-white/5 border-b border-white/10 px-8 lg:px-12 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-[#9b87f5] to-purple-500 rounded-full shadow-sm animate-pulse" />
                <div>
                  <h3 className="text-3xl lg:text-4xl font-light text-white drop-shadow-lg">Tenant Directory</h3>
                  <p className="text-lg text-white/60 font-light mt-1">{visibleCompanies.length} active tenants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6 lg:p-8 xl:p-12">
            {visibleCompanies.map((company, index) => (
              <motion.div
                key={company.tenant_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-10 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(155,_135,_245,_0.2)] hover:border-[#9b87f5]/30 transition-all duration-500 overflow-hidden relative"
              >
                {/* Glow border */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/20 via-transparent to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-2xl lg:text-3xl font-light text-white drop-shadow-xl group-hover:text-[#9b87f5] transition-colors truncate">
                          {company.display_name || company.tenant_id}
                        </h4>
                        <p className="text-lg text-white/60 font-light mt-1 flex items-center gap-2">
                          <span className="font-mono text-sm lg:text-base text-[#9b87f5] bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm">
                            {company.tenant_id}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plan & Status */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <span className="text-xs lg:text-sm text-white/50 font-light uppercase tracking-wider block">Plan</span>
                      {getPlanBadge(company.plan)}
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs lg:text-sm text-white/50 font-light uppercase tracking-wider block">Status</span>
                      {getStatusBadge(company.subscription_status)}
                    </div>
                  </div>

                  {/* Trial & Created */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    {company.trial_ends_at && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-400/20 backdrop-blur-sm">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-sm animate-pulse" />
                        <div>
                          <span className="text-xs text-white/60 font-light block mb-1">Trial ends</span>
                          <span className="text-lg font-semibold text-amber-200">{formatDate(company.trial_ends_at)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm text-white/50 font-light uppercase tracking-wider">Created</span>
                      <span className="text-xl font-light text-white/80">{formatDate(company.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Floating Action - Fixed position */}
      {isVendor && (
        <motion.div 
          className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 z-50"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white rounded-3xl shadow-2xl hover:shadow-[0_0_60px_rgba(155,_135,_245,_0.7)] border-4 border-white/20 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadCompanies}
            title="Refresh tenants"
          >
            <RefreshCw className="w-8 h-8 lg:w-10 lg:h-10 animate-spin-slow" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TenantsList;
