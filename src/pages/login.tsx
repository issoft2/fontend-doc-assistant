import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../useAuthStore';

import BrandPanel       from '@/components/login/BrandPanel';
import CredentialsForm  from '@/components/login/CredentialsForm';
import TenantSelector   from '@/components/login/TenantSelector';
import ErrorBanner      from '@/components/login/ErrorBanner';
import { containerVariants, itemVariants } from '@/components/login/login.types';
import type { TenantOption, LoginResponse } from '@/components/login/login.types';

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <motion.div
          key={s}
          animate={{
            width: s === step ? 24 : 8,
            backgroundColor: s === step ? '#6366f1' : 'rgba(99,102,241,0.25)',
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 8, borderRadius: 4 }}
        />
      ))}
      <span className="ml-2 text-xs text-slate-500 font-medium tracking-widest uppercase">
        Step {step} of 2
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { login, loginToTenant } = useAuthStore();

  // Step 1
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Step 2
  const [step, setStep]                         = useState<1 | 2>(1);
  const [tenantOptions, setTenantOptions]       = useState<TenantOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');

  function resetTenantSelection() {
    setStep(1);
    setTenantOptions([]);
    setSelectedTenantId('');
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    resetTenantSelection();
    try {
      const res = (await login({ email: email.trim(), password })) as LoginResponse;
      if (res?.requires_tenant_selection) {
        const tenants = res.tenants ?? [];
        if (!tenants.length) { setError('No companies found for this account.'); return; }
        setTenantOptions(tenants);
        setStep(2);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;
    setLoading(true);
    setError('');
    try {
      await loginToTenant({ email: email.trim(), tenant_id: selectedTenantId });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Company login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-slate-950 via-black to-slate-900">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>
      </div>

      <motion.div className="z-10 w-full max-w-6xl" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div
          className="bg-slate-900/50 backdrop-blur-xl overflow-hidden rounded-[40px] shadow-2xl border border-slate-800/50"
          variants={itemVariants}
        >
          <div className="grid min-h-[700px] lg:grid-cols-2">

            {/* Left — brand */}
            <BrandPanel step={step} />

            {/* Right — form */}
            <motion.div className="flex flex-col justify-center p-12" variants={itemVariants}>
              <div className="mx-auto w-full max-w-md">

                <StepDots step={step} />

                {/* Header */}
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div key="header-1" className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
                      <h2 className="text-4xl md:text-5xl font-light uppercase tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3">
                        Welcome back
                      </h2>
                      <p className="text-slate-400">Sign in to continue your journey</p>
                    </motion.div>
                  ) : (
                    <motion.div key="header-2" className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
                      <h2 className="text-4xl md:text-5xl font-light uppercase tracking-wide bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-3">
                        Select Company
                      </h2>
                      <p className="text-slate-400">
                        Signed in as <span className="text-indigo-400 font-medium">{email}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ErrorBanner message={error} />

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <CredentialsForm
                      key="step1"
                      email={email}
                      password={password}
                      loading={loading}
                      onEmailChange={(v) => { setEmail(v); setError(''); }}
                      onPasswordChange={(v) => { setPassword(v); setError(''); }}
                      onSubmit={handleCredentialsSubmit}
                    />
                  ) : (
                    <TenantSelector
                      key="step2"
                      tenants={tenantOptions}
                      selectedTenantId={selectedTenantId}
                      loading={loading}
                      onSelect={(id) => { setSelectedTenantId(id); setError(''); }}
                      onSubmit={handleTenantSubmit}
                      onBack={() => { resetTenantSelection(); setError(''); }}
                    />
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;