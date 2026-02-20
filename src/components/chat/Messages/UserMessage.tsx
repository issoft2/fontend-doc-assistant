import React from 'react';
import { Edit3 } from 'lucide-react';
import { ChatMessage } from '../types';

interface UserMessageProps {
  msg: ChatMessage;
  editingMessageId: string | null;
  editBuffer: string;
  onEditBufferChange: (text: string) => void;
  onStartEditing: (msg: ChatMessage) => void;
  onCancelEditing: () => void;
  onResendEdited: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  msg,
  editingMessageId,
  editBuffer,
  onEditBufferChange,
  onStartEditing,
  onCancelEditing,
  onResendEdited,
  textareaRef,
}) => {
  if (editingMessageId === msg.id) {
    return (
      <EditingUserMessage
        editBuffer={editBuffer}
        onEditBufferChange={onEditBufferChange}
        onCancelEditing={onCancelEditing}
        onResendEdited={onResendEdited}
        textareaRef={textareaRef}
      />
    );
  }

  return (
    <div className="flex justify-end">
      <div className="group/msg relative max-w-2xl">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl rounded-br-sm px-5 py-3.5 shadow-lg">
          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{msg.text}</p>
        </div>
        <button
          type="button"
          onClick={() => onStartEditing(msg)}
          className="absolute -bottom-5 right-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/60 text-[10px] text-slate-400 opacity-0 group-hover/msg:opacity-100 hover:text-slate-200 hover:border-slate-600 transition-all duration-150"
        >
          <Edit3 className="w-2.5 h-2.5" />
          Edit & resend
        </button>
      </div>
    </div>
  );
};

// ─── Inline edit form ─────────────────────────────────────────────────────────

interface EditingUserMessageProps {
  editBuffer: string;
  onEditBufferChange: (text: string) => void;
  onCancelEditing: () => void;
  onResendEdited: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const EditingUserMessage: React.FC<EditingUserMessageProps> = ({
  editBuffer,
  onEditBufferChange,
  onCancelEditing,
  onResendEdited,
  textareaRef,
}) => (
  <div className="flex justify-end">
    <div className="max-w-2xl w-full bg-slate-800/80 border border-indigo-500/30 rounded-2xl rounded-br-sm px-4 py-3.5 shadow-xl">
      <p className="text-[10px] font-medium text-indigo-400 mb-2 flex items-center gap-1">
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 012.828 2.828l-8.5 8.5L5 15l.086-2.914 8.5-8.5z" />
        </svg>
        Editing — resending will generate a new answer
      </p>
      <textarea
        ref={textareaRef}
        value={editBuffer}
        onChange={(e) => onEditBufferChange(e.target.value)}
        rows={3}
        className="w-full resize-none bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
        placeholder="Update your question…"
      />
      <div className="flex justify-end gap-2 mt-2.5">
        <button
          type="button"
          onClick={onCancelEditing}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onResendEdited}
          className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Save & resend
        </button>
      </div>
    </div>
  </div>
);
