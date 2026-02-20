import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { TypingIndicator } from './TypingIndicator';

interface MessagesAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  editingMessageId: string | null;
  editBuffer: string;
  onEditBufferChange: (text: string) => void;
  onStartEditing: (msg: ChatMessage) => void;
  onCancelEditing: () => void;
  onResendEdited: () => void;
  onSpeak: (text: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  isStreaming,
  editingMessageId,
  editBuffer,
  onEditBufferChange,
  onStartEditing,
  onCancelEditing,
  onResendEdited,
  onSpeak,
  textareaRef,
  messagesEndRef,
}) => {
  const lastMsg = messages[messages.length - 1];
  // Show typing indicator when streaming and the last assistant message is empty
  const showTyping = isStreaming && lastMsg?.role === 'assistant' && !lastMsg?.text;

  return (
    <section className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {msg.role === 'user' ? (
              <UserMessage
                msg={msg}
                editingMessageId={editingMessageId}
                editBuffer={editBuffer}
                onEditBufferChange={onEditBufferChange}
                onStartEditing={onStartEditing}
                onCancelEditing={onCancelEditing}
                onResendEdited={onResendEdited}
                textareaRef={textareaRef}
              />
            ) : (
              // Only render AssistantMessage if it has content; otherwise show typing
              msg.text || !isStreaming ? (
                <AssistantMessage msg={msg} onSpeak={onSpeak} isStreaming={isStreaming && msg === lastMsg} />
              ) : null
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {showTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </section>
  );
};

// ─── Empty state shown when no messages ───────────────────────────────────────

const STARTER_PROMPTS = [
  'Show me Q1 2024 revenue vs last year',
  'Summarize top risks in our policy docs',
  'Compare gross margin trends as a chart',
  'What does SAAS mean in our documents?',
];

export const EmptyStateChat: React.FC<{ onPromptClick: (prompt: string) => void }> = ({
  onPromptClick,
}) => (
  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center select-none">
    <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
      <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4 15.3"
        />
      </svg>
    </div>
    <h2 className="text-lg font-bold text-slate-200 mb-2">Ask your first question</h2>
    <p className="text-sm text-slate-500 max-w-sm mb-7">
      Query your documents in plain English — get answers, tables, and charts instantly.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
      {STARTER_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onPromptClick(prompt)}
          className="px-4 py-3 text-xs text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-200"
        >
          "{prompt}"
        </button>
      ))}
    </div>
  </div>
);
