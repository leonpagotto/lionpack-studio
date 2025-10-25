/**
 * GitHub OAuth Login Endpoint
 * POST /api/auth/github/login
 * Initiates GitHub OAuth flow
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getGitHubLoginUrl, generateState } from '@leo-client/lib/github-oauth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Generate random state for CSRF protection
    const state = generateState();

    // Store state in cookie for verification later
    const stateExpiry = new Date();
    stateExpiry.setMinutes(stateExpiry.getMinutes() + 10);

    res.setHeader('Set-Cookie', `github_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${stateExpiry.toUTCString()}`);

    // Get GitHub OAuth authorization URL
    const authUrl = getGitHubLoginUrl(state);

    res.status(200).json({
      authUrl,
      state,
    });
  } catch (error: any) {
    console.error('GitHub login error:', error);
    res.status(500).json({
      error: 'Failed to initiate GitHub login',
      message: error.message,
    });
  }
}
