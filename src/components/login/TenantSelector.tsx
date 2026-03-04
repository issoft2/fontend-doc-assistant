import { motion } from 'framer-motion';
import { Building2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { slideRight } from './login.types';
import type { TenantOption } from './login.types';

interface TenantSelectorProps {
  tenants: TenantOption[];
  selectedTenantId: string;
  loading: boolean;
  onSelect: (tenantId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const TenantSelector = ({
  tenants,
  selectedTenantId,
  loading,
  onSelect,
  onSubmit,
  onBack,
}: TenantSelectorProps) => (
  <motion.form
    key="form-step2"
    onSubmit={onSubmit}
    className="space-y-5"
    variants={slideRight}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {/* Company cards */}
    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {tenants.map((t, i) => {
        const isSelected = selectedTenantId === t.tenant_id.toString();
        return (
          <motion.button
            key={t.tenant_id}
            type="button"
            onClick={() => onSelect(t.tenant_id.toString())}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
              isSelected
                ? 'border-indigo-500/70 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600/70 hover:bg-slate-800/50'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            {/* Company icon */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              isSelected ? 'bg-indigo-500/30' : 'bg-slate-700/60'
            }`}>
              <Building2 className={`h-5 w-5 ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {t.name || t.tenant_id}
              </div>
              {t.role && (
                <div className={`text-xs mt-0.5 capitalize ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {t.role.replace(/_/g, ' ')}
                </div>
              )}
            </div>

            {/* Selection checkmark */}
            <motion.div
              animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          </motion.button>
        );
      })}
    </div>

    {/* Continue button */}
    <motion.button
      type="submit"
      disabled={loading || !selectedTenantId}
      className="group relative w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-base font-semibold text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: selectedTenantId && !loading ? 1.01 : 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</>
        ) : (
          <><span>Continue to dashboard</span><ChevronRight className="h-4 w-4" /></>
        )}
      </span>
    </motion.button>

    {/* Back link */}
    <motion.button
      type="button"
      onClick={onBack}
      className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
      whileHover={{ x: -3 }}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to sign in
    </motion.button>
  </motion.form>
);

export default TenantSelector;