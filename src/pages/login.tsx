import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

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

// type Tenant = {
//   tenant_id: number;
//   role: string;
// };

const  Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // const [tenants, setTenant] = useState<[] | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
      
      try{
        const data = await login(email, password);

        // Phase2 
        if (data.requires_tenant_selection) {
          // setTenant(data.tenant);
          return;
        }

        // Phase 1: single-tenant
        localStorage.setItem("token", data.access_token);
        navigate("/")

      }catch (err: any) {
        setLoading(false);
        setError(err.message);
        error
      }
      setLoading(false);
  };
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <style>{`
        .login-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }
        .login-btn:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="z-10 w-full max-w-6xl">
        <div className="bg-secondary/50 overflow-hidden rounded-[40px] shadow-2xl">
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side */}
            <div className="brand-side relative m-4 rounded-3xl bg-[url('https://cdn.midjourney.com/299f94f9-ecb9-4b26-bead-010b8d8b01d9/0_0.webp?w=800&q=80')] bg-cover p-12 text-white">
              <div>
                <div className="mb-12 text-lg font-semibold uppercase">
                  Ask Your Data
                </div>
                <h1 className="mb-4 text-6xl font-medium">
                   Stop Digging. Start Asking
                </h1>
                <p className="mb-12 text-xl opacity-80">
                  Upgrade your company to join the trend, be one of first 100 who
                are reveraging AI improve productivity
                </p>
                <div className="space-y-6">
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
                      title: 'Cloud Storage',
                      desc: 'Access your Platform from anywhere',
                    },
                    {
                      icon: <ShieldCheck size={16} />,
                      title: "Enterprise data Security",
                      desc: "High-levle of securiy for your data",
                    },
                  ].map(({ icon, title, desc }, i) => (
                    <div
                      key={i}
                      className="feature-item animate-fadeInUp flex items-center"
                      style={{ animationDelay: `${0.2 * (i + 1)}s` }}
                    >
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm">
                        {icon}
                      </div>
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-sm opacity-70">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Side */}
            <div className="flex flex-col justify-center p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-light uppercase">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Sign in to continue your creative journey
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium uppercase"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-3 pl-10 text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium uppercase"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-12 pl-10 text-sm"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="border-border text-primary h-4 w-4 rounded"
                      />
                      <span className="ml-2">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Signing in...</span>
                      </>
                    ) : (
                      'Sign in to your account'
                    )}
                  </button>
                  {/* <div className="relative text-center text-sm text-stone-500">
                    <div className="absolute inset-0 flex items-center">
                      <div className="border-border w-full border-t"></div>
                    </div>
                    <span className="relative px-2">Or continue with</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="border-border bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm shadow-sm"
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="h-5 w-5"
                        alt="Google"
                      />
                      <span className="ml-2">Google</span>
                    </button>
                    <button
                      type="button"
                      className="border-border bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm shadow-sm"
                    >
                      <Github className="h-5 w-5" />
                      <span className="ml-2">GitHub</span>
                    </button>
                  </div> */}
                </form>
                <div className="text-muted-foreground mt-8 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <a href="#" className="text-primary hover:text-primary/80">
                    Sign up for free
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login