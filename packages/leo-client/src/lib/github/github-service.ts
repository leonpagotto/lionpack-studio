/**
 * GitHub Service
 * Provides GitHub API integration for PR, Issue, Branch, and Commit operations
 * Uses Octokit for GitHub API access
 */

import { Octokit } from '@octokit/rest';

// ============================================================================
// TYPES
// ============================================================================

export interface GitHubServiceConfig {
  owner: string;
  repo: string;
  token: string;
  defaultBranch?: string;
}

export interface PRDetails {
  number?: number;
  title: string;
  body: string;
  base: string;
  head: string;
  draft?: boolean;
  labels?: string[];
  assignees?: string[];
  reviewers?: string[];
}

export interface IssueDetails {
  number?: number;
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

export interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
  aheadBy?: number;
  behindBy?: number;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GitHubOperationResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

// ============================================================================
// GITHUB SERVICE
// ============================================================================

export class GitHubService {
  private octokit: Octokit;
  private config: GitHubServiceConfig;

  constructor(config: GitHubServiceConfig) {
    this.config = {
      ...config,
      defaultBranch: config.defaultBranch || 'main',
    };

    this.octokit = new Octokit({
      auth: config.token,
      userAgent: 'LionPack-Studio/1.0',
    });
  }

  // ==========================================================================
  // PR MANAGEMENT
  // ==========================================================================

