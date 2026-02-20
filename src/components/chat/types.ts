import { ChartSpec } from '@/composables/useQueryStream';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  chart_specs?: ChartSpec[];
}

export interface Conversation {
  conversation_id: string;
  first_question: string;
  last_activity_at: string;
}
