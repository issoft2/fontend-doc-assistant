
import { useState, useRef, useCallback, useEffect } from 'react';


export interface ChartSpec {
  chart_type: 'line' | 'bar' | 'area';
  title: string;
  x_field: string;
  x_label: string;
  y_fields: string[];
  y_label: string;
  data: Array<Record<string, number | string>>;
}

const TYPE_SPEED_MS = 12;
const streamError = { state: null as string | null };

export function useQueryStream() {
  // State
  const [answer, setAnswer] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chartSpec, setChartSpec] = useState<ChartSpec[] | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const fullAnswerRef = useRef('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typing animation
  const startTyping = useCallback((text: string, speed = TYPE_SPEED_MS) => {
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current);
    }
    
    setAnswer('');
    fullAnswerRef.current = text;
    
    if (!text) return;

    let i = 0;
    const tick = () => {
      if (i >= text.length) {
        typingIntervalRef.current = null;
        return;
      }
      setAnswer(text.slice(0, i + 1));
      i += 1;
      typingIntervalRef.current = setTimeout(tick, speed);
    };
    tick();
  }, []);

  // Main streaming function
  const startStream = useCallback(async (payload: {
    question: string;
    conversation_id: string;
    top_k?: number;
    collection_name?: string | null;
  }) => {
    setAnswer('');
    setSuggestions([]);
    setStatuses([]);
    setStatus('');
    setChartSpec(null);
    setIsStreaming(true);
    fullAnswerRef.current = '';

    const params = new URLSearchParams({
      question: payload.question,
      conversation_id: payload.conversation_id,
      top_k: String(payload.top_k ?? 20),
    });

    if (payload.collection_name) {
      params.set('collection_name', payload.collection_name);
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      params.set('token', token);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const url = `/api/query/stream?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      // ✅ FIX 1: Handle 401/403 without logout (parent handles it)
      if (response.status === 401) {
        setStatus('Authentication failed');
        setIsStreaming(false);
        abortControllerRef.current = null;
        return;
      }

      if (response.status === 403) {
        const message = "You don't have permission to run this query.";
        streamError.state = message;
        setStatus(message);
        setStatuses(prev => [...prev, message]);
        setIsStreaming(false);
        abortControllerRef.current = null;
        return;
      }

      if (!response.ok || !response.body) {
        const errorMsg = `Error: stream failed with status ${response.status}`;
        setStatus(errorMsg);
        setStatuses(prev => [...prev, errorMsg]);
        setIsStreaming(false);
        abortControllerRef.current = null;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\\n\\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\\n');
          let eventType = 'message';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice('event:'.length).trim();
            } else if (line.startsWith('data:')) {
              if (data) data += '\\n';
              data += line.slice('data:'.length).trim();
            }
          }

          switch (eventType) {
            case 'status':
              const msg = data || '';
              setStatus(msg);
              if (msg) setStatuses(prev => [...prev, msg]);
              break;

            case 'token':
              const delta = (data || '').replace(/<\\|n\\|>/g, '\\n');
              fullAnswerRef.current += delta;
              break;

            case 'suggestions':
              try {
                const parsed = JSON.parse(data || '[]');
                setSuggestions(Array.isArray(parsed) ? parsed : parsed?.suggestions || []);
              } catch {
                setSuggestions([]);
              }
              break;

            case 'chart':
              try {
                const parsed = JSON.parse(data || '{}');
                let charts: ChartSpec[] = [];
                
                if (Array.isArray(parsed)) {
                  charts = parsed;
                } else if (parsed?.charts) {
                  charts = parsed.charts;
                } else if (parsed?.chart) {
                  charts = [parsed.chart];
                } else if (parsed) {
                  charts = [parsed as ChartSpec];
                }
                
                setChartSpec(charts.length ? charts : null);
              } catch {
                setChartSpec(null);
              }
              break;

            case 'done':
              setStatus('Completed');
              setStatuses(prev => [...prev, 'Completed']);
              setIsStreaming(false);
              controller.abort();
              abortControllerRef.current = null;
              if (fullAnswerRef.current) startTyping(fullAnswerRef.current);
              return;
          }
        }
      }

      setIsStreaming(false);
      abortControllerRef.current = null;
      if (fullAnswerRef.current) startTyping(fullAnswerRef.current);
    } catch (err: any) {
      if (controller.signal.aborted) {
        setStatus('Stopped');
        setStatuses(prev => [...prev, 'Stopped']);
      } else {
        setStatus('Error occurred during streaming.');
        setStatuses(prev => [...prev, 'Error occurred during streaming.']);
      }
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [startTyping]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setStatus('Stopped');
    setStatuses(prev => [...prev, 'Stopped']);
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (typingIntervalRef.current) clearTimeout(typingIntervalRef.current);
    };
  }, []);

  return {
    answer,
    status,
    statuses,
    isStreaming,
    suggestions,
    chartSpec,
    startStream,
    stopStream,
    streamError: streamError.state,
  };
}
