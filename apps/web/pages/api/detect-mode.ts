import type { NextApiRequest, NextApiResponse } from 'next';
import { detectMode } from '../../../../packages/leo-client/src/mode-router';

// NOTE: MVP heuristic endpoint for Demo 1
// Method: POST (preferred) or GET (query param `q`)
// Response: { intent, confidence, reasoning, matchedKeywords, tokens, timestamp, version }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const input = (req.method === 'POST' ? req.body?.input : req.query.q) as string | undefined;
    if (!input || input.trim().length === 0) {
      return res.status(400).json({ error: 'Missing input text' });
    }
    const result = detectMode(String(input));
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('detect-mode error', err);
    return res.status(500).json({ error: 'Internal error', message: err?.message });
  }
}
