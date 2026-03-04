import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Users, Cloud, ShieldCheck } from 'lucide-react';

interface BrandPanelProps {
  step: 1 | 2;
}

const features = [
  { icon: <Palette size={16} />,      title: 'Stop Digging, Start Asking',  desc: 'AI-enabled data re-computerization for your company' },
  { icon: <Users size={16} />,        title: 'Productivity Enhanced',        desc: 'Boost your employee productivity in real-time' },
  { icon: <Cloud size={16} />,        title: 'Cloud Storage',                desc: 'Access your platform from anywhere' },
  { icon: <ShieldCheck size={16} />,  title: 'Enterprise Data Security',     desc: 'High-level security for your data' },
];

const BrandPanel = ({ step }: BrandPanelProps) => (
  <motion.div
    className="relative m-4 rounded-3xl bg-[url('https://cdn.midjourney.com/299f94f9-ecb9-4b26-bead-010b8d8b01d9/0_0.webp?w=800&q=80')] bg-cover p-12 text-white overflow-hidden"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
  >
    {/* Overlay tint shifts on step 2 */}
    <motion.div
      className="absolute inset-0 rounded-3xl"
      animate={{ backgroundColor: step === 2 ? 'rgba(30,27,50,0.35)' : 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.6 }}
    />

    <div className="relative space-y-8">
      <motion.div
        className="mb-12 text-lg font-semibold uppercase tracking-wider text-indigo-100"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        SMART DATA
      </motion.div>

      {/* Headline swaps between steps */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="brand-step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl font-medium leading-tight">
              Stop Digging.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Start Asking...
              </span>
            </h1>
            <p className="mt-4 text-lg opacity-90 leading-relaxed">
              Upgrade your company to join the trend. Be one of the first 100 leveraging AI to improve productivity.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="brand-step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl font-medium leading-tight">
              Almost
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                there.
              </span>
            </h1>
            <p className="mt-4 text-lg opacity-90 leading-relaxed">
              Your account is linked to multiple companies. Pick one to continue.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature cards — dim on step 2 */}
      <motion.div
        className="space-y-4 mt-8"
        animate={{ opacity: step === 2 ? 0.3 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {features.map(({ icon, title, desc }, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ scale: 1.02, x: -4 }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {icon}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{title}</div>
              <div className="text-xs text-slate-300">{desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);

export default BrandPanel;