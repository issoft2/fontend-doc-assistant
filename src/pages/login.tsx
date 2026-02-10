import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '../useAuthStore';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Palette,
  Users,
  Cloud,
  ShieldCheck
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/chat");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };



  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <motion.div 
        className="z-10 w-full max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-slate-900/50 backdrop-blur-xl overflow-hidden rounded-[40px] shadow-2xl border border-slate-800/50"
          variants={itemVariants}
        >
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side - Brand */}
            <motion.div 
              className="brand-side relative m-4 rounded-3xl bg-[url('https://cdn.midjourney.com/299f94f9-ecb9-4b26-bead-010b8d8b01d9/0_0.webp?w=800&q=80')] bg-cover p-12 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-8">
                <motion.div 
                  className="mb-12 text-lg font-semibold uppercase tracking-wider text-indigo-100"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  SMART DATA
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-6xl font-medium leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Stop Digging. 
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                    Start Asking...
                  </span>
                </motion.h1>

                <motion.p 
                  className="text-lg opacity-90 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Upgrade your company to join the trend. Be one of the first 100 
                  leveraging AI to improve productivity.
                </motion.p>

                {/* Animated Features */}
                <div className="space-y-6 mt-12">
                  {[
                    {
                      icon: <Palette size={16} />,
                      title: "Stop Digging, Start Asking",
                      desc: "AI enabled data re-computerization for your company",
                    },
                    {
                      icon: <Users size={16} />,
                      title: "Productivity Enhanced",
                      desc: "Boost your employee productivity in real-time",
                    },
                    {
                      icon: <Cloud size={16} />,
                      title: "Cloud Storage",
                      desc: "Access your Platform from anywhere",
                    },
                    {
                      icon: <ShieldCheck size={16} />,
                      title: "Enterprise Data Security",
                      desc: "High-level security for your data",
                    },
                  ].map(({ icon, title, desc }, i) => (
                    <motion.div
                      key={i}
                      className="feature-item flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-x-2"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{title}</div>
                        <div className="text-sm text-slate-200">{desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div 
              className="flex flex-col justify-center p-12"
              variants={itemVariants}
            >
              <div className="mx-auto w-full max-w-md">
                <motion.div 
                  className="mb-12 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-4xl md:text-5xl font-light uppercase tracking-wide bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
                    Welcome back
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Sign in to continue your creative journey
                  </p>
                </motion.div>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {/* Error Display */}
                  {error && (
                    <motion.div 
                      className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-sm font-medium text-red-300 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1 0z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="mb-3 block text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-sm py-4 pr-4 pl-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 hover:border-slate-600/70"
                        placeholder="Enter your email"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="mb-3 block text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-2xl border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-sm py-4 pr-16 pl-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 hover:border-slate-600/70"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember & Forgot */}
                  <motion.div 
                    className="flex items-center justify-between pt-2"
                    variants={itemVariants}
                  >
                    <label className="flex items-center text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                      <input type="checkbox" className="w-5 h-5 bg-slate-900/50 border-slate-600 rounded-lg text-indigo-500 focus:ring-indigo-500/50 mr-3" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                      Forgot password?
                    </a>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="group relative w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-lg font-semibold text-white shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 overflow-hidden"
                    disabled={loading}
                    transition={{ duration: 0.8 }}
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out opacity-75" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        'Sign in to your account'
                      )}
                    </span>
                  </motion.button>
                </motion.form>

                {/* Sign Up Link */}
                <motion.p 
                  className="mt-10 text-center text-sm text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Don't have an account?{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Sign up for free
                  </a>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
