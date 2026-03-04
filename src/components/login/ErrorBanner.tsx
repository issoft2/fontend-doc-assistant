import { motion, AnimatePresence } from 'framer-motion';

interface ErrorBannerProps {
  message: string;
}

const ErrorBanner = ({ message }: ErrorBannerProps) => (
  <AnimatePresence>
    {message && (
      <motion.div
        className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <p className="text-sm font-medium text-red-300 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {message}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ErrorBanner;
