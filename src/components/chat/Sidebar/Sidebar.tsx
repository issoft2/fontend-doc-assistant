import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Search } from 'lucide-react';
import { Conversation } from '../types';
import { ConversationItem } from '../Sidebar/Conversationitem'
import { EmptyConversations } from './EmptyConversations';
import { formatRelativeDate } from '../../../lib/dateUtils';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string;
  orgName?: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  selectedConversationId,
  orgName = 'My Workspace',
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
}) => {
  const [search, setSearch] = useState('');

  // Filter + group conversations by relative date
  const grouped = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.first_question?.toLowerCase().includes(search.toLowerCase())
    );

    const groups: Record<string, Conversation[]> = {};
    filtered.forEach((conv) => {
      const label = formatRelativeDate(conv.last_activity_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(conv);
    });

    // Ordered labels
    const order = ['Today', 'Yesterday', 'This Week', 'Older'];
    return order.filter((k) => groups[k]).map((k) => ({ label: k, items: groups[k] }));
  }, [conversations, search]);

  return (
    <aside className="w-full lg:w-72 xl:w-80 bg-slate-950 border-r border-slate-800/60 flex-col shadow-2xl hidden lg:flex">
      {/* Org header */}
      <div className="px-4 pt-5 pb-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Workspace</p>
            <p className="text-sm font-semibold text-slate-100 truncate">{orgName}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 py-2 shrink-0">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all duration-200 group"
        >
          <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          New conversation
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {grouped.length === 0 ? (
          <EmptyConversations hasSearch={!!search} />
        ) : (
          grouped.map(({ label, items }) => (
            <div key={label} className="mb-2">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {label}
              </p>
              <AnimatePresence>
                {items.map((conv) => (
                  <ConversationItem
                    key={conv.conversation_id}
                    conversation={conv}
                    isSelected={conv.conversation_id === selectedConversationId}
                    onSelect={() => onConversationSelect(conv.conversation_id)}
                    onDelete={() => onDeleteConversation(conv.conversation_id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
