// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// import { useAuthStore } from '../../useAuthStore';
// import { useQueryStream, type ChartSpec } from '@/composables/useQueryStream';
// import { listConversations, getConversation, deleteConversation } from '../../lib/api';
// import type { ChatMessage, Conversation } from './types';

// export const useChatLogic = () => {
//   const { accessToken, user, logout } = useAuthStore();
//   const isAuthenticated = !!accessToken && !!user;

//   // Core UI state
//   const [question, setQuestion] = useState('');
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [conversationId, setConversationId] = useState(() => uuidv4());
//   const [selectedConversationId, setSelectedConversationId] = useState(conversationId);
  
//   // Interaction state
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [editBuffer, setEditBuffer] = useState('');
//   const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
//   // TTS state
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
//   const [selectedVoiceName, setSelectedVoiceName] = useState('');

//   // Refs
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const {
//     answer: streamedAnswer,
//     status: streamStatus,
//     isStreaming,
//     suggestions,
//     chartSpec,
//     startStream,
//     stopStream,
//   } = useQueryStream();

//   const isSubmitDisabled = useMemo(
//     () => loading || isStreaming || !question.trim(),
//     [loading, isStreaming, question]
//   );

//   const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
//   const isEmptyState = messages.length === 0;

//   // Stream effects
//   useEffect(() => {
//     if (streamStatus?.startsWith("You don't have access") || 
//         streamStatus?.startsWith("You don't have permission")) {
//       setError(streamStatus || 'Access denied');
//       return;
//     }

//     if (lastMessage?.role === 'assistant' && streamedAnswer) {
//       setMessages(prev => prev.map((msg, idx) =>
//         idx === messages.length - 1 ? { ...msg, text: streamedAnswer } : msg
//       ));
//     }
//   }, [streamStatus, streamedAnswer, lastMessage?.role, messages.length]);

//   useEffect(() => {
//     if (chartSpec?.length && lastMessage?.role === 'assistant') {
//       setMessages(prev => {
//         const updated = [...prev];
//         updated[updated.length - 1] = { 
//           ...updated[updated.length - 1], 
//           chart_specs: chartSpec 
//         };
//         return updated;
//       });
//     }
//   }, [chartSpec, lastMessage?.role]);

//   // Auto-scroll
//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages.length, scrollToBottom]);

//   // TTS voices
//   useEffect(() => {
//     if (!('speechSynthesis' in window)) return;

//     const loadVoices = () => {
//       const speechVoices = window.speechSynthesis.getVoices();
//       setVoices(speechVoices);
//       if (!selectedVoiceName && speechVoices.length) {
//         const enVoice = speechVoices.find(v => v.lang?.toLowerCase().startsWith('en')) ?? speechVoices[0];
//         setSelectedVoiceName(enVoice.name);
//       }
//     };

//     loadVoices();
//     window.speechSynthesis.onvoiceschanged = loadVoices;

//     return () => {
//       window.speechSynthesis.onvoiceschanged = null;
//     };
//   }, [selectedVoiceName]);

//   // Conversations
//   const loadConversations = useCallback(async () => {
//     try {
//       const res = await listConversations();
//       setConversations(Array.isArray(res?.data) ? res.data : []);
//     } catch (error) {
//       console.error('Failed to load conversations:', error);
//       setConversations([]);
//     }
//   }, []);

//   useEffect(() => {
//     loadConversations();
//   }, [loadConversations]);

//   const formatDate = useCallback((dateString?: string) => {
//     return dateString ? new Date(dateString).toLocaleString() : '';
//   }, []);

//   // TTS handlers
//   const speak = useCallback((text: string) => {
//     if (!('speechSynthesis' in window) || !text) return;

//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     const voice = voices.find(v => v.name === selectedVoiceName);
    
//     if (voice) {
//       utterance.voice = voice;
//       utterance.lang = voice.lang || '';
//     }

//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);

//     window.speechSynthesis.speak(utterance);
//   }, [voices, selectedVoiceName]);

//   const stopSpeaking = useCallback(() => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       setIsSpeaking(false);
//     }
//   }, []);

//   // Conversation handlers
//   const openConversation = useCallback(async (convId: string) => {
//     await stopStream();
//     stopSpeaking();
//     setSelectedConversationId(convId);
//     setConversationId(convId);
//     setError('');
//     setLoading(true);

//     try {
//       const res = await getConversation(convId);
//       const history = res.data?.messages || [];
//       setMessages(history.map(([role, content, meta]: [string, string, any], index: number) => ({
//         id: meta?.id ?? `${convId}-${index}`,
//         role: role as 'user' | 'assistant',
//         text: content,
//         sources: meta?.sources || [],
//         chart_specs: meta?.chart_specs || (meta?.chart_spec ? [meta.chart_spec] : []),
//       })));
//     } catch (e: any) {
//       setError(e?.response?.data?.detail || 'Failed to load conversation.');
//     } finally {
//       setLoading(false);
//     }
//   }, [stopStream, stopSpeaking]);

//   const startNewConversation = useCallback(() => {
//     const newId = uuidv4();
//     setConversationId(newId);
//     setSelectedConversationId(newId);
//     setMessages([]);
//     setQuestion('');
//     setError('');
//   }, []);

//   const onDeleteConversation = useCallback(async (convId: string) => {
//     if (!window.confirm('Delete this conversation and its messages?')) return;

//     try {
//       await deleteConversation(convId);
//       setConversations(prev => prev.filter(c => c.conversation_id !== convId));
//       if (selectedConversationId === convId) {
//         await stopStream();
//         stopSpeaking();
//         startNewConversation();
//       }
//     } catch (e: any) {
//       setError(e?.response?.data?.detail || 'Failed to delete conversation.');
//     }
//   }, [selectedConversationId, stopStream, stopSpeaking, startNewConversation]);

//   // Edit handlers
//   const startEditing = useCallback((msg: ChatMessage) => {
//     setEditingMessageId(msg.id);
//     setEditBuffer(msg.text);
//     textareaRef.current?.focus();
//   }, []);

//   const cancelEditing = useCallback(() => {
//     setEditingMessageId(null);
//     setEditBuffer('');
//   }, []);

//   const resendEdited = useCallback(() => {
//     const newText = editBuffer.trim();
//     if (!newText || isStreaming) return;

//     cancelEditing();

//     const editingMsgIndex = messages.findIndex(m => m.id === editingMessageId);
//     if (editingMsgIndex === -1) return;

//     setMessages(prev => prev.slice(0, editingMsgIndex));
//     const newUserMsg = { id: uuidv4(), role: 'user' as const, text: newText, sources: [] };
//     const newAssistantMsg = { id: uuidv4(), role: 'assistant' as const, text: '', sources: [] };
//     setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);

//     stopStream();
//     startStream({ question: newText, conversation_id: selectedConversationId });
//   }, [editBuffer, isStreaming, messages, editingMessageId, cancelEditing, stopStream, startStream, selectedConversationId]);

//   const onAsk = useCallback(async () => {
//     const trimmedQuestion = question.trim();
//     if (!trimmedQuestion || loading || isStreaming) return;

//     const asked = trimmedQuestion;
//     setQuestion('');

//     const newUserMsg = { id: uuidv4(), role: 'user' as const, text: asked, sources: [] };
//     const newAssistantMsg = { id: uuidv4(), role: 'assistant' as const, text: '', sources: [] };
    
//     setMessages(prev => [...prev, newUserMsg, newAssistantMsg]);
//     setError('');

//     requestAnimationFrame(() => {
//       startStream({ question: asked, conversation_id: conversationId });
//     });
//   }, [question, loading, isStreaming, conversationId, startStream]);

//   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
//       e.preventDefault();
//       onAsk();
//     }
//   }, [onAsk, isStreaming]);

//   const onSuggestionClick = useCallback((suggestion: string) => {
//     if (loading || isStreaming) return;
//     setQuestion(suggestion);
//     setTimeout(() => onAsk(), 0);
//   }, [loading, isStreaming, onAsk]);

//   return {
//     // Auth
//     isAuthenticated,
    
//     // State
//     question, 
//     messages, 
//     conversations, 
//     error, 
//     isEmptyState, 
//     isSubmitDisabled,
//     isStreaming, 
//     suggestions, 
//     editingMessageId, 
//     editBuffer, 
//     selectedConversationId,
//     isSpeaking,
//     voices,
//     selectedVoiceName,
//     conversationId,
//     loading,
    
//     // Refs
//     textareaRef, 
//     messagesEndRef,
    
//     // Handlers
//     setQuestion,
//     setEditBuffer,
//     onAsk, 
//     handleKeyDown, 
//     onSuggestionClick, 
//     startEditing, 
//     cancelEditing,
//     resendEdited, 
//     logout,
//     scrollToBottom, 
//     formatDate, 
//     speak, 
//     stopSpeaking,
//     openConversation,
//     startNewConversation,
//     onDeleteConversation,
//     loadConversations,
//     onLogout: logout,
//   };
// };
