import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import MarkdownText from '@/components/MarkdownText';
import ChartRenderer from '@/components/ChartRenderer';
import { type ChartSpec } from '@/composables/useQueryStream';
import { ChatMessage } from '../types';

interface AssistantMessageProps {
  msg: ChatMessage;
  onSpeak: (text: string) => void;
  isStreaming?: boolean;
  // ✅ ADDED: isLastMessage so streaming treatment only applies to the
  // actively-generating message, not every assistant message in the thread.
  isLastMessage?: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  msg,
  onSpeak,
  isStreaming,
  isLastMessage,
}) => {
  // ✅ ADDED: Scoped flag — true only for the message currently being streamed.
  // Without this, isStreaming=true would apply plain-text rendering to ALL
  // assistant messages in the conversation, re-rendering old messages as
  // unstyled text while a new one is generating.
  const activelyStreaming = isStreaming && isLastMessage;

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {msg.text && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl rounded-tl-sm px-5 py-4">

            {activelyStreaming ? (
              // ✅ CHANGED: Plain <p> with whitespace-pre-wrap during streaming.
              // Feeding partial/incomplete markdown to react-markdown causes it to
              // collapse whitespace — producing the squished wall-of-text with no
              // spaces between words. whitespace-pre-wrap renders raw tokens
              // exactly as they arrive: spaces, newlines and all. Clean and readable.
              // Once isStreaming flips false, the block below takes over with the
              // full well-formed string and renders markdown correctly.
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </p>
            ) : (
              // Completed message — full markdown string, parses correctly
              <MarkdownText
                content={msg.text}
                className="prose prose-invert max-w-none text-slate-100 text-sm leading-relaxed answer-content"
              />
            )}

            {/* Blinking cursor — only on the actively streaming message */}
            {activelyStreaming && (
              <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Charts — only shown on completed messages */}
        {!activelyStreaming && msg.chart_specs?.length ? (
          <ChartsSection chartSpecs={msg.chart_specs} />
        ) : null}

        {/* Listen button — hidden while streaming */}
        {msg.text && !activelyStreaming && (
          <button
            type="button"
            onClick={() => onSpeak(msg.text)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-[11px] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all duration-150"
          >
            <Volume2 className="w-3 h-3" />
            Listen
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Charts section ───────────────────────────────────────────────────────────

const ChartsSection: React.FC<{ chartSpecs: ChartSpec[] }> = ({ chartSpecs }) => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      Visual answer
    </p>
    {chartSpecs.map((spec, i) => (
      <ChartRenderer
        key={i}
        spec={spec}
        className="w-full bg-slate-900/70 rounded-2xl border border-slate-800/60 p-3"
      />
    ))}
  </div>
);