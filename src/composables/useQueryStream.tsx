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

const streamError = { state: null as string | null };

export function useQueryStream() {
  const [answer, setAnswer] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chartSpec, setChartSpec] = useState<ChartSpec[] | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fullAnswerRef = useRef('');

  // ✅ REMOVED: startTyping / typingIntervalRef entirely.
  // The typewriter animation was the root cause of two bugs:
  //   1. Double-render flash — startTyping() called setAnswer('') first, blanking
  //      the already-visible streamed text before re-typing it from scratch.
  //   2. Squished markdown — react-markdown received partial strings character
  //      by character and collapsed whitespace on every incomplete parse.
  // Neither bug exists without the typewriter. The UX is cleaner without it.

  const startStream = useCallback(async (payload: {
    question: string;
    conversation_id: string;
    top_k?: number;
    collection_name?: string | null;
  }) => {
    // Reset all state for a fresh query
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

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
    if (token) params.set('token', token);

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
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split('\n');
          let eventType = 'message';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice('event:'.length).trim();
            } else if (line.startsWith('data:')) {
              if (data) data += '\n';
              // ✅ Use trimStart with limit — only strip the single space
              // after 'data:' per SSE spec. Do NOT use .trim() here —
              // it strips trailing spaces too, which destroys space-only
              // tokens (OpenAI often sends ' ' as a standalone token).
              const raw = line.slice('data:'.length);
              data += raw.startsWith(' ') ? raw.slice(1) : raw;
            }
          }

          if (!data && eventType === 'message') continue;

          switch (eventType) {
            case 'status': {
              const msg = data || '';
              setStatus(msg);
              if (msg) setStatuses(prev => [...prev, msg]);
              break;
            }

            case 'token': {
              // ✅ OPTION B: Accumulate token AND update answer state immediately.
              // During streaming, AssistantMessage renders this as plain <pre> text
              // (not markdown) so whitespace is preserved and there is no squishing.
              // When 'done' fires, isStreaming flips to false and AssistantMessage
              // switches to <MarkdownText> with the same complete string — one clean
              // swap with no flash, no reset, no double render.
              const delta = (data || '').replace(/<\|n\|>/g, '\n');
              fullAnswerRef.current += delta;
              setAnswer(fullAnswerRef.current);
              break;
            }

            case 'suggestions': {
              try {
                const parsed = JSON.parse(data || '[]');
                setSuggestions(
                  Array.isArray(parsed) ? parsed : parsed?.suggestions || []
                );
              } catch {
                setSuggestions([]);
              }
              break;
            }

            case 'chart': {
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
            }

            case 'correction': {
              // The formatter has produced a cleaned version of the answer.
              // Replace the raw streamed tokens with this formatted string.
              // This is what fixes the word-squishing: raw tokens stream fine,
              // then the formatter's output cleanly replaces them before 'done'.
              const corrected = (data || '').replace(/<\|n\|>/g, '\n');
              fullAnswerRef.current = corrected;
              setAnswer(corrected);
              break;
            }

            case 'done': {
              setStatus('Completed');
              setStatuses(prev => [...prev, 'Completed']);
              // Final answer — fullAnswerRef.current holds either the last
              // correction or the raw streamed tokens if no correction came.
              // isStreaming flipping false triggers AssistantMessage to switch
              // from plain <p> to <MarkdownText> for proper markdown rendering.
              if (fullAnswerRef.current) setAnswer(fullAnswerRef.current);
              setIsStreaming(false);
              controller.abort();
              abortControllerRef.current = null;
              return;
            }
          }
        }
      }

      // Stream ended without a 'done' event (connection dropped / timeout)
      if (fullAnswerRef.current) setAnswer(fullAnswerRef.current);
      setIsStreaming(false);
      abortControllerRef.current = null;

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
  }, []);

  const stopStream = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // ✅ REMOVED: typingIntervalRef cleanup (no longer needed)
    setStatus('Stopped');
    setStatuses(prev => [...prev, 'Stopped']);
    setIsStreaming(false);
  }, []);


  // Reset the old state before starting one:

  const resetAnswer = useCallback(() => {
      setAnswer('');
      setStatuses([]);
      setStatus('')
      setSuggestions([]);
      setChartSpec(null);
      fullAnswerRef.current = '';
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
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
    resetAnswer,
    streamError: streamError.state,
  };
}