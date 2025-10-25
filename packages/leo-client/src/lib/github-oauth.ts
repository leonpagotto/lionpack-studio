/**
 * GitHub OAuth Configuration and Middleware
 * Integrates GitHub OAuth with Supabase Auth for LionPack Studio
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase-client';
import { profileService } from './database-service';
import { UserRole } from '../types/database';

// ============================================================================
// GITHUB OAUTH CONFIG
// ============================================================================

export const GitHubOAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`,
};

// Validate configuration
if (!GitHubOAuthConfig.clientId || !GitHubOAuthConfig.clientSecret) {
  console.warn(
    'GitHub OAuth not fully configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'
  );
}

// ============================================================================
// SESSION & COOKIES
// ============================================================================

const SESSION_COOKIE = 'lionpack_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

interface SessionData {
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  gitHubUsername?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Create secure session cookie
 */
export function createSessionCookie(sessionData: SessionData): string {
  // In production, encrypt this data
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

/**
 * Parse session cookie
 */
export function parseSessionCookie(cookieValue: string): SessionData | null {
  try {
    const data = JSON.parse(Buffer.from(cookieValue, 'base64').toString('utf-8'));

    // Check expiration
    if (data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// OAUTH FLOW HELPERS
// ============================================================================

/**
 * Get GitHub user info from access token
 */
export async function getGitHubUser(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Failed to get GitHub user: ${error.message}`);
  }
}

/**
 * Get GitHub user emails
 */
export async function getGitHubUserEmails(accessToken: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Failed to get GitHub user emails: ${error.message}`);
  }
}

/**
 * Exchange GitHub code for access token
 */
export async function exchangeGitHubCode(code: string): Promise<string> {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GitHubOAuthConfig.clientId,
        client_secret: GitHubOAuthConfig.clientSecret,
        code,
        redirect_uri: GitHubOAuthConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`);
    }

    return data.access_token;
  } catch (error: any) {
    throw new Error(`Failed to exchange GitHub code: ${error.message}`);
  }
}

// ============================================================================
// USER PROFILE SYNC
// ============================================================================

/**
 * Sync GitHub user data with LionPack profile
 */
export async function syncGitHubProfile(
  userId: string,
  githubUser: any,
  email: string
): Promise<void> {
  try {
    // Get or create profile
    const existingProfile = await profileService.getById(userId);

    if (existingProfile) {
      // Update existing profile with GitHub data
      await profileService.update(userId, {
        full_name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio,
        organization: githubUser.company,
        settings: {
          ...(existingProfile.settings || {}),
          github_username: githubUser.login,
          github_id: githubUser.id,
          github_profile_url: githubUser.html_url,
        },
      });
    } else {
      // Create new profile
      await profileService.create({
        id: userId,
        email,
        full_name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio,
        organization: githubUser.company,
        role: UserRole.Member,
        is_active: true,
        settings: {
          github_username: githubUser.login,
          github_id: githubUser.id,
          github_profile_url: githubUser.html_url,
        },
      });
    }
  } catch (error: any) {
    console.error('Failed to sync GitHub profile:', error);
    throw error;
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware to verify authentication and attach user to request
 */
export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next?: () => void
): Promise<void> {
  try {
    // Check for session cookie
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionCookie = cookies[SESSION_COOKIE];

    let user = null;

    if (sessionCookie) {
      const session = parseSessionCookie(sessionCookie);
      if (session) {
        user = session;
      }
    }

    // Also check for Supabase auth token
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        user = {
          userId: session.user.id,
          email: session.user.email,
        };
      }
    }

    // Attach user to request
    (req as any).user = user;
    (req as any).authenticated = !!user;

    if (next) next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    (req as any).authenticated = false;
    if (next) next();
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next?: () => void
): boolean {
  if (!(req as any).authenticated) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  if (next) next();
  return true;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
 * Generate random state for OAuth flow
 */
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get GitHub login URL
 */
export function getGitHubLoginUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GitHubOAuthConfig.clientId,
    redirect_uri: GitHubOAuthConfig.redirectUri,
    scope: 'user:email',
    state,
    allow_signup: 'true',
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export default {
  GitHubOAuthConfig,
  createSessionCookie,
  parseSessionCookie,
  getGitHubUser,
  getGitHubUserEmails,
  exchangeGitHubCode,
  syncGitHubProfile,
  authMiddleware,
  requireAuth,
  generateState,
  getGitHubLoginUrl,
};
