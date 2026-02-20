import React from 'react';
import { Mic, X } from 'lucide-react';

interface TTSControlsProps {
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onVoiceChange: (voice: string) => void;
  onStopSpeaking: () => void;
}

export const TTSControls: React.FC<TTSControlsProps> = ({
  isSpeaking,
  voices,
  selectedVoiceName,
  onVoiceChange,
  onStopSpeaking,
}) => (
  <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
    <Mic
      className={`w-3.5 h-3.5 flex-shrink-0 ${
        isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
      }`}
    />
    <select
      value={selectedVoiceName}
      onChange={(e) => onVoiceChange(e.target.value)}
      disabled={isSpeaking}
      className="bg-transparent text-xs text-slate-300 border-0 outline-none cursor-pointer hover:text-white transition-colors max-w-[120px] truncate"
    >
      {voices.map((voice) => (
        <option key={voice.name} value={voice.name}>
          {voice.name}
        </option>
      ))}
    </select>
    {isSpeaking && (
      <button
        onClick={onStopSpeaking}
        className="p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
        title="Stop speaking"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);
