import React, { useState } from 'react';

interface DetectionResult {
  intent: string;
  confidence: number;
  reasoning: string;
  matchedKeywords: string[];
  tokens: number;
  timestamp: string;
  version: string;
}

// Simple MVP component for Demo 1
// Provides input box, calls /api/detect-mode, displays result.
export const ModeDetector: React.FC = () => {
  const [text, setText] = useState('Refactor this function to improve performance');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDetect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/detect-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }
      const data = (await res.json()) as DetectionResult;
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>🔍 Mode Detector (Demo 1 MVP)</h2>
      <p style={{ color: '#555', marginTop: 0 }}>
        Enter a natural language request and the system will classify your intent.
      </p>
      <form onSubmit={handleDetect} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontFamily: 'inherit' }}
          placeholder="Describe what you want to do (e.g., 'Fix the bug causing login error')"
          aria-label="Mode detection input"
        />
        <button
          type="submit"
          disabled={loading || text.trim().length === 0}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: 6,
            opacity: loading ? 0.7 : 1,
          }}
          aria-busy={loading}
        >
          {loading ? 'Detecting…' : 'Detect Intent'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', color: '#b91c1c' }} role="alert">
          ❌ {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#f8fafc',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Result</h3>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Intent:</strong> {result.intent}{' '}
            <span style={{ color: '#475569' }}>
              ({Math.round(result.confidence * 100)}% confidence)
            </span>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Reasoning:</strong> {result.reasoning}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Matched Keywords:</strong>{' '}
            {result.matchedKeywords.length ? result.matchedKeywords.join(', ') : 'None'}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Tokens:</strong> {result.tokens}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>
            timestamp: {result.timestamp} • version: {result.version}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModeDetector;
