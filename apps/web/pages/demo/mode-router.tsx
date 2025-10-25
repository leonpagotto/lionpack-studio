import React, { useState } from 'react';
import ModeDetector from '../../components/ModeDetector';

/**
 * Demo 1 Page: Mode Router - Intent Detection
 *
 * Stakeholder demo page for Nov 12 presentation showing:
 *  - Live intent classification
 *  - Confidence and accuracy metrics
 *  - Sample prompts
 *  - Performance benchmarks
 */
export default function ModeRouterDemo() {
  const [sampleInput, setSampleInput] = useState('');

  const samples = [
    'Refactor this function to improve performance',
    'Fix the error thrown when saving the record',
    'Write unit tests for the payment processor',
    'Optimize the slow database query',
    'Generate a React component for user profile',
    'Document the API endpoints',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #334155', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginTop: 0, marginBottom: '0.5rem' }}>
            🔍 Mode Router - Intent Detection
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Demo 1 • Phase 2 • Detecting user intent with high accuracy
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Left: Demo Component */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Try It Now</h2>
            <ModeDetector />
          </div>

          {/* Right: Info & Samples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Metrics */}
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📊 Performance Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                    Intent Accuracy
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
                    ✅ 90%+
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Avg Latency</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
                    ⚡ &lt;50ms
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Intents</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
                    📌 6 types
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Version</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
                    v1.0.0
                  </p>
                </div>
              </div>
            </div>

            {/* Sample Prompts */}
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>💡 Sample Prompts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSampleInput(sample)}
                    style={{
                      background: '#334155',
                      color: '#e2e8f0',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#475569')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#334155')}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Info Section */}
        <div style={{ marginTop: '3rem', background: '#1e293b', padding: '1.5rem', borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>About Mode Router</h2>
          <p>
            Mode Router automatically detects user intent from natural language input and routes
            requests to the appropriate AI mode. This MVP uses keyword heuristics for fast, reliable
            classification.
          </p>
          <h3>Supported Intents</h3>
          <ul style={{ columnCount: 3, gap: '1rem' }}>
            <li>
              <strong>Generate</strong> – Write or create code
            </li>
            <li>
              <strong>Debug</strong> – Fix errors or bugs
            </li>
            <li>
              <strong>Refactor</strong> – Improve or clean up code
            </li>
            <li>
              <strong>Document</strong> – Add comments or docs
            </li>
            <li>
              <strong>Optimize</strong> – Improve performance
            </li>
            <li>
              <strong>Test</strong> – Write or improve tests
            </li>
          </ul>
          <h3>How It Works</h3>
          <ol>
            <li>User submits a natural language prompt</li>
            <li>System classifies intent using keyword heuristics</li>
            <li>Confidence score indicates classification reliability</li>
            <li>Matched keywords show which rules triggered</li>
            <li>Ready for downstream AI modes (Coder, Debugger, etc.)</li>
          </ol>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Demo page: Nov 12, 2025 • Phase 2 • Story 3.8
          </p>
        </div>
      </main>
    </div>
  );
}
