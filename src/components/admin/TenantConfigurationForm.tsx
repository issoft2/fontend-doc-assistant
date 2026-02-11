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
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-light rounded-2xl backdrop-blur-sm shadow-lg border",
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
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-light rounded-2xl backdrop-blur-sm shadow-lg border",
          badge.bg, badge.border
        )}
        whileHover={{ scale: 1.05 }}
      >
        <span>{badge.icon}</span>
        <span className={badge.text}>{status || 'Unknown'}</span>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("flex items-center justify-center min-h-[400px] backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-12", className)}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-r from-[#9b87f5]/30 to-purple-500/30 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl animate-pulse">
            <Loader2 className="w-10 h-10 text-[#9b87f5] animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-light text-white mb-2 bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-lg">
              Loading Tenants
            </h2>
            <p className="text-sm text-white/50 font-light">Fetching tenant data...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("max-w-7xl mx-auto py-8 space-y-8", className)}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light mb-3 bg-gradient-to-r from-white via-[#9b87f5] to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              Tenants
            </h1>
            <motion.p 
              className="text-lg text-white/60 font-light max-w-2xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isVendor 
                ? 'All registered tenants across your platform (Vendor view)'
                : userTenantId 
                  ? `Your organization: <span className="text-[#9b87f5] font-light">${userTenantId}</span>`
                  : 'No tenant assigned to your account'
              }
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div 
              className="text-right text-sm text-white/50 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>Total: <span className="text-[#9b87f5] font-light text-lg">{visibleCompanies.length}</span></div>
              {lastLoadedAt && (
                <div>Last updated: <span className="text-xs">{lastLoadedAt}</span></div>
              )}
            </motion.div>
            
            <motion.button
              onClick={loadCompanies}
              disabled={loading}
              className="group relative h-14 px-8 rounded-2xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 backdrop-blur-sm text-white font-light shadow-lg hover:shadow-[0_0_25px_rgba(155,_135,_245,_0.4)] hover:border-[#9b87f5]/50 hover:bg-[#9b87f5]/30 transition-all duration-300 flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Refresh
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
          className="p-6 rounded-3xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/40 backdrop-blur-sm shadow-lg text-red-100 font-light"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!visibleCompanies.length && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-16 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-[#9b87f5]/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#9b87f5]/30 shadow-xl animate-pulse">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-2xl font-light mb-4 text-white bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-lg">
            {isVendor ? 'No Tenants Yet' : 'No Tenants Accessible'}
          </h2>
          <p className="text-lg text-white/50 font-light max-w-md mx-auto mb-8 leading-relaxed">
            {isVendor
              ? 'No tenants found yet. Create your first tenant on the Configuration page.'
              : 'No tenants accessible to your account. Contact your administrator.'
            }
          </p>
        </motion.div>
      )}

      {/* Tenants Table */}
      {visibleCompanies.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/3 border border-white/5 shadow-2xl rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Table Header */}
          <div className="backdrop-blur-sm bg-white/5 border-b border-white/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[#9b87f5] to-purple-500 rounded-full shadow-sm animate-pulse" />
                <h3 className="text-2xl font-light text-white drop-shadow-lg">Tenant Directory</h3>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="divide-y divide-white/5">
              {visibleCompanies.map((company, index) => (
                <motion.div
                  key={company.tenant_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-white/5 transition-all duration-300"
                >
                  <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start hover:shadow-[0_0_25px_rgba(155,_135,_245,_0.15)]">
                    {/* Company Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300" />
                        <div>
                          <h4 className="text-xl font-light text-white drop-shadow-lg group-hover:text-[#9b87f5] transition-colors">
                            {company.display_name || company.tenant_id}
                          </h4>
                          <p className="text-sm text-white/60 font-light flex items-center gap-2">
                            ID: <span className="font-mono text-[#9b87f5]">{company.tenant_id}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Plan & Status */}
                    <div className="space-y-4 lg:col-span-2">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white/50 font-light uppercase tracking-wider block mb-1">Plan</span>
                          {getPlanBadge(company.plan)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white/50 font-light uppercase tracking-wider block mb-1">Status</span>
                          {getStatusBadge(company.subscription_status)}
                        </div>
                      </div>
                      
                      {company.trial_ends_at && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-400/20 backdrop-blur-sm">
                          <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-sm" />
                          <div>
                            <span className="text-xs text-white/60 font-light block mb-1">Trial ends</span>
                            <span className="text-sm font-light text-amber-200">{formatDate(company.trial_ends_at)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="text-right lg:col-start-3 lg:row-span-2 lg:flex lg:flex-col lg:justify-end">
                      <span className="text-xs text-white/40 font-light block mb-1 uppercase tracking-wider">Created</span>
                      <span className="text-lg font-light text-white/80">{formatDate(company.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Action */}
      {isVendor && (
        <motion.div 
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="w-16 h-16 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white rounded-3xl shadow-2xl hover:shadow-[0_0_40px_rgba(155,_135,_245,_0.6)] border-4 border-white/20 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadCompanies}
          >
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TenantsList;
