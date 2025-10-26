/**
 * Advanced Git Operations Tests
 *
 * Comprehensive tests for Story 3.14 GitHubService enhancements:
 * - Multi-commit operations
 * - Conflict detection and resolution
 * - Cherry-pick functionality
 * - Enhanced PR reviews
 * - Diff operations
 *
 * Target: 95%+ coverage
 */

import type { CommitGroup, Resolution, ReviewComment, Review } from '../github-service';

// Mock Octokit before importing GitHubService
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    git: {
      getRef: jest.fn(),
      getCommit: jest.fn(),
      createBlob: jest.fn(),
      createTree: jest.fn(),
      createCommit: jest.fn(),
      updateRef: jest.fn(),
    },
    repos: {
      getContent: jest.fn(),
      compareCommitsWithBasehead: jest.fn(),
      getCommit: jest.fn(),
      listCommits: jest.fn(),
    },
    pulls: {
      get: jest.fn(),
      createReviewComment: jest.fn(),
      createReview: jest.fn(),
    },
  })),
}));

import { GitHubService } from '../github-service';

describe('GitHubService - Advanced Git Operations (Story 3.14)', () => {
  let githubService: GitHubService;
  let mockOctokit: any;

  beforeEach(() => {
    // Create mock Octokit instance
    mockOctokit = {
      git: {
        getRef: jest.fn(),
        getCommit: jest.fn(),
        createBlob: jest.fn(),
        createTree: jest.fn(),
        createCommit: jest.fn(),
        updateRef: jest.fn(),
      },
      repos: {
        getContent: jest.fn(),
        compareCommitsWithBasehead: jest.fn(),
        getCommit: jest.fn(),
        listCommits: jest.fn(),
      },
      pulls: {
        get: jest.fn(),
        createReviewComment: jest.fn(),
        createReview: jest.fn(),
      },
    };

    githubService = new GitHubService({
      owner: 'test-owner',
      repo: 'test-repo',
      token: 'test-token',
      defaultBranch: 'main',
    });

    // Replace octokit instance
    (githubService as any).octokit = mockOctokit;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // MULTI-COMMIT OPERATIONS
  // ==========================================================================

  describe('createCommitGroup', () => {
    it('should create multiple commits sequentially', async () => {
      const commitGroups: CommitGroup[] = [
        {
          type: 'feat',
          message: 'Add user authentication',
          files: [
            { path: 'auth.ts', content: 'export const auth = () => {}' },
          ],
        },
        {
          type: 'test',
          message: 'Add auth tests',
          files: [
            { path: 'auth.test.ts', content: 'test("auth", () => {})' },
          ],
        },
      ];

      // Mock branch ref
      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'base-sha' } },
      });

      // Mock commit retrieval
      mockOctokit.git.getCommit.mockResolvedValue({
        data: { tree: { sha: 'tree-sha' } },
      });

      // Mock blob creation
      mockOctokit.git.createBlob.mockResolvedValue({
        data: { sha: 'blob-sha' },
      });

      // Mock tree creation
      mockOctokit.git.createTree.mockResolvedValue({
        data: { sha: 'new-tree-sha' },
      });

      // Mock commit creation
      mockOctokit.git.createCommit
        .mockResolvedValueOnce({
          data: {
            sha: 'commit-1-sha',
            message: 'feat: Add user authentication',
            author: { name: 'Test', email: 'test@example.com', date: '2025-01-01' },
            html_url: 'https://github.com/test/commit-1',
          },
        })
        .mockResolvedValueOnce({
          data: {
            sha: 'commit-2-sha',
            message: 'test: Add auth tests',
            author: { name: 'Test', email: 'test@example.com', date: '2025-01-01' },
            html_url: 'https://github.com/test/commit-2',
          },
        });

      // Mock ref update
      mockOctokit.git.updateRef.mockResolvedValue({});

      const result = await githubService.createCommitGroup('feature-branch', commitGroups);

      expect(result.success).toBe(true);
      expect(result.data?.commits).toHaveLength(2);
      expect(result.data?.finalSha).toBe('commit-2-sha');
      expect(mockOctokit.git.createCommit).toHaveBeenCalledTimes(2);
      expect(mockOctokit.git.updateRef).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        ref: 'heads/feature-branch',
        sha: 'commit-2-sha',
        force: false,
      });
    });

    it('should handle empty commit groups', async () => {
      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'base-sha' } },
      });
      mockOctokit.git.updateRef.mockResolvedValue({});

      const result = await githubService.createCommitGroup('branch', []);

      expect(result.success).toBe(true);
      expect(result.data?.commits).toEqual([]);
      expect(result.data?.finalSha).toBe('base-sha');
    });

    it('should handle errors during commit creation', async () => {
      mockOctokit.git.getRef.mockRejectedValue(new Error('Branch not found'));

      const result = await githubService.createCommitGroup('invalid-branch', [
        {
          type: 'feat',
          message: 'Test',
          files: [{ path: 'test.ts', content: 'test' }],
        },
      ]);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Branch not found');
    });
  });

  // ==========================================================================
  // CONFLICT DETECTION
  // ==========================================================================

  describe('detectConflicts', () => {
    it('should detect conflicts between branches', async () => {
      // Mock comparison
      mockOctokit.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'conflicted.ts',
              status: 'modified',
              patch: '@@ -1,3 +1,3 @@',
            },
          ],
        },
      });

      // Mock file content for base
      mockOctokit.repos.getContent
        .mockResolvedValueOnce({
          data: {
            type: 'file',
            content: Buffer.from('const value = "base";').toString('base64'),
            sha: 'base-sha',
          },
        })
        // Mock file content for head
        .mockResolvedValueOnce({
          data: {
            type: 'file',
            content: Buffer.from('const value = "head";').toString('base64'),
            sha: 'head-sha',
          },
        });

      const result = await githubService.detectConflicts('main', 'feature');

      expect(result.success).toBe(true);
      expect(result.data?.hasConflicts).toBe(true);
      expect(result.data?.conflicts).toBeDefined();
    });

    it('should return no conflicts when branches are identical', async () => {
      mockOctokit.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: { files: [] },
      });

      const result = await githubService.detectConflicts('main', 'feature');

      expect(result.success).toBe(true);
      expect(result.data?.hasConflicts).toBe(false);
      expect(result.data?.conflicts).toHaveLength(0);
    });

    it('should handle comparison errors', async () => {
      mockOctokit.repos.compareCommitsWithBasehead.mockRejectedValue(
        new Error('Invalid branch')
      );

      const result = await githubService.detectConflicts('main', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid branch');
    });
  });

  // ==========================================================================
  // CONFLICT RESOLUTION
  // ==========================================================================

  describe('resolveConflicts', () => {
    it('should resolve conflicts with provided resolutions', async () => {
      const resolutions: Resolution[] = [
        {
          file: 'conflicted.ts',
          resolvedContent: 'const value = "resolved";',
          strategy: 'manual',
        },
      ];

      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'current-sha' } },
      });

      mockOctokit.git.getCommit.mockResolvedValue({
        data: { tree: { sha: 'tree-sha' } },
      });

      mockOctokit.git.createBlob.mockResolvedValue({
        data: { sha: 'blob-sha' },
      });

      mockOctokit.git.createTree.mockResolvedValue({
        data: { sha: 'new-tree-sha' },
      });

      mockOctokit.git.createCommit.mockResolvedValue({
        data: {
          sha: 'resolved-sha',
          message: 'chore: resolve conflicts in 1 file(s)',
          html_url: 'https://github.com/test/commit',
        },
      });

      mockOctokit.git.updateRef.mockResolvedValue({});

      const result = await githubService.resolveConflicts('feature', resolutions);

      expect(result.success).toBe(true);
      expect(result.data?.filesResolved).toBe(1);
      expect(mockOctokit.git.createBlob).toHaveBeenCalled();
      expect(mockOctokit.git.createCommit).toHaveBeenCalled();
    });

    it('should handle multiple file resolutions', async () => {
      const resolutions: Resolution[] = [
        {
          file: 'file1.ts',
          resolvedContent: 'resolved1',
          strategy: 'ours',
        },
        {
          file: 'file2.ts',
          resolvedContent: 'resolved2',
          strategy: 'theirs',
        },
      ];

      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'sha' } },
      });
      mockOctokit.git.getCommit.mockResolvedValue({
        data: { tree: { sha: 'tree' } },
      });
      mockOctokit.git.createBlob.mockResolvedValue({
        data: { sha: 'blob' },
      });
      mockOctokit.git.createTree.mockResolvedValue({
        data: { sha: 'tree' },
      });
      mockOctokit.git.createCommit.mockResolvedValue({
        data: { sha: 'commit', message: 'resolve', html_url: 'url' },
      });
      mockOctokit.git.updateRef.mockResolvedValue({});

      const result = await githubService.resolveConflicts('branch', resolutions);

      expect(result.success).toBe(true);
      expect(result.data?.filesResolved).toBe(2);
    });
  });

  // ==========================================================================
  // CHERRY-PICK
  // ==========================================================================

  describe('cherryPick', () => {
    it('should cherry-pick commits to target branch', async () => {
      const commits = ['commit-1-sha', 'commit-2-sha'];

      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'target-sha' } },
      });

      mockOctokit.git.getCommit
        .mockResolvedValueOnce({
          data: {
            message: 'feat: First commit',
            tree: { sha: 'tree-1' },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: 'fix: Second commit',
            tree: { sha: 'tree-2' },
          },
        });

      mockOctokit.git.createCommit
        .mockResolvedValueOnce({
          data: {
            sha: 'cherry-1-sha',
            message: 'feat: First commit\n\n(cherry picked from commit commit-1-sha)',
            author: { name: 'Test', email: 'test@test.com', date: '2025-01-01' },
            html_url: 'url1',
          },
        })
        .mockResolvedValueOnce({
          data: {
            sha: 'cherry-2-sha',
            message: 'fix: Second commit\n\n(cherry picked from commit commit-2-sha)',
            author: { name: 'Test', email: 'test@test.com', date: '2025-01-01' },
            html_url: 'url2',
          },
        });

      mockOctokit.git.updateRef.mockResolvedValue({});

      const result = await githubService.cherryPick(commits, 'target-branch', false);

      expect(result.success).toBe(true);
      expect(result.data?.commits).toHaveLength(2);
      expect(result.data?.finalSha).toBe('cherry-2-sha');
      expect(mockOctokit.git.createCommit).toHaveBeenCalledTimes(2);
    });

    it('should create PR when requested', async () => {
      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'sha' } },
      });
      mockOctokit.git.getCommit.mockResolvedValue({
        data: { message: 'msg', tree: { sha: 'tree' } },
      });
      mockOctokit.git.createCommit.mockResolvedValue({
        data: {
          sha: 'sha',
          message: 'msg',
          author: { name: 'Test', email: 'test@test.com', date: '2025-01-01' },
          html_url: 'url',
        },
      });
      mockOctokit.git.updateRef.mockResolvedValue({});

      // Mock PR creation
      mockOctokit.pulls = {
        create: jest.fn().mockResolvedValue({
          data: { number: 42, html_url: 'pr-url' },
        }),
      };
      (githubService as any).createPR = jest.fn().mockResolvedValue({
        success: true,
        data: { number: 42 },
      });

      const result = await githubService.cherryPick(['sha'], 'target', true);

      expect(result.success).toBe(true);
      expect(result.data?.pr).toBeDefined();
    });
  });

  // ==========================================================================
  // PR REVIEWS
  // ==========================================================================

  describe('addReviewComment', () => {
    it('should add inline review comment', async () => {
      const comment: ReviewComment = {
        path: 'src/file.ts',
        line: 42,
        body: 'Please fix this',
      };

      mockOctokit.pulls.get.mockResolvedValue({
        data: { head: { sha: 'head-sha' } },
      });

      mockOctokit.pulls.createReviewComment.mockResolvedValue({
        data: {
          id: 123,
          path: 'src/file.ts',
          line: 42,
          body: 'Please fix this',
          html_url: 'comment-url',
        },
      });

      const result = await githubService.addReviewComment(1, comment);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(123);
      expect(mockOctokit.pulls.createReviewComment).toHaveBeenCalledWith(
        expect.objectContaining({
          pull_number: 1,
          path: 'src/file.ts',
          line: 42,
          body: 'Please fix this',
        })
      );
    });
  });

  describe('submitReview', () => {
    it('should submit PR review with APPROVE event', async () => {
      const review: Review = {
        event: 'APPROVE',
        body: 'Looks good!',
      };

      mockOctokit.pulls.createReview.mockResolvedValue({
        data: {
          id: 456,
          state: 'APPROVED',
          body: 'Looks good!',
          html_url: 'review-url',
          submitted_at: '2025-01-01T00:00:00Z',
        },
      });

      const result = await githubService.submitReview(1, review);

      expect(result.success).toBe(true);
      expect(result.data?.state).toBe('APPROVED');
      expect(mockOctokit.pulls.createReview).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 1,
        event: 'APPROVE',
        body: 'Looks good!',
      });
    });

    it('should submit review with inline comments', async () => {
      const review: Review = {
        event: 'REQUEST_CHANGES',
        body: 'Please address these issues',
        comments: [
          {
            path: 'file.ts',
            line: 10,
            body: 'Fix this',
          },
        ],
      };

      mockOctokit.pulls.get.mockResolvedValue({
        data: { head: { sha: 'sha' } },
      });

      mockOctokit.pulls.createReviewComment.mockResolvedValue({
        data: { id: 1 },
      });

      mockOctokit.pulls.createReview.mockResolvedValue({
        data: {
          id: 789,
          state: 'CHANGES_REQUESTED',
          body: 'Please address these issues',
          html_url: 'url',
          submitted_at: '2025-01-01',
        },
      });

      const result = await githubService.submitReview(1, review);

      expect(result.success).toBe(true);
      expect(mockOctokit.pulls.createReviewComment).toHaveBeenCalled();
      expect(mockOctokit.pulls.createReview).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // DIFF OPERATIONS
  // ==========================================================================

  describe('getDiff', () => {
    it('should get diff between two branches', async () => {
      mockOctokit.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'file1.ts',
              status: 'modified',
              additions: 10,
              deletions: 5,
              changes: 15,
              patch: '@@ -1,3 +1,3 @@',
            },
            {
              filename: 'file2.ts',
              status: 'added',
              additions: 20,
              deletions: 0,
              changes: 20,
              patch: '@@ -0,0 +1,20 @@',
            },
          ],
          html_url: 'compare-url',
        },
      });

      const result = await githubService.getDiff('main', 'feature');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(2);
      expect(result.data?.totalAdditions).toBe(30);
      expect(result.data?.totalDeletions).toBe(5);
      expect(result.data?.compareUrl).toBe('compare-url');
    });

    it('should filter diff by specific files', async () => {
      mockOctokit.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'file1.ts',
              status: 'modified',
              additions: 10,
              deletions: 5,
              changes: 15,
            },
            {
              filename: 'file2.ts',
              status: 'modified',
              additions: 5,
              deletions: 3,
              changes: 8,
            },
          ],
        },
      });

      const result = await githubService.getDiff('main', 'feature', ['file1.ts']);

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(1);
      expect(result.data?.files[0].filename).toBe('file1.ts');
    });
  });

  describe('getCommitDiff', () => {
    it('should get diff for specific commit', async () => {
      mockOctokit.repos.getCommit.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'changed.ts',
              status: 'modified',
              additions: 15,
              deletions: 8,
              changes: 23,
              patch: '@@ -1,10 +1,15 @@',
            },
          ],
          stats: {
            additions: 15,
            deletions: 8,
            total: 23,
          },
          html_url: 'commit-url',
        },
      });

      const result = await githubService.getCommitDiff('abc123');

      expect(result.success).toBe(true);
      expect(result.data?.files).toHaveLength(1);
      expect(result.data?.totalAdditions).toBe(15);
      expect(result.data?.totalDeletions).toBe(8);
      expect(result.data?.compareUrl).toBe('commit-url');
    });
  });

  // ==========================================================================
  // COMMIT HISTORY (Enhanced)
  // ==========================================================================

  describe('getCommitHistory', () => {
    it('should get commit history with pagination', async () => {
      mockOctokit.repos.listCommits.mockResolvedValue({
        data: [
          {
            sha: 'commit-1',
            commit: {
              message: 'feat: Add feature',
              author: {
                name: 'Dev',
                email: 'dev@test.com',
                date: '2025-01-01',
              },
            },
            html_url: 'url1',
          },
          {
            sha: 'commit-2',
            commit: {
              message: 'fix: Fix bug',
              author: {
                name: 'Dev',
                email: 'dev@test.com',
                date: '2025-01-02',
              },
            },
            html_url: 'url2',
          },
        ],
      });

      const result = await githubService.getCommitHistory('main', 1, 30);

      expect(result.success).toBe(true);
      expect(result.data?.commits).toHaveLength(2);
      expect(result.data?.page).toBe(1);
      expect(result.data?.perPage).toBe(30);
    });

    it('should filter by author', async () => {
      mockOctokit.repos.listCommits.mockResolvedValue({
        data: [],
      });

      await githubService.getCommitHistory('main', 1, 30, 'specific-author');

      expect(mockOctokit.repos.listCommits).toHaveBeenCalledWith(
        expect.objectContaining({
          author: 'specific-author',
        })
      );
    });

    it('should filter by date range', async () => {
      mockOctokit.repos.listCommits.mockResolvedValue({
        data: [],
      });

      await githubService.getCommitHistory(
        'main',
        1,
        30,
        undefined,
        '2025-01-01',
        '2025-01-31'
      );

      expect(mockOctokit.repos.listCommits).toHaveBeenCalledWith(
        expect.objectContaining({
          since: '2025-01-01',
          until: '2025-01-31',
        })
      );
    });
  });
});
