import { useCallback, useEffect, useState } from "react";

export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState('');

    useEffect(() => {
        if (!('speechSynthesis' in window)) return;

        const loadVoices = () => {
            const speechVoices = window.speechSynthesis.getVoices();
            setVoices(speechVoices);
            if(!selectedVoiceName && speechVoices.length) {
                const enVoice = 
                     speechVoices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
                     speechVoices[0];
                setSelectedVoiceName(enVoice.name);      
            }
        };

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoiceName]);

    const speak = useCallback(
        (text: string) => {
        if(!('speechSynthesis' in window) || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find((v) => v.name === selectedVoiceName);
        if(voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang || '';
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);

    },

      [voices, selectedVoiceName]
    );

    const stopSpeaking = useCallback(() => {
        if('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { isSpeaking, voices, selectedVoiceName, setSelectedVoiceName, speak, stopSpeaking};

}