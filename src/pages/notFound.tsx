import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, FileText, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animation-delay-2000 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-auto text-center">
        {/* Main 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="mx-auto w-48 h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl backdrop-blur-xl border border-slate-800/50 flex items-center justify-center shadow-2xl">
            <AlertTriangle className="w-24 h-24 text-indigo-400 drop-shadow-lg" />
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 drop-shadow-2xl tracking-tight"
        >
          404
        </motion.h1>

        {/* Main Message */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl md:text-3xl font-medium text-white mb-8 max-w-md mx-auto leading-tight"
        >
          Hmm... this page didn&apos;t survive the data migration
        </motion.p>

        {/* Subtext */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-slate-400 text-lg mb-12 max-w-md mx-auto leading-relaxed"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="/chat"
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 max-w-sm w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Go to AI Chat
          </motion.a>

          <motion.button
            onClick={() => window.history.back()}
            className="px-8 py-4 border-2 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center gap-3 max-w-sm w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Search hint */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 pt-8 border-t border-slate-800/50"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-2">
            <Search className="w-4 h-4" />
            <span>Try searching or</span>
            <a href="/chat" className="text-indigo-400 hover:text-indigo-300 font-medium">
              start chatting
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
