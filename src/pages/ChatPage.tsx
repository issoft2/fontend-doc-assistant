import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuthStore } from '../useAuthStore';
import { useQueryStream } from '@/composables/useQueryStream';
import { useTTS } from '../hooks/useTTS';
import { useConversations } from '../hooks/useConvsations'
import { useMessageEditing } from '../hooks/useMessageEditing';

// Components
import { Sidebar } from '../components/chat/Sidebar/Sidebar';
import { Header } from '../components/chat/Header/Header';
import { MessagesArea, EmptyStateChat } from '../components/chat/Messages/MessagesArea'
;import { InputForm } from '../components/chat/InputFrom';
import { ErrorBanner } from '../components/chat/ErrorBanner';

import { ChatMessage } from '../components/chat/types';

const ChatPage: React.FC = () => {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const { accessToken, user, logout } = useAuthStore();
  const isAuthenticated = !!accessToken && !!user;

  // ─── Core state ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Extracted hooks ──────────────────────────────────────────────────────
  const { isSpeaking, voices, selectedVoiceName, setSelectedVoiceName, speak, stopSpeaking } = useTTS();

  const {
    conversations,
    conversationId,
    selectedConversationId,
    loadConversations,
    openConversation,
    startNewConversation,
    removeConversation,
  } = useConversations();

  const {
    editingMessageId,
    editBuffer,
    setEditBuffer,
    startEditing,
    cancelEditing,
  } = useMessageEditing();

  const {
    answer: streamedAnswer,
    status: streamStatus,
    isStreaming,
    suggestions,
    chartSpec,
    startStream,
    stopStream,
  } = useQueryStream();

  // ─── Derived ──────────────────────────────────────────────────────────────
  const isEmptyState = messages.length === 0;
  const lastMessage = messages[messages.length - 1];

  const isSubmitDisabled = useMemo(
    () => isStreaming || !question.trim(),
    [isStreaming, question]
  );

  // ─── Auth guard — must be AFTER all hooks ─────────────────────────────────
  // Returning null after hooks is safe here because hooks are always called in the same order.
  // For a proper guard, wrap ChatPage in a ProtectedRoute parent component instead.
  if (!isAuthenticated) return null;

  // ─── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // ─── Load conversations on mount ──────────────────────────────────────────
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ─── Sync streamed answer into last assistant message ─────────────────────
  useEffect(() => {
    if (streamStatus?.startsWith("You don't have access") ||
      streamStatus?.startsWith("You don't have permission")) {
      setError(streamStatus || 'Access denied');
      return;
    }
    if (lastMessage?.role === 'assistant' && streamedAnswer) {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, text: streamedAnswer } : msg
        )
      );
    }
  }, [streamStatus, streamedAnswer, lastMessage?.role]);

  // ─── Sync chart specs into last assistant message ─────────────────────────
  useEffect(() => {
    if (chartSpec?.length && lastMessage?.role === 'assistant') {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], chart_specs: chartSpec };
        return updated;
      });
    }
  }, [chartSpec, lastMessage?.role]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /** Single helper — stops both stream and TTS before navigation */
  const stopAll = useCallback(async () => {
    await stopStream();
    stopSpeaking();
  }, [stopStream, stopSpeaking]);

  const handleOpenConversation = useCallback(
    async (convId: string) => {
      await stopAll();
      setError('');
      await openConversation(convId, setMessages, setError, () => {});
    },
    [stopAll, openConversation]
  );

  const handleNewConversation = useCallback(async () => {
    await stopAll();
    startNewConversation();
    setMessages([]);
    setQuestion('');
    setError('');
  }, [stopAll, startNewConversation]);

  const handleDeleteConversation = useCallback(
    async (convId: string) => {
      const deleted = await removeConversation(convId, setError);
      if (deleted && selectedConversationId === convId) {
        await stopAll();
        handleNewConversation();
      }
    },
    [removeConversation, selectedConversationId, stopAll, handleNewConversation]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const onAsk = useCallback(
    async (overrideQuestion?: string) => {
      const text = (overrideQuestion ?? question).trim();
      if (!text || isStreaming) return;

      if (!overrideQuestion) setQuestion('');

      const newUserMsg: ChatMessage = { id: uuidv4(), role: 'user', text, sources: [] };
      const newAssistantMsg: ChatMessage = { id: uuidv4(), role: 'assistant', text: '', sources: [] };
      setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
      setError('');

      requestAnimationFrame(() => {
        startStream({ question: text, conversation_id: conversationId });
      });
    },
    [question, isStreaming, conversationId, startStream]
  );

  const resendEdited = useCallback(() => {
    const newText = editBuffer.trim();
    if (!newText || isStreaming) return;

    const editingMsgIndex = messages.findIndex((m) => m.id === editingMessageId);
    if (editingMsgIndex === -1) return;

    cancelEditing();
    setMessages((prev) => prev.slice(0, editingMsgIndex));

    const newUserMsg: ChatMessage = { id: uuidv4(), role: 'user', text: newText, sources: [] };
    const newAssistantMsg: ChatMessage = { id: uuidv4(), role: 'assistant', text: '', sources: [] };
    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);

    stopStream();
    startStream({ question: newText, conversation_id: selectedConversationId });
  }, [editBuffer, isStreaming, messages, editingMessageId, cancelEditing, stopStream, startStream, selectedConversationId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
        e.preventDefault();
        onAsk();
      }
    },
    [onAsk, isStreaming]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (isStreaming) return;
      onAsk(suggestion);
    },
    [isStreaming, onAsk]
  );

  const userRole = (user as any)?.role || '';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      <div className="h-full w-full flex flex-col lg:flex-row">

        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          orgName={(user as any)?.org_name}
          onConversationSelect={handleOpenConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        <main className="flex flex-col flex-1 bg-slate-900 overflow-hidden">

          <Header
            isSpeaking={isSpeaking}
            voices={voices}
            selectedVoiceName={selectedVoiceName}
            onVoiceChange={setSelectedVoiceName}
            onStopSpeaking={stopSpeaking}
            onLogout={handleLogout}
            userRole={userRole}
          />

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {isEmptyState ? (
              <EmptyStateChat onPromptClick={(prompt) => onAsk(prompt)} />
            ) : (
              <MessagesArea
                messages={messages}
                isStreaming={isStreaming}
                editingMessageId={editingMessageId}
                editBuffer={editBuffer}
                onEditBufferChange={setEditBuffer}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onResendEdited={resendEdited}
                onSpeak={speak}
                textareaRef={textareaRef}
                messagesEndRef={messagesEndRef}
              />
            )}

            <InputForm
              question={question}
              onQuestionChange={setQuestion}
              suggestions={suggestions}
              isSubmitDisabled={isSubmitDisabled}
              isStreaming={isStreaming}
              onAsk={onAsk}
              onStopStream={stopStream}
              onSuggestionClick={handleSuggestionClick}
              placeholder={
                isEmptyState
                  ? 'Ask about your policies or financials…'
                  : 'Ask a follow-up or request a chart…'
              }
              textareaRef={textareaRef}
              handleKeyDown={handleKeyDown}
            />

            {error && <ErrorBanner error={error} onDismiss={() => setError('')} />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
