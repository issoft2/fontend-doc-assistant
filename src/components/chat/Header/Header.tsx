import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { TTSControls } from './TTSControls';

interface HeaderProps {
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onVoiceChange: (voice: string) => void;
  onStopSpeaking: () => void;
  onLogout: () => void;
  userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSpeaking,
  voices,
  selectedVoiceName,
  onVoiceChange,
  onStopSpeaking,
  onLogout,
  userRole,
}) => {
  const showAdminLink = userRole && userRole !== 'employee';

  return (
    <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-sm shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left — Branding / Page title */}
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-100 leading-tight">
            Ask your data.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              See it as charts.
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            Natural language queries · Stays within your documents · Charts & tables on demand
          </p>
        </div>

        {/* Right — Controls cluster */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <TTSControls
            isSpeaking={isSpeaking}
            voices={voices}
            selectedVoiceName={selectedVoiceName}
            onVoiceChange={onVoiceChange}
            onStopSpeaking={onStopSpeaking}
          />

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700/60" />

          {showAdminLink && (
            <a
              href="/admin"
              title="Admin Panel"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg border border-transparent hover:border-slate-700/50 transition-all duration-200"
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </a>
          )}

          <button
            onClick={onLogout}
            title="Logout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
