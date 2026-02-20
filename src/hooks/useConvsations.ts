import { v4 as uuidv4 } from 'uuid';
import { useCallback, useState } from "react";
import { deleteConversation, getConversation, listConversations } from '@/lib/api';
import { Conversation, ChatMessage } from '../components/chat/types';


export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationId, setConversationId] = useState(() => uuidv4());
    const [selectedConversationId, setSelectedConversationId] = useState(conversationId);

    const loadConversations = useCallback(async () => {
        try{
            const res = await listConversations();
            setConversations(Array.isArray(res?.data) ? res.data : []);
        } catch {
            setConversations([]);
        }
    }, []);

    const openConversation = useCallback(
        async (
            convId: string,
            onMessages: (msgs: ChatMessage[]) => void,
            onError: (msg: string) => void,
            onLoadingChange: (v: boolean) => void
        ) => {
            setSelectedConversationId(convId);
            setConversationId(convId);
            onLoadingChange(true);
            try {
                const res = await getConversation(convId);
                const history = res.data?.messages || [];
                onMessages(
                    history.map(([role, content, meta]: [string, string, any], index: number) => ({
                        id: meta?.id ?? `${convId}-${index}`,
                        role: role as 'user' | 'assistant',
                        text: content,
                        sources: meta?.sources || [],
                        chart_specs: meta?.chart_specs || (meta?.chart_spec ? [meta.chart_spec] : []),
                    }))
                );
            } catch (e: any) {
                onError(e?.response?.data?.detail || "Failed to load conversation");
            } finally {
                onLoadingChange(false);
            }      
        },
        [] );

        const startNewConversation = useCallback(() => {
                const newId = uuidv4();
                setConversationId(newId);
                setSelectedConversationId(newId);
                return newId;
        }, []);

        const removeConversation = useCallback(
            async (
                convid: string,
                onError: (msg: string) => void,
            ) => {
                try {
                    await deleteConversation(convid);
                    setConversations((prev) => prev.filter((c) => c.conversation_id !== convid));
                    return true;
                } catch (e: any) {
                    onError(e?.response?.data?.detail || 'Failed to delete conversation.');
                    return false;
                }1
            },
            []
        );

        return {
            conversations,
            conversationId,
            selectedConversationId,
            setSelectedConversationId,
            loadConversations,
            openConversation,
            startNewConversation,
            removeConversation,
        };
}