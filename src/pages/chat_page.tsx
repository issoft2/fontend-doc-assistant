// SendIcon, Loader2, 
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../useAuthStore'; // Adjust path as neededimport { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import {  Mic, Trash2, Edit3, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import MarkdownText from '../components/MarkdownText';
import ChartRenderer from '../components/ChartRenderer';
import { listConversations, getConversation, deleteConversation } from '../lib/api';
import { useQueryStream, type ChartSpec } from '@/composables/useQueryStream';
import EmptyState  from '../components/EmptyState';



interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  chart_specs?: ChartSpec[];
}

interface Conversation {
  conversation_id: string;
  first_question: string;
  last_activity_at: string;
}

const ChatPage: React.FC = () => {
  // Auth hook
  const { accessToken, user } = useAuthStore();
  const isAuthenticated = !!accessToken && !!user;
  const authLoading = false; // Zustand loads instantly from storage

  // UI state
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [editBuffer, setEditBuffer] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState(() => uuidv4());
  const [selectedConversationId, setSelectedConversationId] = useState(conversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    answer: streamedAnswer,
    status: streamStatus,
    isStreaming,
    suggestions,
    chartSpec,
    startStream,
    stopStream,
  } = useQueryStream();

  // Auth guard

  // Loading screen
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Memoized values
  const isSubmitDisabled = useMemo(
    () => loading || isStreaming || !question.trim(),
    [loading, isStreaming, question]
  );

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
  const isEmptyState = messages.length === 0;

  // Consolidated streaming effects
  useEffect(() => {
    if (streamStatus?.startsWith("You don't have access") || streamStatus?.startsWith("You don't have permission")) {
      setError(streamStatus);
      return;
    }

    if (lastMessage?.role === 'assistant' && streamedAnswer) {
      setMessages(prev => prev.map((msg, idx) =>
        idx === messages.length - 1 ? { ...msg, text: streamedAnswer } : msg
      ));
    }
  }, [streamStatus, streamedAnswer, lastMessage?.role, messages.length]);

  // Handle chart specs
  useEffect(() => {
    if (chartSpec?.length && lastMessage?.role === 'assistant') {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          ...updated[updated.length - 1], 
          chart_specs: chartSpec 
        };
        return updated;
      });
    }
  }, [chartSpec, lastMessage?.role]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Load TTS voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const speechVoices = window.speechSynthesis.getVoices();
      setVoices(speechVoices);
      if (!selectedVoiceName && speechVoices.length) {
        const enVoice = speechVoices.find(v => v.lang?.toLowerCase().startsWith('en')) ?? speechVoices[0];
        setSelectedVoiceName(enVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceName]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await listConversations();
      setConversations(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatDate = useCallback((dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString() : '';
  }, []);

  // TTS handlers
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoiceName);
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || '';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voices, selectedVoiceName]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Conversation handlers
  const openConversation = useCallback(async (convId: string) => {
    await stopStream();
    stopSpeaking();
    setSelectedConversationId(convId);
    setConversationId(convId);
    setError('');
    setLoading(true);

    try {
      const res = await getConversation(convId);
      const history = res.data?.messages || [];
      setMessages(history.map(([role, content, meta]: [string, string, any], index: number) => ({
        id: meta?.id ?? `${convId}-${index}`,
        role: role as 'user' | 'assistant',
        text: content,
        sources: meta?.sources || [],
        chart_specs: meta?.chart_specs || (meta?.chart_spec ? [meta.chart_spec] : []),
      })));
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load conversation.');
    } finally {
      setLoading(false);
    }
  }, [stopStream, stopSpeaking]);

  const startNewConversation = useCallback(() => {
    const newId = uuidv4();
    setConversationId(newId);
    setSelectedConversationId(newId);
    setMessages([]);
    setQuestion('');
    setError('');
  }, []);

  const onDeleteConversation = useCallback(async (convId: string) => {
    if (!window.confirm('Delete this conversation and its messages?')) return;

    try {
      await deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.conversation_id !== convId));
      if (selectedConversationId === convId) {
        await stopStream();
        stopSpeaking();
        startNewConversation();
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to delete conversation.');
    }
  }, [selectedConversationId, stopStream, stopSpeaking, startNewConversation]);

  // Edit handlers
  const startEditing = useCallback((msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditBuffer(msg.text);
    textareaRef.current?.focus();
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditBuffer('');
  }, []);

  const resendEdited = useCallback(async (msg: ChatMessage) => {
    const newText = editBuffer.trim();
    if (!newText || isStreaming) return;

    cancelEditing();

    const startIdx = messages.findIndex(m => m.id === msg.id);
    if (startIdx === -1) return;

    setMessages(prev => prev.slice(0, startIdx));
    const newUserMsg = { id: uuidv4(), role: 'user' as const, text: newText, sources: [] };
    const newAssistantMsg = { id: uuidv4(), role: 'assistant' as const, text: '', sources: [] };
    setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);

    await stopStream();
    await startStream({ question: newText, conversation_id: selectedConversationId });
  }, [editBuffer, isStreaming, messages, cancelEditing, stopStream, startStream, selectedConversationId]);

  // FIXED onAsk - prevents blank page on Enter
  const onAsk = useCallback(async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading || isStreaming) return;

    // Clear input FIRST
    const asked = trimmedQuestion;
    setQuestion('');

    // Add messages optimistically
    const newUserMsg = { id: uuidv4(), role: 'user' as const, text: asked, sources: [] };
    const newAssistantMsg = { id: uuidv4(), role: 'assistant' as const, text: '', sources: [] };
    
    setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);
    setError('');

    // Start streaming AFTER state updates
    requestAnimationFrame(() => {
      startStream({ question: asked, conversation_id: conversationId });
    });
  }, [question, loading, isStreaming, conversationId, startStream]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      onAsk();
    }
  }, [onAsk, isStreaming]);

  const onSuggestionClick = useCallback((suggestion: string) => {
    if (loading || isStreaming) return;
    setQuestion(suggestion);
    // Use setTimeout to ensure state updates before onAsk
    setTimeout(() => onAsk(), 0);
  }, [loading, isStreaming, onAsk]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex overflow-hidden">
      <div className="h-full w-full flex flex-col lg:flex-row">
        {/* Sidebar - Full height, hidden on mobile */}
        <aside className="bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col w-full lg:w-80 lg:max-w-sm shadow-2xl hidden lg:flex">
          <div className="p-4 flex items-center justify-between border-b border-slate-800/70 shrink-0">
            <h2 className="text-sm font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent">
              Conversations
            </h2>
            <button
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all duration-200"
              onClick={startNewConversation}
            >
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <AnimatePresence>
              {Array.isArray(conversations) && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <motion.div
                    key={conv.conversation_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className={cn(
                      "group/conversation w-full rounded-2xl p-3 border border-slate-800/50 hover:border-slate-700/70 hover:bg-slate-800/30 transition-all duration-200 flex items-start justify-between gap-3 text-left cursor-pointer",
                      conv.conversation_id === selectedConversationId && 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    )}
                    onClick={() => openConversation(conv.conversation_id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate group-hover/conversation:text-white transition-colors">
                        {conv.first_question || 'Untitled conversation'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        {formatDate(conv.last_activity_at)}
                        {conv.conversation_id === selectedConversationId && (
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                    <button
                      className="opacity-0 group-hover/conversation:opacity-100 p-1.5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.conversation_id);
                      }}
                      title="Delete conversation"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No conversations yet</p>
                  <p className="text-xs text-slate-600 mt-1">Start a new chat to see it here</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main chat area - Full screen */}
        <main className="flex flex-col flex-1 bg-slate-900/95 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <header className="p-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent mb-1">
                  Ask your data. See it as charts.
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Ask in natural language. Answers stay within your company documents and can include tables and charts when relevant.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <Mic className={`w-4 h-4 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="bg-transparent text-sm text-slate-200 border-0 outline-none cursor-pointer hover:text-white transition-colors"
                    disabled={isSpeaking}
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="ml-2 p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title="Stop speaking"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Messages */}
            {isEmptyState ? (
              <EmptyState onQuestionSet={setQuestion} />
            ) : (
              
              <section className="flex-1 overflow-y-auto p-6 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="group space-y-4"
                    >
                      {msg.role === 'user' ? (
                        <UserMessage msg={msg} 
                          editingMessageId={editingMessageId} 
                          editBuffer={editBuffer}
                          onEditBufferChange={setEditBuffer}
                          onStartEditing={startEditing}
                          onCancelEditing={cancelEditing}
                          onResendEdited={resendEdited}
                          textareaRef={textareaRef}
                        />
                      ) : (
                        <AssistantMessage msg={msg} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </section>
            )}

            {/* Input form */}
            <InputForm
              question={question}
              onQuestionChange={setQuestion}
              suggestions={suggestions}
              isSubmitDisabled={isSubmitDisabled}
              isStreaming={isStreaming}
              onAsk={onAsk}
              onSuggestionClick={onSuggestionClick}
              placeholder={isEmptyState ? 'Ask about your policies or financials. Try "Compare Q1 2023 vs 2024 as charts".' : 'Ask a follow-up or request a chart…'}
              textareaRef={textareaRef}
              handleKeyDown={handleKeyDown}
            />

            {/* Error display */}
            {error && (
              <div className="p-4 border-t border-slate-800/50 bg-red-500/10 border-red-500/30 shrink-0">
                <div className="text-sm text-red-300 flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                  <button
                    onClick={() => setError('')}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};


// In UserMessage component:
interface UserMessageProps {
  msg: ChatMessage;
  editingMessageId: string | null;
  editBuffer: string;
  onEditBufferChange: (text: string) => void;
  onStartEditing: (msg: ChatMessage) => void;
  onCancelEditing: () => void;
  onResendEdited: (msg: ChatMessage) => Promise<void>;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>; // ✅ FIXED: nullable + optional
}

// User Message Component
const UserMessage: React.FC<{
  msg: ChatMessage;
  editingMessageId: string | null;
  editBuffer: string;
  onEditBufferChange: (text: string) => void;
  onStartEditing: (msg: ChatMessage) => void;
  onCancelEditing: () => void;
  onResendEdited: (msg: ChatMessage) => Promise<void>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}> = ({
  msg,
  editingMessageId,
  editBuffer,
  onEditBufferChange,
  onStartEditing,
  onCancelEditing,
  onResendEdited,
  textareaRef
}) => {
  if (editingMessageId === msg.id) {
    return (
      <div className="flex justify-end">
        <div className="relative max-w-2xl bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl rounded-br-sm p-5 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-indigo-100/80">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5L5 15l.086-2.914 8.5-8.5z" />
                  <path d="M4 16h12v2H4z" />
                </svg>
                Editing your question
              </span>
              <span className="text-slate-200/70">This will resend a new answer</span>
            </div>
            <textarea
              ref={textareaRef}
              value={editBuffer}
              onChange={(e) => onEditBufferChange(e.target.value)}
              className="w-full min-h-[72px] max-h-40 resize-none rounded-2xl border-2 border-indigo-300/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-lg transition-all duration-200"
              rows={4}
              placeholder="Update your question and click Resend"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-indigo-100/80">
                The original question remains visible above in the thread.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600/60 transition-all duration-150"
                  onClick={onCancelEditing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold shadow-sm transition-all duration-150"
                  onClick={() => onResendEdited(msg)}
                >
                  Save & resend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="relative max-w-2xl bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl rounded-br-sm p-5 shadow-xl group/message">
        <div className="space-y-2">
          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
            {msg.text}
          </p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-200 opacity-0 group-hover/message:opacity-100 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all duration-200"
              onClick={() => onStartEditing(msg)}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit & resend</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assistant Message Component
const AssistantMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
  <div className="flex">
    <div className="flex flex-col max-w-4xl w-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          {msg.text && (
            <MarkdownText content={msg.text} className="prose prose-invert max-w-none text-slate-100 leading-relaxed answer-content" />
          )}
          
          {msg.chart_specs?.length ? (
            <div className="mt-2 pt-3 border-t border-slate-800/60 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Visual answer
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {msg.chart_specs.map((spec, i) => (
                  <ChartRenderer key={i} spec={spec} className="w-full bg-slate-900/80 rounded-2xl border border-slate-800/70 p-3" />
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="text-[11px] px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:bg-slate-800 flex items-center gap-1"
            onClick={() => speak(msg.text)}
          >
            <Volume2 className="h-3 w-3" />
            Listen
          </button>
        </div>
      </div>
    </div>
  </div>
);


export default ChatPage;
