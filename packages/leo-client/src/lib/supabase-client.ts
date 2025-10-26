/**
 * Supabase Client Configuration
 * Initializes the Supabase client with proper configuration for LionPack Studio
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.schema';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client for browser/authenticated operations
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Create admin client for server-side operations (if service role key available)
export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

/**
 * Get the appropriate Supabase client
 * - On server-side with auth token: use authenticated client
 * - On server-side without token: use admin client (if available)
 * - On browser: use public client
 */
export function getSupabaseClient(
  serverAuthToken?: string
): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    // Server-side
    if (serverAuthToken) {
      return supabase;
    }
    if (supabaseAdmin) {
      return supabaseAdmin;
    }
  }
  // Browser-side
  return supabase;
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}}/auth/callback`,
    },
  });
}

/**
 * Sign in with email/password
 */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email/password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { data?: Record<string, any> }
) {
  return supabase.auth.signUp({
    email,
    password,
    options,
  });
}

/**
 * Sign out current user
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: any, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

export default supabase;
