/**
 * useCopilot Hook
 * 
 * React hook for getting AI-powered code completions
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface CursorPosition {
  line: number;
  column: number;
}

interface Completion {
  text: string;
  displayText: string;
  position: CursorPosition;
  range: {
    start: CursorPosition;
    end: CursorPosition;
  };
}

interface CompletionContext {
  fileName?: string;
  imports?: string[];
  nearbyCode?: string;
}

export const useCopilot = (
  code: string,
  language: string,
  cursorPosition: CursorPosition | null,
  context?: CompletionContext
) => {
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch completion with debounce
  const fetchCompletion = useCallback(async () => {
    if (!cursorPosition || !code) {
      setCompletion(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/copilot/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          cursorPosition,
          context,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch completion');
      }

      const data = await response.json();
      
      if (data.completions && data.completions.length > 0) {
        setCompletion(data.completions[0]);
      } else {
        setCompletion(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch completion');
      setCompletion(null);
    } finally {
      setLoading(false);
    }
  }, [code, language, cursorPosition, context]);

  // Debounced completion fetch
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchCompletion();
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchCompletion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const acceptCompletion = useCallback(() => {
    setCompletion(null);
  }, []);

  const rejectCompletion = useCallback(() => {
    setCompletion(null);
  }, []);

  return {
    completion,
    loading,
    error,
    acceptCompletion,
    rejectCompletion,
    refetch: fetchCompletion,
  };
};
