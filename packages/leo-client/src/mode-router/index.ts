/**
 * Production Mode Router - Phase 2 Story 3.8
 *
 * Responsibilities:
 *  - classifyIntent(text) => { intent, confidence, reasoning }
 *  - Supported intents: generate, debug, refactor, document, optimize, test
 *  - Lightweight, deterministic keyword heuristic (MVP)
 *  - Future: plug-in ML classifier when training data available
 */

export type IntentType =
  | 'generate'
  | 'debug'
  | 'refactor'
  | 'document'
  | 'optimize'
  | 'test'
  | 'unknown';

export interface IntentResult {
  intent: IntentType;
  confidence: number; // 0-1
  reasoning: string;
  matchedKeywords: string[];
  tokens: number; // rough token estimate
}

interface IntentRule {
  intent: IntentType;
  keywords: string[];
  minimumScore?: number; // override default threshold if needed
}

/**
 * Keyword rules (MVP):
 *  - Keep short, explicit word stems for robustness
 *  - Later can add weights, negative keywords, phrase patterns
 */
const INTENT_RULES: IntentRule[] = [
  {
    intent: 'generate',
    keywords: ['code', 'implement', 'write', 'create', 'build', 'function', 'component', 'class'],
  },
  {
    intent: 'debug',
    keywords: ['debug', 'error', 'bug', 'fix', 'broken', 'issue', 'fail', 'stack trace'],
  },
  {
    intent: 'refactor',
    keywords: ['refactor', 'clean', 'restructure', 'improve', 'simplify', 'extract'],
  },
  {
    intent: 'document',
    keywords: ['document', 'docs', 'comment', 'explain', 'describe', 'readme', 'api docs'],
  },
  {
    intent: 'optimize',
    keywords: ['optimize', 'performance', 'slow', 'latency', 'memory', 'speed', 'benchmark'],
  },
  {
    intent: 'test',
    keywords: ['test', 'unit test', 'integration test', 'e2e', 'jest', 'assert', 'spec'],
  },
];

// Default classification confidence threshold
const CONFIDENCE_THRESHOLD = 0.5;

// Basic token estimation: number of whitespace-separated units
function estimateTokens(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function scoreRule(input: string, rule: IntentRule): { score: number; matches: string[] } {
  const lower = input.toLowerCase();
  const matches: string[] = [];
  let score = 0;

  for (const kw of rule.keywords) {
    // allow partial match for multi-word keywords via inclusion
    if (lower.includes(kw)) {
      matches.push(kw);
      score += 1;
    }
  }
  // Normalize score: diminishing returns after 3 matches
  return { score: Math.min(score / 3, 1), matches };
}

export function classifyIntent(input: string): IntentResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      intent: 'unknown',
      confidence: 0,
      reasoning: 'Empty input provided',
      matchedKeywords: [],
      tokens: 0,
    };
  }

  let best: IntentResult = {
    intent: 'unknown',
    confidence: 0,
    reasoning: 'No matching keywords found; defaulting to generate intent later if ambiguous',
    matchedKeywords: [],
    tokens: estimateTokens(trimmed),
  };

  for (const rule of INTENT_RULES) {
    const { score, matches } = scoreRule(trimmed, rule);
    if (score > best.confidence) {
      best = {
        intent: rule.intent,
        confidence: score,
        reasoning: matches.length
          ? `Matched keywords: ${matches.join(', ')}`
          : 'Rule considered but no direct keyword matches',
        matchedKeywords: matches,
        tokens: estimateTokens(trimmed),
      };
    }
  }

  // If no strong match but we saw at least one generate keyword, bias towards generate
  if (best.intent === 'unknown') {
    const generateRule = INTENT_RULES.find(r => r.intent === 'generate')!;
    const genScore = scoreRule(trimmed, generateRule);
    if (genScore.score > 0) {
      best.intent = 'generate';
      best.confidence = Math.min(genScore.score * 0.6, 0.4); // soften confidence when fallback
      best.reasoning = 'Fallback to generate intent (generic coding request)';
      best.matchedKeywords = genScore.matches;
    }
  }

  // Provide guidance if confidence below threshold
  if (best.confidence < CONFIDENCE_THRESHOLD) {
    best.reasoning +=
      ' | Low confidence; consider adding clearer intent words (e.g., refactor, optimize, test).';
  }

  return best;
}

export interface ModeDetectionResponse {
  intent: IntentType;
  confidence: number;
  reasoning: string;
  matchedKeywords: string[];
  tokens: number;
  timestamp: string;
  version: string;
}

export function detectMode(input: string): ModeDetectionResponse {
  const result = classifyIntent(input);
  return {
    ...result,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
}

// Simple manual test runner (can be invoked directly)
if (require.main === module) {
  const samples = [
    'Refactor this function to be cleaner and more efficient',
    'Fix the error thrown when saving the record',
    'Write unit tests for the payment processor',
    'Optimize performance of this slow query',
    'Generate a React component for user profile',
    'Document the API endpoints for internal integrations',
    'Hello world',
  ];
  for (const s of samples) {
    console.log(s, '=>', detectMode(s));
  }
}
