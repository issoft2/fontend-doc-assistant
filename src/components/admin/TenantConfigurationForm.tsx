import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { configureTenantPayload } from '@/lib/api';

interface User {
  role?: string | null;
  tenant_id?: string;
  [key: string]: any;
}

interface TenantConfigFormProps {
  className?: string;
}

const TenantConfigForm: React.FC<TenantConfigFormProps> = ({ className = '' }) => {
  const { user } = useAuthStore() as { user: User | null };
  const isVendor = user?.role === 'vendor';

  // Form state
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPlan, setTenantPlan] = useState<'free_trial' | 'starter' | 'pro' | 'enterprise'>('free_trial');
  const [tenantSubscriptionStatus, setTenantSubscriptionStatus] = useState<'trialing' | 'active' | 'expired' | 'cancelled'>('trialing');
  const [configureLoading, setConfigureLoading] = useState(false);
  const [configureMessage, setConfigureMessage] = useState('');
  const [configureError, setConfigureError] = useState('');

  useEffect(() => {
    if (!isVendor) {
      setTenantId('');
      setTenantName('');
      setTenantPlan('free_trial');
      setTenantSubscriptionStatus('trialing');
      setConfigureMessage('');
      setConfigureError('');
    }
  }, [isVendor]);

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVendor) return;

    setConfigureMessage('');
    setConfigureError('');
    setConfigureLoading(true);

    try {
      await configureTenantPayload({
        tenant_id: tenantId.trim(),
        plan: tenantPlan,
        subscription_status: tenantSubscriptionStatus,
      });
      
      setConfigureMessage(`✅ Tenant "${tenantId}" configured successfully.`);
      setTenantId('');
      setTenantName('');
      setTenantPlan('free_trial');
      setTenantSubscriptionStatus('trialing');
    } catch (error: any) {
      setConfigureError(error?.response?.data?.detail || 'Failed to configure tenant');
    } finally {
      setConfigureLoading(false);
    }
  };

  // Non-vendor view
  if (!isVendor) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8", className)}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="text-center">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-400/30 shadow-lg"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatType: "mirror" 
            }}
          >
            <span className="text-3xl">🏢</span>
          </motion.div>
          
          <h2 className="text-xl font-light text-white mb-4 bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-lg">
            Company Configuration
          </h2>
          <p className="text-sm text-white/60 mb-6 font-light leading-relaxed max-w-md mx-auto">
            Company creation is managed by the vendor. You can upload documents into
            existing collections for your company if your role allows it.
          </p>
          
          {user?.tenant_id && (
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 backdrop-blur-sm shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <span className="text-xs text-white/70 font-light">Your tenant:</span>
              <span className="font-light text-sm text-[#9b87f5]">{user.tenant_id}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Vendor configuration form
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-1 relative overflow-hidden", className)}
      style={{
        background: 'linear-gradient(145deg, rgba(10, 6, 19, 0.9) 0%, rgba(21, 13, 39, 0.9) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/20 via-transparent to-purple-600/20 rounded-3xl blur opacity-75 animate-pulse" />
      
      <div className="relative z-10 bg-[#0a0613]/95 backdrop-blur-xl rounded-3xl p-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center border-b border-white/5 pb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 mb-6">
            <span className="w-2 h-2 bg-gradient-to-r from-[#9b87f5] to-purple-500 rounded-full shadow-md" />
            <span className="text-sm font-light text-[#9b87f5]">Vendor Console</span>
          </div>
          <h1 className="text-3xl font-light bg-gradient-to-r from-white via-[#9b87f5] to-purple-400 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Configure Tenant
          </h1>
          <p className="text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
            Provision new companies or update existing tenant configurations with plans and subscription status.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleConfigure} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-end">
          {/* Tenant ID */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 text-xs font-light text-white/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm" />
              Tenant ID <span className="text-[#9b87f5]">*</span>
            </label>
            <div className="relative group">
              <Input
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                type="text"
                placeholder="e.g. acme_corp"
                className="w-full h-14 px-5 py-3 text-sm font-light bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(155,_135,_245,_0.2)]"
                required
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="text-xs text-white/40 font-light">
              Stable identifier for API calls and routing
            </p>
          </motion.div>

          {/* Display Name */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 text-xs font-light text-white/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-indigo-400/80 rounded-full shadow-sm" />
              Display Name
            </label>
            <Input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              type="text"
              placeholder="e.g. Acme Corporation"
              className="w-full h-14 px-5 py-3 text-sm font-light bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(155,_135,_245,_0.15)]"
            />
            <p className="text-xs text-white/40 font-light">
              Friendly name shown in the UI
            </p>
          </motion.div>

          {/* Plan Select */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 text-xs font-light text-white/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full shadow-sm" />
              Plan
            </label>
            <div className="relative">
              <select
                value={tenantPlan}
                onChange={(e) => setTenantPlan(e.target.value as typeof tenantPlan)}
                className="w-full h-14 px-5 py-3 text-sm font-light bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-white focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-lg appearance-none cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(155,_135,_245,_0.15)]"
                required
              >
                <option value="free_trial">Free Trial</option>
                <option value="starter">Starter ($29/mo)</option>
                <option value="pro">Pro ($99/mo)</option>
                <option value="enterprise">Enterprise (Custom)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Status Select */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 lg:col-span-2"
          >
            <label className="flex items-center gap-2 text-xs font-light text-white/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm" />
              Subscription Status
            </label>
            <div className="relative">
              <select
                value={tenantSubscriptionStatus}
                onChange={(e) => setTenantSubscriptionStatus(e.target.value as typeof tenantSubscriptionStatus)}
                className="w-full h-14 px-5 py-3 text-sm font-light bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-white focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-lg appearance-none cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(155,_135,_245,_0.15)]"
                required
              >
                <option value="trialing">🧪 Trialing</option>
                <option value="active">✅ Active</option>
                <option value="expired">⏰ Expired</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Trial Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 space-y-3"
          >
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 backdrop-blur-sm shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mt-1 flex-shrink-0 shadow-sm" />
                <div className="font-light text-sm text-white/80 leading-relaxed">
                  <strong className="text-[#9b87f5]">Free Trial Note:</strong> For <span className="font-semibold text-emerald-300">free_trial</span> 
                  tenants with <span className="font-semibold text-emerald-300">trialing</span> status, the backend automatically computes 
                  and stores the trial end date (30 days from creation).
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 pt-4 lg:col-span-3"
          >
            <motion.button
              type="button"
              onClick={() => {
                setTenantId('');
                setTenantName('');
                setTenantPlan('free_trial');
                setTenantSubscriptionStatus('trialing');
              }}
              className="flex-1 h-14 px-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 font-light shadow-lg hover:shadow-[0_0_20px_rgba(255,_255,_255,_0.1)] hover:border-white/30 hover:text-white transition-all duration-300 hover:bg-white/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset Form
            </motion.button>
            <motion.button
              type="submit"
              disabled={configureLoading || !tenantId.trim()}
              className="flex-1 h-14 px-8 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white font-light shadow-xl hover:shadow-[0_0_30px_rgba(155,_135,_245,_0.5)] hover:from-[#9b87f5]/90 hover:to-purple-600/90 hover:scale-[1.02] transition-all duration-300 rounded-2xl border-2 border-[#9b87f5]/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {configureLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  <span className="font-light">Configuring...</span>
                </>
              ) : (
                <>
                  <span className="font-light">Create / Update Tenant</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Messages */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-2"
        >
          {configureMessage && (
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-400/40 backdrop-blur-sm shadow-lg text-emerald-100 font-light text-sm shadow-emerald-500/25"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              {configureMessage}
            </motion.div>
          )}
          {configureError && (
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/40 backdrop-blur-sm shadow-lg text-red-100 font-light text-sm shadow-red-500/25"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              {configureError}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TenantConfigForm;
