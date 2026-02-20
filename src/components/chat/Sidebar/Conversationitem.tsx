import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation } from '../types';
import { formatDate } from '../../../lib/dateUtils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(false);
    onDelete();
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      layout
      className={cn(
        'group/conv relative w-full rounded-xl p-2.5 mb-0.5 border transition-all duration-200 cursor-pointer',
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-sm shadow-indigo-500/10'
          : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700/40'
      )}
      onClick={onSelect}
    >
      {confirmingDelete ? (
        // Inline confirmation — no window.confirm() blocking dialog
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-slate-300 flex-1">Delete?</span>
          <button
            onClick={handleConfirmDelete}
            className="px-2 py-0.5 text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
          >
            Yes
          </button>
          <button
            onClick={handleCancelDelete}
            className="px-2 py-0.5 text-[11px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-xs font-medium truncate transition-colors',
              isSelected ? 'text-indigo-100' : 'text-slate-300 group-hover/conv:text-slate-100'
            )}>
              {conversation.first_question || 'Untitled conversation'}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {formatDate(conversation.last_activity_at)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isSelected && (
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            )}
            <button
              className="opacity-0 group-hover/conv:opacity-100 p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-all duration-150"
              onClick={handleDeleteClick}
              title="Delete conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
