/**
 * GitHub OAuth Callback Page
 * Handles GitHub OAuth redirect and session creation
 *
 * Features:
 * - OAuth code exchange
 * - User profile sync
 * - Session initialization
 * - Error handling and recovery
 * - Redirect to dashboard on success
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './auth.module.css';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
  error?: string;
}

/**
 * OAuth Callback Page
 * Processes GitHub OAuth callback and creates session
 */
export default function GitHubCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Completing sign in...',
  });

  useEffect(() => {
    const handleCallback = async () => {
      const { code, state: oauthState, error, error_description } = router.query;

      // Handle OAuth errors from GitHub
      if (error) {
        const errorDesc = Array.isArray(error_description)
          ? error_description[0]
          : error_description;
        const errorMessage = errorDesc || 'Authentication failed';
        console.error('GitHub OAuth error:', error, errorMessage);

        setState({
          status: 'error',
          message: 'Sign in failed',
          error: errorMessage,
        });

        // Redirect to login after delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      // Validate code and state
      if (!code || !oauthState) {
        console.error('Missing OAuth parameters');

        setState({
          status: 'error',
          message: 'Sign in failed',
          error: 'Invalid authentication response. Please try again.',
        });

        // Redirect to login after delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      try {
        // Verify state from session storage
        const storedState = sessionStorage.getItem('github_oauth_state');
        if (storedState !== oauthState) {
          throw new Error('State mismatch - possible CSRF attack');
        }

        // Update status
        setState({
          status: 'loading',
          message: 'Creating your session...',
        });

        // Exchange code for session
        const response = await fetch('/api/auth/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: String(code),
            state: String(oauthState),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Authentication failed with status ${response.status}`
          );
        }

        const data = await response.json();

        // Clear state from session storage
        sessionStorage.removeItem('github_oauth_state');

        // Update status
        setState({
          status: 'success',
          message: 'Sign in successful! Redirecting...',
        });

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } catch (err) {
        console.error('Callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';

        setState({
          status: 'error',
          message: 'Sign in failed',
          error: errorMessage,
        });

        // Redirect to login after delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    // Only run if router is ready
    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, router]);

  return (
    <>
      <Head>
        <title>Completing Sign In - LionPack Studio</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Loading State */}
          {state.status === 'loading' && (
            <div className={styles.callbackContent}>
              <div className={styles.callbackSpinner}></div>
              <h1 className={styles.callbackTitle}>{state.message}</h1>
              <p className={styles.callbackSubtitle}>
                Please wait while we authenticate you...
              </p>
            </div>
          )}

          {/* Success State */}
          {state.status === 'success' && (
            <div className={styles.callbackContent}>
              <div className={styles.successIcon}>✓</div>
              <h1 className={styles.callbackTitle}>{state.message}</h1>
              <p className={styles.callbackSubtitle}>
                You will be redirected shortly.
              </p>
            </div>
          )}

          {/* Error State */}
          {state.status === 'error' && (
            <div className={styles.callbackContent}>
              <div className={styles.errorIconLarge}>✕</div>
              <h1 className={styles.callbackTitle}>{state.message}</h1>
              <p className={styles.callbackSubtitle}>{state.error}</p>
              <p className={styles.callbackRedirect}>
                Redirecting to login in 3 seconds...
              </p>
            </div>
          )}
        </div>

        <div className={styles.authBackground} aria-hidden="true"></div>
      </div>
    </>
  );
}
