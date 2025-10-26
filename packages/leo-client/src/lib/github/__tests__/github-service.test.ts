import { GitHubService } from '../github-service';
import type { GitHubServiceConfig, PRDetails, IssueDetails } from '../github-service';

// Mock Octokit
const mockPulls = {
  create: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
  merge: jest.fn(),
  update: jest.fn(),
  createReviewComment: jest.fn(),
  requestReviewers: jest.fn(),
  listFiles: jest.fn(),
  listReviews: jest.fn(),
};

const mockIssues = {
  create: jest.fn(),
  update: jest.fn(),
  createComment: jest.fn(),
  addLabels: jest.fn(),
  addAssignees: jest.fn(),
};

const mockGit = {
  getRef: jest.fn(),
  createRef: jest.fn(),
  deleteRef: jest.fn(),
};

const mockRepos = {
  listBranches: jest.fn(),
  compareCommits: jest.fn(),
  listCommits: jest.fn(),
};

const mockActions = {
  listWorkflowRunsForRepo: jest.fn(),
};

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      pulls: mockPulls,
      issues: mockIssues,
      git: mockGit,
      repos: mockRepos,
      actions: mockActions,
    })),
  };
});

describe('GitHubService', () => {
  let githubService: GitHubService;

  const defaultConfig: GitHubServiceConfig = {
    owner: 'test-owner',
    repo: 'test-repo',
    token: 'test-token',
    defaultBranch: 'main',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    githubService = new GitHubService(defaultConfig);
  });

  describe('Constructor', () => {
    it('should initialize with provided config', () => {
      expect(githubService).toBeDefined();
      expect((githubService as any).config).toEqual(defaultConfig);
    });

    it('should use "main" as default branch if not provided', () => {
      const service = new GitHubService({
        owner: 'test-owner',
        repo: 'test-repo',
        token: 'test-token',
      });
      expect((service as any).config.defaultBranch).toBe('main');
    });
  });

  describe('PR Management', () => {
    describe('createPR', () => {
      it('should create a PR with all details', async () => {
        const prDetails: PRDetails = {
          title: 'Test PR',
          body: 'Test description',
          base: 'main',
          head: 'feature-branch',
          draft: false,
          labels: ['enhancement'],
          assignees: ['user1'],
          reviewers: ['reviewer1'],
        };

        mockPulls.create.mockResolvedValue({
          data: {
            number: 42,
            html_url: 'https://github.com/test-owner/test-repo/pull/42',
            title: prDetails.title,
          },
        });

        const result = await githubService.createPR(prDetails);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          number: 42,
          url: 'https://github.com/test-owner/test-repo/pull/42',
          title: prDetails.title,
        });
        expect(mockPulls.create).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          title: prDetails.title,
          body: prDetails.body,
          base: prDetails.base,
          head: prDetails.head,
          draft: prDetails.draft,
        });
      });

      it('should handle PR creation errors', async () => {
        const prDetails: PRDetails = {
          title: 'Test PR',
          body: 'Test description',
          base: 'main',
          head: 'feature-branch',
        };

        mockPulls.create.mockRejectedValue(new Error('API Error'));

        const result = await githubService.createPR(prDetails);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('API Error');
      });

      it('should create a draft PR when specified', async () => {
        const prDetails: PRDetails = {
          title: 'Draft PR',
          body: 'Draft description',
          base: 'main',
          head: 'feature-branch',
          draft: true,
        };

        mockPulls.create.mockResolvedValue({
          data: { number: 43, html_url: 'https://github.com/test/pull/43' },
        });

        await githubService.createPR(prDetails);

        expect(mockPulls.create).toHaveBeenCalledWith(
          expect.objectContaining({ draft: true })
        );
      });
    });

    describe('listPRs', () => {
      it('should list open PRs by default', async () => {
        mockPulls.list.mockResolvedValue({
          data: [
            { number: 1, title: 'PR 1', state: 'open', html_url: 'url1', created_at: '2025-01-01', updated_at: '2025-01-02', user: { login: 'user1' }, draft: false },
            { number: 2, title: 'PR 2', state: 'open', html_url: 'url2', created_at: '2025-01-03', updated_at: '2025-01-04', user: { login: 'user2' }, draft: false },
          ],
        });

        const result = await githubService.listPRs();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(mockPulls.list).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          state: 'open',
          sort: 'created',
          direction: 'desc',
          per_page: 30,
        });
      });

      it('should list closed PRs when specified', async () => {
        mockPulls.list.mockResolvedValue({
          data: [{ number: 3, title: 'Closed PR', state: 'closed' }],
        });

        const result = await githubService.listPRs('closed');

        expect(result.success).toBe(true);
        expect(mockPulls.list).toHaveBeenCalledWith(
          expect.objectContaining({ state: 'closed' })
        );
      });

      it('should handle list errors', async () => {
        mockPulls.list.mockRejectedValue(new Error('Network error'));

        const result = await githubService.listPRs();

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Network error');
      });
    });

    describe('getPR', () => {
      it('should get a specific PR by number', async () => {
        mockPulls.get.mockResolvedValue({
          data: {
            number: 42,
            title: 'Test PR',
            body: 'Description',
            state: 'open',
            html_url: 'https://github.com/test/pull/42',
            base: { ref: 'main' },
            head: { ref: 'feature' },
            draft: false,
            mergeable: true,
            merged: false,
            created_at: '2025-01-01',
            updated_at: '2025-01-02',
            user: { login: 'user1' },
          },
        });

        mockPulls.listFiles.mockResolvedValue({
          data: [
            { filename: 'src/file1.ts', status: 'added', additions: 10, deletions: 0, changes: 10, patch: '' },
            { filename: 'src/file2.ts', status: 'modified', additions: 5, deletions: 3, changes: 8, patch: '' },
          ],
        });

        mockPulls.listReviews.mockResolvedValue({
          data: [
            { id: 1, user: { login: 'reviewer1' }, state: 'APPROVED', body: 'LGTM', submitted_at: '2025-01-02' },
          ],
        });

        const result = await githubService.getPR(42);

        expect(result.success).toBe(true);
        expect(result.data?.number).toBe(42);
        expect(result.data?.files).toHaveLength(2);
        expect(result.data?.reviews).toHaveLength(1);
        expect(mockPulls.get).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          pull_number: 42,
        });
      });

      it('should handle not found errors', async () => {
        mockPulls.get.mockRejectedValue(new Error('Not found'));

        const result = await githubService.getPR(999);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Not found');
      });
    });

    describe('mergePR', () => {
      it('should merge a PR with default merge method', async () => {
        mockPulls.merge.mockResolvedValue({
          data: { merged: true, sha: 'abc123' },
        });

        const result = await githubService.mergePR(42);

        expect(result.success).toBe(true);
        expect(mockPulls.merge).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          pull_number: 42,
          merge_method: 'merge',
        });
      });

      it('should merge a PR with squash method', async () => {
        mockPulls.merge.mockResolvedValue({
          data: { merged: true, sha: 'def456' },
        });

        const result = await githubService.mergePR(42, 'squash');

        expect(result.success).toBe(true);
        expect(mockPulls.merge).toHaveBeenCalledWith(
          expect.objectContaining({ merge_method: 'squash' })
        );
      });

      it('should handle merge conflicts', async () => {
        mockPulls.merge.mockRejectedValue(new Error('Merge conflict'));

        const result = await githubService.mergePR(42);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Merge conflict');
      });
    });

    describe('closePR', () => {
      it('should close a PR', async () => {
        mockPulls.update.mockResolvedValue({
          data: { number: 42, state: 'closed' },
        });

        const result = await githubService.closePR(42);

        expect(result.success).toBe(true);
        expect(mockPulls.update).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          pull_number: 42,
          state: 'closed',
        });
      });

      it('should handle close errors', async () => {
        mockPulls.update.mockRejectedValue(new Error('Permission denied'));

        const result = await githubService.closePR(42);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Permission denied');
      });
    });

    describe('commentOnPR', () => {
      it('should add a comment to a PR', async () => {
        mockIssues.createComment.mockResolvedValue({
          data: { id: 123, html_url: 'https://github.com/test/issues/42#issuecomment-123', body: 'Test comment' },
        });

        const result = await githubService.commentOnPR(42, 'Test comment');

        expect(result.success).toBe(true);
        expect(mockIssues.createComment).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          issue_number: 42,
          body: 'Test comment',
        });
      });
    });
  });

  describe('Issue Management', () => {
    describe('createIssue', () => {
      it('should create an issue with all details', async () => {
        const issueDetails: IssueDetails = {
          title: 'Bug: Test issue',
          body: 'Issue description',
          labels: ['bug', 'priority-high'],
          assignees: ['user1'],
          milestone: 1,
        };

        mockIssues.create.mockResolvedValue({
          data: {
            number: 10,
            html_url: 'https://github.com/test-owner/test-repo/issues/10',
            title: issueDetails.title,
          },
        });

        const result = await githubService.createIssue(issueDetails);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          number: 10,
          url: 'https://github.com/test-owner/test-repo/issues/10',
          title: issueDetails.title,
        });
        expect(mockIssues.create).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          title: issueDetails.title,
          body: issueDetails.body,
          labels: issueDetails.labels,
          assignees: issueDetails.assignees,
          milestone: issueDetails.milestone,
        });
      });

      it('should handle issue creation errors', async () => {
        mockIssues.create.mockRejectedValue(new Error('Validation failed'));

        const result = await githubService.createIssue({
          title: 'Test',
          body: 'Test',
        });

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Validation failed');
      });
    });

    describe('updateIssue', () => {
      it('should update an issue', async () => {
        const updates: Partial<IssueDetails> = {
          title: 'Updated title',
          body: 'Updated description',
          labels: ['bug', 'fixed'],
        };

        mockIssues.update.mockResolvedValue({
          data: { number: 10, ...updates },
        });

        const result = await githubService.updateIssue(10, updates);

        expect(result.success).toBe(true);
        expect(mockIssues.update).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          issue_number: 10,
          ...updates,
        });
      });
    });

    describe('closeIssue', () => {
      it('should close an issue', async () => {
        mockIssues.update.mockResolvedValue({
          data: { number: 10, state: 'closed' },
        });

        const result = await githubService.closeIssue(10);

        expect(result.success).toBe(true);
        expect(mockIssues.update).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          issue_number: 10,
          state: 'closed',
        });
      });
    });

    describe('commentOnIssue', () => {
      it('should add a comment to an issue', async () => {
        mockIssues.createComment.mockResolvedValue({
          data: { id: 456, body: 'Issue comment' },
        });

        const result = await githubService.commentOnIssue(10, 'Issue comment');

        expect(result.success).toBe(true);
        expect(mockIssues.createComment).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          issue_number: 10,
          body: 'Issue comment',
        });
      });
    });
  });

  describe('Branch Operations', () => {
    describe('createBranch', () => {
      it('should create a branch from default branch', async () => {
        mockGit.getRef.mockResolvedValue({
          data: { object: { sha: 'main-sha-123' } },
        });

        mockGit.createRef.mockResolvedValue({
          data: { ref: 'refs/heads/new-feature', object: { sha: 'main-sha-123' } },
        });

        const result = await githubService.createBranch('new-feature');

        expect(result.success).toBe(true);
        expect(mockGit.getRef).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          ref: 'heads/main',
        });
        expect(mockGit.createRef).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          ref: 'refs/heads/new-feature',
          sha: 'main-sha-123',
        });
      });

      it('should create a branch from specified source branch', async () => {
        mockGit.getRef.mockResolvedValue({
          data: { object: { sha: 'develop-sha-456' } },
        });

        mockGit.createRef.mockResolvedValue({
          data: { ref: 'refs/heads/feature-branch' },
        });

        const result = await githubService.createBranch('feature-branch', 'develop');

        expect(result.success).toBe(true);
        expect(mockGit.getRef).toHaveBeenCalledWith(
          expect.objectContaining({ ref: 'heads/develop' })
        );
      });

      it('should handle branch creation errors', async () => {
        mockGit.getRef.mockRejectedValue(new Error('Branch not found'));

        const result = await githubService.createBranch('new-branch', 'non-existent');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Branch not found');
      });
    });

    describe('listBranches', () => {
      it('should list all branches', async () => {
        mockRepos.listBranches.mockResolvedValue({
          data: [
            { name: 'main', commit: { sha: 'sha1' }, protected: true },
            { name: 'develop', commit: { sha: 'sha2' }, protected: false },
            { name: 'feature-1', commit: { sha: 'sha3' }, protected: false },
          ],
        });

        const result = await githubService.listBranches();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data?.[0]).toEqual({
          name: 'main',
          sha: 'sha1',
          protected: true,
        });
      });

      it('should handle list errors', async () => {
        mockRepos.listBranches.mockRejectedValue(new Error('API error'));

        const result = await githubService.listBranches();

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('API error');
      });
    });

    describe('deleteBranch', () => {
      it('should delete a branch', async () => {
        mockGit.deleteRef.mockResolvedValue({ data: {} });

        const result = await githubService.deleteBranch('old-feature');

        expect(result.success).toBe(true);
        expect(mockGit.deleteRef).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          ref: 'heads/old-feature',
        });
      });

      it('should handle protected branch deletion', async () => {
        mockGit.deleteRef.mockRejectedValue(new Error('Branch is protected'));

        const result = await githubService.deleteBranch('main');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Branch is protected');
      });
    });

    describe('compareBranches', () => {
      it('should compare two branches', async () => {
        mockRepos.compareCommits.mockResolvedValue({
          data: {
            ahead_by: 5,
            behind_by: 2,
            status: 'ahead',
            commits: [
              { sha: 'commit1', commit: { message: 'Commit 1' } },
              { sha: 'commit2', commit: { message: 'Commit 2' } },
            ],
          },
        });

        const result = await githubService.compareBranches('main', 'feature');

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          aheadBy: 5,
          behindBy: 2,
          status: 'ahead',
          commits: 2,
        });
      });
    });
  });

  describe('Commit Operations', () => {
    describe('getCommitHistory', () => {
      it('should get commit history with default limit', async () => {
        mockRepos.listCommits.mockResolvedValue({
          data: [
            {
              sha: 'sha1',
              commit: {
                message: 'feat: Add feature',
                author: { name: 'User 1', email: 'user1@example.com', date: '2025-10-26' },
              },
              html_url: 'https://github.com/test/commit/sha1',
            },
          ],
        });

        const result = await githubService.getCommitHistory();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data?.[0].message).toBe('feat: Add feature');
        expect(mockRepos.listCommits).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          sha: 'main',
          per_page: 10,
        });
      });

      it('should get commit history for specific branch', async () => {
        mockRepos.listCommits.mockResolvedValue({ data: [] });

        await githubService.getCommitHistory(20, 'develop');

        expect(mockRepos.listCommits).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          sha: 'develop',
          per_page: 20,
        });
      });
    });

    describe('generateCommitMessage', () => {
      it('should generate commit message for new files', () => {
        const files = [
          { path: 'src/components/Button.tsx', status: 'added' },
          { path: 'src/components/Input.tsx', status: 'added' },
        ];

        const message = githubService.generateCommitMessage(files);

        expect(message).toContain('feat');
        expect(message).toContain('src');
      });

      it('should generate commit message for modified files', () => {
        const files = [
          { path: 'src/utils/helpers.ts', status: 'modified' },
        ];

        const message = githubService.generateCommitMessage(files);

        expect(message).toContain('fix');
        expect(message).toContain('src/utils/helpers.ts');
      });

      it('should generate commit message for deleted files', () => {
        const files = [
          { path: 'src/old-component.tsx', status: 'deleted' },
        ];

        const message = githubService.generateCommitMessage(files);

        expect(message).toContain('refactor');
        expect(message).toContain('src/old-component.tsx');
      });

      it('should handle mixed file statuses', () => {
        const files = [
          { path: 'src/new.ts', status: 'added' },
          { path: 'src/updated.ts', status: 'modified' },
          { path: 'src/removed.ts', status: 'deleted' },
        ];

        const message = githubService.generateCommitMessage(files);

        expect(message).toContain('refactor');
        expect(message.toLowerCase()).toContain('update');
      });
    });
  });

  describe('GitHub Actions', () => {
    describe('getWorkflowRuns', () => {
      it('should get workflow runs with default limit', async () => {
        mockActions.listWorkflowRunsForRepo.mockResolvedValue({
          data: {
            workflow_runs: [
              {
                id: 1,
                name: 'CI',
                status: 'completed',
                conclusion: 'success',
                html_url: 'https://github.com/test/actions/runs/1',
              },
            ],
          },
        });

        const result = await githubService.getWorkflowRuns();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data?.[0].name).toBe('CI');
        expect(mockActions.listWorkflowRunsForRepo).toHaveBeenCalledWith({
          owner: defaultConfig.owner,
          repo: defaultConfig.repo,
          per_page: 5,
        });
      });

      it('should get workflow runs with custom limit', async () => {
        mockActions.listWorkflowRunsForRepo.mockResolvedValue({
          data: { workflow_runs: [] },
        });

        await githubService.getWorkflowRuns(25);

        expect(mockActions.listWorkflowRunsForRepo).toHaveBeenCalledWith(
          expect.objectContaining({ per_page: 25 })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failures', async () => {
      mockPulls.list.mockRejectedValue(new Error('Bad credentials'));

      const result = await githubService.listPRs();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Bad credentials');
    });

    it('should handle rate limiting', async () => {
      mockRepos.listBranches.mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await githubService.listBranches();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('rate limit');
    });

    it('should handle network errors', async () => {
      mockIssues.create.mockRejectedValue(new Error('Network request failed'));

      const result = await githubService.createIssue({ title: 'Test', body: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network request failed');
    });

    it('should handle malformed responses', async () => {
      mockPulls.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'Test',
          body: '',
          state: 'open',
          html_url: 'url',
          base: { ref: 'main' },
          head: { ref: 'feature' },
          draft: false,
          mergeable: null,
          merged: false,
          created_at: '2025-01-01',
          updated_at: '2025-01-02',
          user: null,
        },
      });
      mockPulls.listFiles.mockResolvedValue({ data: [] });
      mockPulls.listReviews.mockResolvedValue({ data: [] });

      const result = await githubService.getPR(42);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.number).toBe(42);
      expect(result.data?.files).toHaveLength(0);
      expect(result.data?.reviews).toHaveLength(0);
    });
  });
});
