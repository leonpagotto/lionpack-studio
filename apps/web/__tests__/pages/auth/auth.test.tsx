/**
 * Authentication UI Tests
 * Comprehensive test suite for login and OAuth callback
 *
 * Coverage:
 * - Login page rendering
 * - GitHub OAuth initialization
 * - Error handling
 * - Callback page handling
 * - Session state management
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import LoginPage from '../../../pages/auth/login';
import GitHubCallbackPage from '../../../pages/auth/callback';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as any;

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('renders login page with correct title', () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://github.com/login/oauth/authorize?client_id=test',
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);
    expect(screen.getByText('LionPack Studio')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  test('initializes GitHub OAuth on mount', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://github.com/login/oauth/authorize?client_id=test',
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/github/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  test('stores OAuth state in sessionStorage', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://github.com/login/oauth/authorize?client_id=test',
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(sessionStorage.getItem('github_oauth_state')).toBe('test_state_123');
    });
  });

  test('renders GitHub login button', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://github.com/login/oauth/authorize?client_id=test',
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sign in with GitHub/i)).toBeInTheDocument();
    });
  });

  test('handles GitHub login button click', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    const authUrl = 'https://github.com/login/oauth/authorize?client_id=test';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl,
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);

    const button = await waitFor(() => screen.getByText(/Sign in with GitHub/i));
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.location.href).toBe(authUrl);
    });
  });

  test('handles OAuth initialization error', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to initialize login/i)).toBeInTheDocument();
    });
  });

  test('disables button when not ready', () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /Sign in with GitHub/i });

    expect(button).toBeDisabled();
  });

  test('renders privacy and terms links', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      pathname: '/auth/login',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://github.com/login/oauth/authorize?client_id=test',
        state: 'test_state_123',
      }),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });
  });
});

describe('GitHub Callback Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('renders loading state on mount', () => {
    const mockRouter = {
      isReady: false,
      push: jest.fn(),
      query: {},
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<GitHubCallbackPage />);
    expect(screen.getByText(/Completing sign in/i)).toBeInTheDocument();
  });

  test('handles successful OAuth callback', async () => {
    sessionStorage.setItem('github_oauth_state', 'test_state_123');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'test_state_123',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '123', name: 'Test User' } }),
    });

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/github/callback',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            code: 'oauth_code_123',
            state: 'test_state_123',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Sign in successful/i)).toBeInTheDocument();
    });
  });

  test('redirects to dashboard on successful auth', async () => {
    sessionStorage.setItem('github_oauth_state', 'test_state_123');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'test_state_123',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '123' } }),
    });

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  test('handles OAuth error from GitHub', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        error: 'access_denied',
        error_description: 'User denied OAuth access',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/User denied OAuth access/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    }, { timeout: 4000 });
  });

  test('handles missing OAuth code', async () => {
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: { state: 'test_state' },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid authentication response/i)).toBeInTheDocument();
    });
  });

  test('validates state parameter (CSRF protection)', async () => {
    sessionStorage.setItem('github_oauth_state', 'stored_state');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'different_state', // Mismatched state
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/State mismatch/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    }, { timeout: 4000 });
  });

  test('handles callback API error', async () => {
    sessionStorage.setItem('github_oauth_state', 'test_state_123');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'test_state_123',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    });

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Internal server error/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    }, { timeout: 4000 });
  });

  test('clears state from sessionStorage on success', async () => {
    sessionStorage.setItem('github_oauth_state', 'test_state_123');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'test_state_123',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '123' } }),
    });

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(sessionStorage.getItem('github_oauth_state')).toBeNull();
    });
  });

  test('handles network error during callback', async () => {
    sessionStorage.setItem('github_oauth_state', 'test_state_123');
    const mockRouter = {
      isReady: true,
      push: jest.fn(),
      query: {
        code: 'oauth_code_123',
        state: 'test_state_123',
      },
      pathname: '/auth/callback',
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
