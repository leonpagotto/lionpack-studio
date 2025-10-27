/**
 * Copilot Suggestions Hook
 *
 * Manages inline code suggestions similar to GitHub Copilot
 * - Triggers suggestions on typing (debounced)
 * - Manages suggestion state
 * - Handles accept/reject actions
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface Suggestion {
  text: string;
  displayText: string;
  position: {
    line: number;
    column: number;
  };
}

interface SuggestionRequest {
  code: string;
  language: string;
  cursorPosition: {
    line: number;
    column: number;
  };
  context?: {
    fileName?: string;
    imports?: string[];
    nearbyCode?: string;
  };
}

interface UseCopilotSuggestionsOptions {
  enabled?: boolean;
  debounceMs?: number;
  minCharsBeforeSuggest?: number;
}

export function useCopilotSuggestions(options: UseCopilotSuggestionsOptions = {}) {
  const {
    enabled = true,
    debounceMs = 500,
    minCharsBeforeSuggest = 3,
  } = options;

  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Request a suggestion from the Copilot API
   */
  const requestSuggestion = useCallback(
    async (request: SuggestionRequest) => {
      if (!enabled) return;

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check minimum character requirement
      const lines = request.code.split('\n');
      const currentLine = lines[request.cursorPosition.line - 1] || '';
      const beforeCursor = currentLine.substring(0, request.cursorPosition.column);

      if (beforeCursor.trim().length < minCharsBeforeSuggest) {
        setCurrentSuggestion(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/copilot/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get suggestion');
        }

        const data = await response.json();

        if (data.completions && data.completions.length > 0) {
          setCurrentSuggestion(data.completions[0]);
        } else {
          setCurrentSuggestion(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }

        console.error('Copilot suggestion error:', err);
        setError(err instanceof Error ? err.message : 'Failed to get suggestion');
        setCurrentSuggestion(null);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, minCharsBeforeSuggest]
  );

  /**
   * Trigger a suggestion with debouncing
   */
  const triggerSuggestion = useCallback(
    (request: SuggestionRequest) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        requestSuggestion(request);
      }, debounceMs);
    },
    [debounceMs, requestSuggestion]
  );

  /**
   * Accept the current suggestion
   */
  const acceptSuggestion = useCallback(() => {
    if (!currentSuggestion) return null;

    const accepted = currentSuggestion.text;
    setCurrentSuggestion(null);
    return accepted;
  }, [currentSuggestion]);

  /**
   * Reject the current suggestion
   */
  const rejectSuggestion = useCallback(() => {
    setCurrentSuggestion(null);
  }, []);

  /**
   * Clear any pending suggestion requests
   */
  const clearSuggestion = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentSuggestion(null);
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    currentSuggestion,
    isLoading,
    error,
    triggerSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  };
}

export type { Suggestion, SuggestionRequest };