  /**
   * Create a new pull request
   */
  async createPR(details: PRDetails): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: details.title,
        body: details.body,
        base: details.base,
        head: details.head,
        draft: details.draft || false,
      });

      const pr = response.data;

      // Add labels if provided
      if (details.labels && details.labels.length > 0) {
        await this.octokit.issues.addLabels({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: pr.number,
          labels: details.labels,
        });
      }

      // Add assignees if provided
      if (details.assignees && details.assignees.length > 0) {
        await this.octokit.issues.addAssignees({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: pr.number,
          assignees: details.assignees,
        });
      }

      // Request reviewers if provided
      if (details.reviewers && details.reviewers.length > 0) {
        await this.octokit.pulls.requestReviewers({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: pr.number,
          reviewers: details.reviewers,
        });
      }

      return {
        success: true,
        data: {
          number: pr.number,
          url: pr.html_url,
          title: pr.title,
          state: pr.state,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to create PR', error);
    }
  }

  /**
   * List pull requests
   */
  async listPRs(state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.pulls.list({
        owner: this.config.owner,
        repo: this.config.repo,
        state,
        sort: 'created',
        direction: 'desc',
        per_page: 30,
      });

      return {
        success: true,
        data: response.data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          url: pr.html_url,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          author: pr.user?.login,
          draft: pr.draft,
        })),
      };
    } catch (error: any) {
      return this.handleError('Failed to list PRs', error);
    }
  }

  /**
   * Get pull request details
   */
  async getPR(number: number): Promise<GitHubOperationResult> {
    try {
      const [prResponse, filesResponse, reviewsResponse] = await Promise.all([
        this.octokit.pulls.get({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: number,
        }),
        this.octokit.pulls.listFiles({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: number,
        }),
        this.octokit.pulls.listReviews({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: number,
        }),
      ]);

      const pr = prResponse.data;
      const files = filesResponse.data;
      const reviews = reviewsResponse.data;

      return {
        success: true,
        data: {
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          url: pr.html_url,
          base: pr.base.ref,
          head: pr.head.ref,
          draft: pr.draft,
          mergeable: pr.mergeable,
          merged: pr.merged,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          author: pr.user?.login,
          files: files.map((f) => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            changes: f.changes,
            patch: f.patch,
          })),
          reviews: reviews.map((r) => ({
            id: r.id,
            user: r.user?.login,
            state: r.state,
            body: r.body,
            submittedAt: r.submitted_at,
          })),
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to get PR #${number}`, error);
    }
  }

  /**
   * Merge a pull request
   */
  async mergePR(number: number, method: 'merge' | 'squash' | 'rebase' = 'merge'): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.pulls.merge({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: number,
        merge_method: method,
      });

      return {
        success: true,
        data: {
          merged: response.data.merged,
          message: response.data.message,
          sha: response.data.sha,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to merge PR #${number}`, error);
    }
  }

  /**
   * Close a pull request
   */
  async closePR(number: number): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.pulls.update({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: number,
        state: 'closed',
      });

      return {
        success: true,
        data: {
          number: response.data.number,
          state: response.data.state,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to close PR #${number}`, error);
    }
  }

  /**
   * Comment on a pull request
   */
  async commentOnPR(number: number, body: string): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.issues.createComment({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: number,
        body,
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to comment on PR #${number}`, error);
    }
  }

  // ==========================================================================
  // ISSUE MANAGEMENT
  // ==========================================================================

  /**
   * Create a new issue
   */
  async createIssue(details: IssueDetails): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.issues.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: details.title,
        body: details.body,
        labels: details.labels,
        assignees: details.assignees,
        milestone: details.milestone,
      });

      const issue = response.data;

      return {
        success: true,
        data: {
          number: issue.number,
          url: issue.html_url,
          title: issue.title,
          state: issue.state,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to create issue', error);
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(number: number, updates: Partial<IssueDetails>): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.issues.update({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: number,
        ...updates,
      });

      return {
        success: true,
        data: {
          number: response.data.number,
          state: response.data.state,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to update issue #${number}`, error);
    }
  }

  /**
   * Close an issue
   */
  async closeIssue(number: number): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.issues.update({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: number,
        state: 'closed',
      });

      return {
        success: true,
        data: {
          number: response.data.number,
          state: response.data.state,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to close issue #${number}`, error);
    }
  }

  /**
   * Comment on an issue
   */
  async commentOnIssue(number: number, body: string): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.issues.createComment({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: number,
        body,
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to comment on issue #${number}`, error);
    }
  }

  // ==========================================================================
  // BRANCH OPERATIONS
  // ==========================================================================

  /**
   * Create a new branch
   */
  async createBranch(name: string, from?: string): Promise<GitHubOperationResult> {
    try {
      // Get SHA of source branch
      const baseBranch = from || this.config.defaultBranch!;
      const refResponse = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${baseBranch}`,
      });

      const sha = refResponse.data.object.sha;

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${name}`,
        sha,
      });

      return {
        success: true,
        data: {
          name,
          sha,
          from: baseBranch,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to create branch ${name}`, error);
    }
  }

  /**
   * List branches
   */
  async listBranches(): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: this.config.owner,
        repo: this.config.repo,
        per_page: 100,
      });

      return {
        success: true,
        data: response.data.map((branch) => ({
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected,
        })),
      };
    } catch (error: any) {
      return this.handleError('Failed to list branches', error);
    }
  }

  /**
   * Delete a branch
   */
  async deleteBranch(name: string): Promise<GitHubOperationResult> {
    try {
      await this.octokit.git.deleteRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${name}`,
      });

      return {
        success: true,
        data: {
          deleted: name,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to delete branch ${name}`, error);
    }
  }

  /**
   * Get current branch (from local git)
   * Note: This is a placeholder - actual implementation would use git commands
   */
  async getCurrentBranch(): Promise<GitHubOperationResult> {
    // This would typically use local git commands or be passed in
    return {
      success: true,
      data: {
        name: 'main', // Placeholder
      },
    };
  }

  /**
   * Compare branches
   */
  async compareBranches(base: string, head: string): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.repos.compareCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        base,
        head,
      });

      return {
        success: true,
        data: {
          aheadBy: response.data.ahead_by,
          behindBy: response.data.behind_by,
          status: response.data.status,
          commits: response.data.commits.length,
        },
      };
    } catch (error: any) {
      return this.handleError(`Failed to compare ${base}...${head}`, error);
    }
  }

  // ==========================================================================
  // COMMIT & PUSH
  // ==========================================================================

  /**
   * Get commit history
   */
  async getCommitHistory(limit: number = 10, branch?: string): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        sha: branch || this.config.defaultBranch,
        per_page: limit,
      });

      return {
        success: true,
        data: response.data.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: {
            name: commit.commit.author?.name,
            email: commit.commit.author?.email,
            date: commit.commit.author?.date,
          },
          url: commit.html_url,
        })),
      };
    } catch (error: any) {
      return this.handleError('Failed to get commit history', error);
    }
  }

  /**
   * Generate conventional commit message from file changes
   */
  generateCommitMessage(files: Array<{ path: string; status: string }>): string {
    // Analyze files to determine type
    const hasNewFiles = files.some((f) => f.status === 'added');
    const hasModifiedFiles = files.some((f) => f.status === 'modified');
    const hasDeletedFiles = files.some((f) => f.status === 'deleted');

    // Determine scope from file paths
    const scopes = new Set<string>();
    files.forEach((f) => {
      const parts = f.path.split('/');
      if (parts.length > 1) {
        scopes.add(parts[0]);
      }
    });

    const scope = scopes.size === 1 ? Array.from(scopes)[0] : 'multiple';

    // Determine type
    let type = 'chore';
    if (hasNewFiles && !hasModifiedFiles && !hasDeletedFiles) {
      type = 'feat';
    } else if (hasModifiedFiles && !hasNewFiles) {
      type = 'fix';
    } else if (hasDeletedFiles) {
      type = 'refactor';
    }

    // Generate message
    const fileCount = files.length;
    const summary = fileCount === 1 ? files[0].path : `${fileCount} files`;

    return `${type}(${scope}): update ${summary}`;
  }

  // ==========================================================================
  // GITHUB ACTIONS
  // ==========================================================================

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(limit: number = 5): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.actions.listWorkflowRunsForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        per_page: limit,
      });

      return {
        success: true,
        data: response.data.workflow_runs.map((run) => ({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          createdAt: run.created_at,
          updatedAt: run.updated_at,
          url: run.html_url,
          branch: run.head_branch,
        })),
      };
    } catch (error: any) {
      return this.handleError('Failed to get workflow runs', error);
    }
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private handleError(message: string, error: any): GitHubOperationResult {
    console.error(message, error);

    return {
      success: false,
      error: {
        message: error.message || message,
        code: error.code,
        status: error.status,
      },
    };
  }
}
