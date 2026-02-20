import React from 'react';
import { MessageSquare, SearchX } from 'lucide-react';

export const EmptyConversations: React.FC<{ hasSearch?: boolean }> = ({ hasSearch }) => (
  <div className="text-center py-10 px-4">
    <div className="w-12 h-12 mx-auto mb-3 bg-slate-800/50 rounded-2xl flex items-center justify-center">
      {hasSearch
        ? <SearchX className="w-6 h-6 text-slate-600" />
        : <MessageSquare className="w-6 h-6 text-slate-600" />
      }
    </div>
    <p className="text-xs font-medium text-slate-500">
      {hasSearch ? 'No results found' : 'No conversations yet'}
    </p>
    <p className="text-[11px] text-slate-600 mt-1">
      {hasSearch ? 'Try a different search term' : 'Start a new chat to see it here'}
    </p>
  </div>
);
