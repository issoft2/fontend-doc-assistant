import { ChatMessage } from '../components/chat/types';
import { useCallback, useState } from "react";

export function useMessageEditing() {
    const [ editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editBuffer, setEditBuffer] = useState('');

    const startEditing = useCallback((msg: ChatMessage) => {
            setEditingMessageId(msg.id);
            setEditBuffer(msg.text);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingMessageId(null);
        setEditBuffer('');
    }, []);

    return { editingMessageId, editBuffer, setEditBuffer, startEditing, cancelEditing };
}