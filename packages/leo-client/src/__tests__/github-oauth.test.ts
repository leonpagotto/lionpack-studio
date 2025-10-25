/**
 * GitHub OAuth Integration Tests
 * Tests for OAuth flow, session management, and profile sync
 */

import {
  generateState,
  getGitHubLoginUrl,
  parseSessionCookie,
  createSessionCookie,
  exchangeGitHubCode,
  getGitHubUser,
  getGitHubUserEmails,
  syncGitHubProfile,
} from '../github-oauth';
import { profileService } from '../database-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('GitHub OAuth - State Management', () => {
  test('should generate random state', () => {
    const state1 = generateState();
    const state2 = generateState();

    expect(state1).toHaveLength(36);
    expect(state2).toHaveLength(36);
    expect(state1).not.toBe(state2);
  });

  test('should generate unique states on each call', () => {
    const states = new Set([
      generateState(),
      generateState(),
      generateState(),
      generateState(),
      generateState(),
    ]);

    expect(states.size).toBe(5);
  });
});

describe('GitHub OAuth - URL Generation', () => {
  test('should generate valid GitHub login URL', () => {
    const state = generateState();
    const url = getGitHubLoginUrl(state);

    expect(url).toContain('https://github.com/login/oauth/authorize');
    expect(url).toContain(`state=${state}`);
    expect(url).toContain('client_id=');
    expect(url).toContain('scope=user%3Aemail');
  });

  test('should include redirect URI in URL', () => {
    const state = generateState();
    const url = getGitHubLoginUrl(state);

    expect(url).toContain('redirect_uri=');
  });

  test('should allow signup in OAuth flow', () => {
    const state = generateState();
    const url = getGitHubLoginUrl(state);

    expect(url).toContain('allow_signup=true');
  });
});

describe('GitHub OAuth - Session Management', () => {
  const mockSessionData = {
    userId: 'user-123',
    email: 'user@example.com',
    fullName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    gitHubUsername: 'johndoe',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  test('should create and parse session cookie', () => {
    const cookie = createSessionCookie(mockSessionData);
    const parsed = parseSessionCookie(cookie);

    expect(parsed).toEqual(mockSessionData);
  });

  test('should return null for expired session', () => {
    const expiredSession = {
      ...mockSessionData,
      expiresAt: Date.now() - 1000, // Expired 1 second ago
    };

    const cookie = createSessionCookie(expiredSession);
    const parsed = parseSessionCookie(cookie);

    expect(parsed).toBeNull();
  });

  test('should return null for invalid cookie', () => {
    const invalidCookie = 'invalid-base64-not-json';
    const parsed = parseSessionCookie(invalidCookie);

    expect(parsed).toBeNull();
  });

  test('should return null for malformed session data', () => {
    const malformedCookie = Buffer.from('not json data').toString('base64');
    const parsed = parseSessionCookie(malformedCookie);

    expect(parsed).toBeNull();
  });

  test('should preserve all session data', () => {
    const cookie = createSessionCookie(mockSessionData);
    const parsed = parseSessionCookie(cookie);

    expect(parsed).toHaveProperty('userId', 'user-123');
    expect(parsed).toHaveProperty('email', 'user@example.com');
    expect(parsed).toHaveProperty('fullName', 'John Doe');
    expect(parsed).toHaveProperty('avatarUrl');
    expect(parsed).toHaveProperty('gitHubUsername', 'johndoe');
    expect(parsed).toHaveProperty('createdAt');
    expect(parsed).toHaveProperty('expiresAt');
  });
});

describe('GitHub OAuth - Code Exchange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should exchange code for access token', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ access_token: 'gho_test_token_123' }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const token = await exchangeGitHubCode('test_code_123');

    expect(token).toBe('gho_test_token_123');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/oauth/access_token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
  });

  test('should throw error on failed code exchange', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ error: 'invalid_code', error_description: 'Code expired' }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(exchangeGitHubCode('expired_code')).rejects.toThrow('Code expired');
  });

  test('should throw error on HTTP error', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(exchangeGitHubCode('test_code')).rejects.toThrow('GitHub API error');
  });
});

describe('GitHub OAuth - User Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGitHubUser = {
    id: 123456,
    login: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    bio: 'Software developer',
    company: 'Tech Corp',
    html_url: 'https://github.com/johndoe',
  };

  test('should get GitHub user data', async () => {
    const mockResponse = {
      ok: true,
      json: async () => mockGitHubUser,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const user = await getGitHubUser('test_token');

    expect(user).toEqual(mockGitHubUser);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token',
        }),
      })
    );
  });

  test('should get GitHub user emails', async () => {
    const mockEmails = [
      { email: 'john@example.com', primary: true, verified: true },
      { email: 'john.doe@example.com', primary: false, verified: true },
    ];

    const mockResponse = {
      ok: true,
      json: async () => mockEmails,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const emails = await getGitHubUserEmails('test_token');

    expect(emails).toEqual(mockEmails);
    expect(emails[0].primary).toBe(true);
  });

  test('should throw error on failed API call', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(getGitHubUser('invalid_token')).rejects.toThrow('GitHub API error');
  });
});

