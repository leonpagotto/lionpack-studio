/**
 * Logout Endpoint
 * POST /api/auth/logout
 * Clears session and logs out user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@leo-client/lib/supabase-client';

const SESSION_COOKIE = 'lionpack_session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear session cookie
    res.setHeader('Set-Cookie', [
      `${SESSION_COOKIE}=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 UTC`,
    ]);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Failed to logout',
      message: error.message,
    });
  }
}
