// import React from 'react';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';
// import { MessagesArea } from './components/MessagesArea';
// import { InputForm } from './components/InputForm';
// import { ErrorBanner } from './ui/ErrorBanner';
// import { useChatLogic } from './useChatLogic';
// import { ChatMessage, Conversation } from './types'

// const ChatPage: React.FC = () => {
//   const {
//     question, messages, conversations, selectedConversationId,
//     isEmptyState, isSubmitDisabled, isStreaming, suggestions, error,
//     textareaRef, messagesEndRef,
//     onAsk, onQuestionChange, onSuggestionClick, handleKeyDown,
//     onLogout, onStartEditing, onCancelEditing, onResendEdited,
//     onEditBufferChange, editBuffer, editingMessageId, onSpeak,
//   } = useChatLogic();

//   if (!isAuthenticated) return null;

//   return (
//     <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex overflow-hidden">
//       <div className="h-full w-full flex flex-col lg:flex-row">
//         <Sidebar 
//           conversations={conversations}
//           selectedConversationId={selectedConversationId}
//           onConversationSelect={openConversation}
//           onNewConversation={startNewConversation}
//           onDeleteConversation={onDeleteConversation}
//           formatDate={formatDate}
//         />
//         <main className="flex flex-col flex-1 bg-slate-900/95 backdrop-blur-xl overflow-hidden">
//           <Header 
//             isSpeaking={isSpeaking}
//             voices={voices}
//             selectedVoiceName={selectedVoiceName}
//             onVoiceChange={setSelectedVoiceName}
//             onStopSpeaking={stopSpeaking}
//             onLogout={onLogout}
//           />
//           <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
//             <MessagesArea
//               messages={messages}
//               isEmptyState={isEmptyState}
//               editingMessageId={editingMessageId}
//               editBuffer={editBuffer}
//               onEditBufferChange={onEditBufferChange}
//               onStartEditing={onStartEditing}
//               onCancelEditing={onCancelEditing}
//               onResendEdited={onResendEdited}
//               onSpeak={onSpeak}
//               textareaRef={textareaRef}
//               messagesEndRef={messagesEndRef}
//             />
//             <InputForm
//               question={question}
//               onQuestionChange={onQuestionChange}
//               suggestions={suggestions}
//               isSubmitDisabled={isSubmitDisabled}
//               isStreaming={isStreaming}
//               onAsk={onAsk}
//               onSuggestionClick={onSuggestionClick}
//               placeholder={/* ... */}
//               textareaRef={textareaRef}
//               handleKeyDown={handleKeyDown}
//             />
//             {error && <ErrorBanner error={error} onDismiss={() => setError('')} />}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
