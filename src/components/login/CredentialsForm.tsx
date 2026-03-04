import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { slideLeft } from './login.types';

interface CredentialsFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CredentialsForm = ({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: CredentialsFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.form
      key="form-step1"
      onSubmit={onSubmit}
      className="space-y-6"
      variants={slideLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-3 block text-xs font-semibold uppercase tracking-widest text-slate-400">
          Email address
        </label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-2xl border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-sm py-4 pr-4 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 hover:border-slate-600/70 disabled:opacity-50"
            placeholder="you@company.com"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-3 block text-xs font-semibold uppercase tracking-widest text-slate-400">
          Password
        </label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-2xl border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-sm py-4 pr-14 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 hover:border-slate-600/70 disabled:opacity-50"
            placeholder="••••••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500/30"
          />
          Remember me
        </label>
        <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          Forgot password?
        </a>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        className="group relative w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-base font-semibold text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</>
          ) : (
            <><span>Sign in</span><ChevronRight className="h-4 w-4" /></>
          )}
        </span>
      </motion.button>

      <p className="text-center text-sm text-slate-500 pt-2">
        Don't have an account?{' '}
        <a href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign up for free
        </a>
      </p>
    </motion.form>
  );
};

export default CredentialsForm;
