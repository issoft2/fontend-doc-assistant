import React from 'react';
import { Send, Square } from 'lucide-react';

interface InputFormProps {
  question: string;
  onQuestionChange: (text: string) => void;
  suggestions: string[];
  isSubmitDisabled: boolean;
  isStreaming: boolean;
  onAsk: () => void;
  onStopStream: () => void;
  onSuggestionClick: (suggestion: string) => void;
  placeholder: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  question,
  onQuestionChange,
  suggestions,
  isSubmitDisabled,
  isStreaming,
  onAsk,
  onStopStream,
  onSuggestionClick,
  placeholder,
  textareaRef,
  handleKeyDown,
}) => (
  <div className="px-4 pb-4 pt-3 border-t border-slate-800/50 bg-slate-950/60 backdrop-blur-sm shrink-0">
    {/* Suggestion chips */}
    {suggestions.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {suggestions.slice(0, 3).map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s)}
            className="px-3 py-1 text-[11px] bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-full transition-all duration-150"
          >
            {s}
          </button>
        ))}
      </div>
    )}

    {/* Input row */}
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 180) + 'px';
          }}
          placeholder={placeholder}
          disabled={isStreaming}
          rows={1}
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 min-h-[46px] max-h-[180px] resize-none transition-all disabled:opacity-50"
        />
        {/* Keyboard hint */}
        {!isStreaming && (
          <span className="absolute right-3 bottom-3 text-[10px] text-slate-600 pointer-events-none select-none hidden sm:block">
            ↵ send
          </span>
        )}
      </div>

      {/* Send / Stop button */}
      {isStreaming ? (
        <button
          onClick={onStopStream}
          title="Stop generating"
          className="w-11 h-11 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl border border-slate-600 transition-all flex-shrink-0"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      ) : (
        <button
          onClick={onAsk}
          disabled={isSubmitDisabled}
          title="Send (Enter)"
          className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);
