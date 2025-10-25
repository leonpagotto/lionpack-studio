/**
 * Authentication Login Page
 * Handles GitHub OAuth login flow and user authentication
 *
 * Features:
 * - GitHub OAuth integration
 * - Error handling and user feedback
 * - Loading states and redirects
 * - Responsive design for all devices
 * - Accessibility compliant (WCAG 2.1 AA)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './auth.module.css';

interface AuthState {
  loading: boolean;
  error: string | null;
  redirecting: boolean;
}

interface GitHubAuthResponse {
  authUrl: string;
  state: string;
}

/**
 * Login Page Component
 * Displays login interface with GitHub OAuth option
 */
export default function LoginPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    loading: false,
    error: null,
    redirecting: false,
  });
  const [gitHubAuthUrl, setGitHubAuthUrl] = useState<string | null>(null);

  /**
   * Initialize GitHub OAuth URL on component mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch('/api/auth/github/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to initialize authentication');
        }

        const data: GitHubAuthResponse = await response.json();
        setGitHubAuthUrl(data.authUrl);

        // Store state in sessionStorage for verification
        sessionStorage.setItem('github_oauth_state', data.state);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to initialize login. Please try again.',
        }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle GitHub login button click
   */
  const handleGitHubLogin = async () => {
    if (!gitHubAuthUrl) {
      setAuthState(prev => ({
        ...prev,
        error: 'Authentication service is not ready. Please refresh the page.',
      }));
      return;
    }

    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Redirect to GitHub OAuth
      window.location.href = gitHubAuthUrl;

      // Set redirecting state
      setAuthState(prev => ({
        ...prev,
        redirecting: true,
      }));
    } catch (err) {
      console.error('Login error:', err);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Login failed. Please try again.',
      }));
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - LionPack Studio</title>
        <meta name="description" content="Sign in to LionPack Studio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>LionPack Studio</h1>
            <p className={styles.authSubtitle}>
              Collaborative workflow automation platform
            </p>
          </div>

          {/* Main Content */}
          <div className={styles.authContent}>
            <h2 className={styles.sectionTitle}>Sign in to your account</h2>

            {/* Error Message */}
            {authState.error && (
              <div className={styles.errorAlert} role="alert">
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorMessage}>
                  <p className={styles.errorTitle}>Error</p>
                  <p className={styles.errorText}>{authState.error}</p>
                </div>
              </div>
            )}

            {/* GitHub Login Button */}
            <button
              className={styles.githubButton}
              onClick={handleGitHubLogin}
              disabled={authState.loading || !gitHubAuthUrl || authState.redirecting}
              aria-label="Sign in with GitHub"
            >
              {authState.loading || authState.redirecting ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  <span>
                    {authState.redirecting ? 'Redirecting...' : 'Signing in...'}
                  </span>
                </>
              ) : (
                <>
                  <GithubIcon />
                  <span>Sign in with GitHub</span>
                </>
              )}
            </button>

            {/* Loading Message */}
            {authState.redirecting && (
              <p className={styles.loadingMessage}>
                You are being redirected to GitHub to complete sign in...
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              LionPack Studio uses GitHub for secure authentication.
            </p>
            <p className={styles.footerLinks}>
              <a href="/privacy" className={styles.link}>Privacy Policy</a>
              {' • '}
              <a href="/terms" className={styles.link}>Terms of Service</a>
            </p>
          </div>
        </div>

        {/* Background */}
        <div className={styles.authBackground} aria-hidden="true"></div>
      </div>
    </>
  );
}

/**
 * GitHub Icon Component
 */
function GithubIcon() {
  return (
    <svg
      className={styles.icon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
