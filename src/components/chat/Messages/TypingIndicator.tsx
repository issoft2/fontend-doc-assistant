import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700/40 rounded-2xl rounded-tl-sm">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </div>
);
