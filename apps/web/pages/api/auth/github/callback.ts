/**
 * GitHub OAuth Callback Endpoint
 * GET /api/auth/github/callback
 * Handles GitHub OAuth callback and creates session
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  exchangeGitHubCode,
  getGitHubUser,
  getGitHubUserEmails,
  syncGitHubProfile,
  createSessionCookie,
} from '@leo-client/lib/github-oauth';
import { supabase } from '@leo-client/lib/supabase-client';

// Local constants
const SESSION_COOKIE = 'lionpack_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { code, state } = req.query;

    // Validate code and state parameters
    if (!code || !state) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both code and state are required',
      });
    }

    // Verify CSRF token (state)
    const cookies = parseCookies(req.headers.cookie || '');
    const storedState = cookies.github_oauth_state;

    if (!storedState || storedState !== state) {
      return res.status(403).json({
        error: 'Invalid state parameter',
        message: 'CSRF token mismatch',
      });
    }

    // Exchange code for access token
    const accessToken = await exchangeGitHubCode(code as string);

    // Get GitHub user data
    const githubUser = await getGitHubUser(accessToken);

    // Get user's email (GitHub profile email might be private)
    const emails = await getGitHubUserEmails(accessToken);
    const primaryEmail =
      emails.find((e: any) => e.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return res.status(400).json({
        error: 'Failed to get primary email from GitHub',
        message: 'Unable to retrieve email address from GitHub account',
      });
    }

    // Create or get Supabase user account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: primaryEmail,
      password: `github_${githubUser.id}`, // Dummy password for OAuth users
    });

    let userId: string;

    if (error && error.message.includes('Invalid login credentials')) {
      // User doesn't exist, create new user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: primaryEmail,
          password: `github_${githubUser.id}`,
          options: {
            data: {
              github_id: githubUser.id,
              github_username: githubUser.login,
            },
          },
        });

      if (signUpError) {
        throw new Error(`Failed to create user: ${signUpError.message}`);
      }

      userId = signUpData.user?.id || '';
    } else if (error) {
      throw new Error(`Auth error: ${error.message}`);
    } else {
      userId = data.user?.id || '';
    }

    // Sync GitHub profile with LionPack profile
    await syncGitHubProfile(userId, githubUser, primaryEmail);

    // Create session
    const sessionData = {
      userId,
      email: primaryEmail,
      fullName: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      gitHubUsername: githubUser.login,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    };

    const sessionCookie = createSessionCookie(sessionData);

    // Set session cookie
    const cookieExpiry = new Date();
    cookieExpiry.setSeconds(
      cookieExpiry.getSeconds() + SESSION_MAX_AGE
    );

    res.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${cookieExpiry.toUTCString()}`
    );

    // Clear the OAuth state cookie
    res.setHeader('Set-Cookie', [
      `${SESSION_COOKIE}=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${cookieExpiry.toUTCString()}`,
      'github_oauth_state=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 UTC',
    ]);

    // Redirect to dashboard
    res.redirect(302, '/dashboard');
  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error);

    // Redirect to login with error
    const errorMessage = encodeURIComponent(
      error.message || 'Authentication failed'
    );
    res.redirect(302, `/auth/login?error=${errorMessage}`);
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

/**
 * Type definitions
 */
interface SessionData {
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  gitHubUsername?: string;
  createdAt: number;
  expiresAt: number;
}
