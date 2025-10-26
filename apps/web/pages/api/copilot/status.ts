/**
 * Copilot Status API
 *
 * Check if user is authenticated and has Copilot enabled
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface StatusResponse {
  authenticated: boolean;
  githubUser?: string;
  copilotEnabled: boolean;
  plan: 'individual' | 'business' | 'none';
  aiProvider: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user has session cookie
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionCookie = cookies.lionpack_session;

    if (!sessionCookie) {
      return res.status(200).json({
        authenticated: false,
        copilotEnabled: false,
        plan: 'none',
        aiProvider: 'gemini',
      });
    }

    // Parse session data (basic implementation)
    // In production, you'd verify the JWT/session token
    let sessionData: any;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
    } catch {
      return res.status(200).json({
        authenticated: false,
        copilotEnabled: false,
        plan: 'none',
        aiProvider: 'gemini',
      });
    }

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return res.status(200).json({
        authenticated: false,
        copilotEnabled: false,
        plan: 'none',
        aiProvider: 'gemini',
      });
    }

    // For now, we use Gemini for all authenticated users
    // In the future, we can check GitHub Copilot subscription
    return res.status(200).json({
      authenticated: true,
      githubUser: sessionData.gitHubUsername || sessionData.fullName || sessionData.email,
      copilotEnabled: true,
      plan: 'individual',
      aiProvider: 'gemini',
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check status',
    });
  }
}

/**
 * Parse cookies from header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      cookies[key] = decodeURIComponent(value);
    }
  });

  return cookies;
}
