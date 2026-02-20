import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const ErrorBanner: React.FC<{ error: string; onDismiss: () => void }> = ({
  error,
  onDismiss,
}) => (
  <div className="mx-4 mb-3 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-300 shrink-0">
    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
    <span className="flex-1">{error}</span>
    <button
      onClick={onDismiss}
      className="p-0.5 hover:bg-red-500/20 rounded-md transition-colors flex-shrink-0"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);
