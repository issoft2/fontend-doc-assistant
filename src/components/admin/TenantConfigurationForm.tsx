// src/pages/admin/TenantConfigForm.tsx - ✅ USES EXISTING API
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { configureTenantPayload } from '@/lib/api'; // ✅ YOUR EXISTING API

interface TenantFormData {
  tenant_id: string;
  plan: 'free_trial' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'trialing' | 'active' | 'expired' | 'cancelled';
}

const TenantConfigForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantFormData>({
    tenant_id: '', // ✅ Required by your API
    plan: 'free_trial',
    subscription_status: 'trialing'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // ✅ USES YOUR EXISTING API
      await configureTenantPayload(formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/tenants');
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to configure tenant');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full flex items-center justify-center p-6 lg:p-12 isolate bg-transparent relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-400/40 rounded-3xl shadow-2xl p-16 lg:p-24 text-center max-w-2xl w-full"
          style={{
            background: 'linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(34,197,94,0.08) 100%)',
          }}
        >
          <div className="w-28 h-28 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-emerald-400/30 shadow-2xl">
            <CheckCircle className="w-20 h-20 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-light mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
            Tenant Configured!
          </h1>
          <p className="text-xl text-white/80 font-light mb-8 max-w-md mx-auto leading-relaxed">
            Your tenant configuration has been successfully updated.
          </p>
          <p className="text-emerald-300 font-light text-lg">Redirecting to tenant list...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full space-y-12 p-6 lg:p-12 isolate bg-transparent relative z-10"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/admin/tenants')}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:shadow-lg transition-all duration-200 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                Configure Tenant
              </h1>
              <p className="text-xl text-white/60 font-light mt-2">Update tenant plan and subscription settings</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 lg:p-12 rounded-3xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/40 backdrop-blur-sm shadow-2xl text-red-100 font-light flex items-center gap-4 max-w-2xl mx-auto"
        >
          <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-lg">{error}</span>
        </motion.div>
      )}

      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden isolate"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tenant ID */}
            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block mb-3">Tenant ID <span className="text-emerald-400">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. tenant_abc123"
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block mb-3">Subscription Plan</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'free_trial', label: '🧪 Free Trial', desc: '14 days trial' },
                  { value: 'starter', label: '⭐ Starter', desc: '$29/mo' },
                  { value: 'pro', label: '🚀 Pro', desc: '$99/mo' },
                  { value: 'enterprise', label: '🏆 Enterprise', desc: 'Custom' }
                ].map((plan) => (
                  <motion.button
                    key={plan.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.value as any })}
                    disabled={loading}
                    className={cn(
                      "group relative h-28 p-6 rounded-2xl border-2 backdrop-blur-sm shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center disabled:opacity-50",
                      formData.plan === plan.value
                        ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,_185,_129,_0.3)] scale-105"
                        : "border-white/20 bg-white/5 hover:border-emerald-400/30 hover:bg-emerald-500/5 hover:shadow-[0_0_20px_rgba(16,_185,_129,_0.2)]"
                    )}
                    whileHover={{ y: -4 }}
                  >
                    <span className="text-2xl mb-2">{plan.label.split(' ')[0]}</span>
                    <span className="font-light text-white/90 group-hover:text-emerald-300">{plan.label.split(' ').slice(1).join(' ')}</span>
                    <span className="text-xs text-white/60 mt-1">{plan.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block mb-3">Subscription Status</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'trialing', label: '⏳ Trialing', desc: 'Active trial' },
                  { value: 'active', label: '✅ Active', desc: 'Paid plan' },
                  { value: 'expired', label: '⏰ Expired', desc: 'Past due' },
                  { value: 'cancelled', label: '❌ Cancelled', desc: 'Inactive' }
                ].map((status) => (
                  <motion.button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, subscription_status: status.value as any })}
                    disabled={loading}
                    className={cn(
                      "group relative h-28 p-6 rounded-2xl border-2 backdrop-blur-sm shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center disabled:opacity-50",
                      formData.subscription_status === status.value
                        ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,_185,_129,_0.3)] scale-105"
                        : "border-white/20 bg-white/5 hover:border-emerald-400/30 hover:bg-emerald-500/5 hover:shadow-[0_0_20px_rgba(16,_185,_129,_0.2)]"
                    )}
                    whileHover={{ y: -4 }}
                  >
                    <span className="text-2xl mb-2">{status.label.split(' ')[0]}</span>
                    <span className="font-light text-white/90 group-hover:text-emerald-300">{status.label.split(' ').slice(1).join(' ')}</span>
                    <span className="text-xs text-white/60 mt-1">{status.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 border-t border-white/10 flex gap-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/tenants')}
                disabled={loading}
                className="h-16 px-12 text-lg font-light border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-3xl flex-1 shadow-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.tenant_id}
                className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl flex-1 shadow-2xl hover:shadow-[0_0_40px_rgba(16,_185,_129,_0.4)] transition-all duration-300 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    Configure Tenant
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TenantConfigForm;