describe('GitHub OAuth - Profile Sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGitHubUser = {
    id: 123456,
    login: 'johndoe',
    name: 'John Doe',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    bio: 'Software developer',
    company: 'Tech Corp',
    html_url: 'https://github.com/johndoe',
  };

  test('should create new profile for first-time GitHub login', async () => {
    const createSpy = jest.spyOn(profileService, 'create').mockResolvedValueOnce({
      id: 'user-123',
      email: 'john@example.com',
      full_name: 'John Doe',
      avatar_url: mockGitHubUser.avatar_url,
      role: 'member',
      is_active: true,
      settings: expect.any(Object),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: 'Software developer',
      organization: 'Tech Corp',
      last_login_at: null,
    });

    const getByIdSpy = jest.spyOn(profileService, 'getById').mockResolvedValueOnce(null);

    await syncGitHubProfile('user-123', mockGitHubUser, 'john@example.com');

    expect(getByIdSpy).toHaveBeenCalledWith('user-123');
    expect(createSpy).toHaveBeenCalled();

    createSpy.mockRestore();
    getByIdSpy.mockRestore();
  });

  test('should update existing profile with GitHub data', async () => {
    const existingProfile = {
      id: 'user-123',
      email: 'john@example.com',
      full_name: 'John D',
      avatar_url: null,
      role: 'member',
      is_active: true,
      settings: { theme: 'dark' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: null,
      organization: null,
      last_login_at: null,
    };

    const getByIdSpy = jest
      .spyOn(profileService, 'getById')
      .mockResolvedValueOnce(existingProfile);

    const updateSpy = jest.spyOn(profileService, 'update').mockResolvedValueOnce({
      ...existingProfile,
      full_name: 'John Doe',
      avatar_url: mockGitHubUser.avatar_url,
      bio: 'Software developer',
    });

    await syncGitHubProfile('user-123', mockGitHubUser, 'john@example.com');

    expect(getByIdSpy).toHaveBeenCalledWith('user-123');
    expect(updateSpy).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        full_name: 'John Doe',
        avatar_url: mockGitHubUser.avatar_url,
        bio: 'Software developer',
      })
    );

    getByIdSpy.mockRestore();
    updateSpy.mockRestore();
  });

  test('should include GitHub data in settings', async () => {
    const getByIdSpy = jest.spyOn(profileService, 'getById').mockResolvedValueOnce(null);

    const createSpy = jest.spyOn(profileService, 'create').mockResolvedValueOnce({
      id: 'user-123',
      email: 'john@example.com',
      full_name: 'John Doe',
      avatar_url: mockGitHubUser.avatar_url,
      role: 'member',
      is_active: true,
      settings: {
        github_username: 'johndoe',
        github_id: 123456,
        github_profile_url: 'https://github.com/johndoe',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: null,
      organization: null,
      last_login_at: null,
    });

    await syncGitHubProfile('user-123', mockGitHubUser, 'john@example.com');

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          github_username: 'johndoe',
          github_id: 123456,
          github_profile_url: mockGitHubUser.html_url,
        }),
      })
    );

    getByIdSpy.mockRestore();
    createSpy.mockRestore();
  });
});

describe('GitHub OAuth - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle GitHub user without name', async () => {
    const userWithoutName = {
      id: 123456,
      login: 'johndoe',
      name: null,
      avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    };

    const getByIdSpy = jest.spyOn(profileService, 'getById').mockResolvedValueOnce(null);

    const createSpy = jest.spyOn(profileService, 'create').mockResolvedValueOnce({
      id: 'user-123',
      email: 'john@example.com',
      full_name: 'johndoe', // Falls back to login
      avatar_url: userWithoutName.avatar_url,
      role: 'member',
      is_active: true,
      settings: expect.any(Object),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: null,
      organization: null,
      last_login_at: null,
    });

    await syncGitHubProfile('user-123', userWithoutName, 'john@example.com');

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'johndoe', // Uses login when name is null
      })
    );

    getByIdSpy.mockRestore();
    createSpy.mockRestore();
  });

  test('should handle GitHub API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      json: async () => ({ message: 'API rate limit exceeded' }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(getGitHubUser('test_token')).rejects.toThrow('GitHub API error');
  });
});
