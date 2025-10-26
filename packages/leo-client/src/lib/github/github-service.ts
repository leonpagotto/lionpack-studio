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
    name?: string;
    email?: string;
    date?: string;
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
// ADVANCED GIT OPERATION TYPES (Story 3.14)
// ============================================================================

export interface CommitGroup {
  message: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore';
}

export interface ConflictMarker {
  start: number;
  middle: number;
  end: number;
}

export interface ConflictInfo {
  file: string;
  content: string;
  markers: ConflictMarker[];
  baseContent: string;
  headContent: string;
  ourContent: string;
  theirContent: string;
}

export interface Resolution {
  file: string;
  resolvedContent: string;
  strategy: 'ours' | 'theirs' | 'manual';
}

export interface ReviewComment {
  path: string;
  position?: number;
  body: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  startLine?: number;
  startSide?: 'LEFT' | 'RIGHT';
}

export interface Review {
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  body: string;
  comments?: ReviewComment[];
}

export interface DiffFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}

export interface DiffResult {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
  compareUrl?: string;
}

export interface CherryPickResult {
  success: boolean;
  commit?: CommitInfo;
  conflicts?: ConflictInfo[];
  error?: string;
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
  // ADVANCED GIT OPERATIONS (Story 3.14)
  // ==========================================================================

  /**
   * Create multiple commits in a group
   * Each commit in the group will be applied sequentially
   */
  async createCommitGroup(
    branch: string,
    commitGroups: CommitGroup[]
  ): Promise<GitHubOperationResult> {
    try {
      // Get the current branch reference
      const branchRef = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`,
      });

      let currentSha = branchRef.data.object.sha;
      const createdCommits: CommitInfo[] = [];

      // Process each commit group sequentially
      for (const group of commitGroups) {
        // Get the current tree
        const currentCommit = await this.octokit.git.getCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          commit_sha: currentSha,
        });

        const baseTreeSha = currentCommit.data.tree.sha;

        // Create blobs for all files in this commit
        const blobs = await Promise.all(
          group.files.map(async (file) => {
            const blob = await this.octokit.git.createBlob({
              owner: this.config.owner,
              repo: this.config.repo,
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64',
            });
            return {
              path: file.path,
              mode: '100644' as const,
              type: 'blob' as const,
              sha: blob.data.sha,
            };
          })
        );

        // Create new tree with the files
        const tree = await this.octokit.git.createTree({
          owner: this.config.owner,
          repo: this.config.repo,
          base_tree: baseTreeSha,
          tree: blobs,
        });

        // Create the commit
        const commit = await this.octokit.git.createCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          message: group.message,
          tree: tree.data.sha,
          parents: [currentSha],
        });

        createdCommits.push({
          sha: commit.data.sha,
          message: commit.data.message,
          author: {
            name: commit.data.author.name,
            email: commit.data.author.email,
            date: commit.data.author.date,
          },
          url: commit.data.html_url,
        });

        // Update current SHA for next iteration
        currentSha = commit.data.sha;
      }

      // Update the branch reference to point to the last commit
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`,
        sha: currentSha,
        force: false,
      });

      return {
        success: true,
        data: {
          commits: createdCommits,
          finalSha: currentSha,
          branch,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to create commit group', error);
    }
  }

  /**
   * Detect merge conflicts between two branches
   */
  async detectConflicts(base: string, head: string): Promise<GitHubOperationResult> {
    try {
      // Try to get the comparison between branches
      const comparison = await this.octokit.repos.compareCommitsWithBasehead({
        owner: this.config.owner,
        repo: this.config.repo,
        basehead: `${base}...${head}`,
      });

      // Check if there are conflicting files
      const conflicts: ConflictInfo[] = [];

      // Get files that might conflict
      for (const file of comparison.data.files || []) {
        if (file.status === 'modified') {
          try {
            // Try to merge the file contents
            const baseContent = await this.getFileContent(base, file.filename);
            const headContent = await this.getFileContent(head, file.filename);

            // Simple conflict detection: if both branches modified the same file
            if (baseContent.success && headContent.success) {
              const baseData = baseContent.data?.content || '';
              const headData = headContent.data?.content || '';

              if (baseData !== headData) {
                // Check if there are actual conflicts (simplified)
                const hasConflict = this.detectFileConflicts(baseData, headData);

                if (hasConflict) {
                  conflicts.push({
                    file: file.filename,
                    content: file.patch || '',
                    markers: [], // Will be populated by actual merge attempt
                    baseContent: baseData,
                    headContent: headData,
                    ourContent: baseData,
                    theirContent: headData,
                  });
                }
              }
            }
          } catch (error) {
            // File might not exist in one of the branches
            console.warn(`Could not check conflict for ${file.filename}:`, error);
          }
        }
      }

      return {
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts,
          filesChanged: comparison.data.files?.length || 0,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to detect conflicts', error);
    }
  }

  /**
   * Get file content from a specific branch
   */
  private async getFileContent(
    branch: string,
    path: string
  ): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: branch,
      });

      if ('content' in response.data && response.data.type === 'file') {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return {
          success: true,
          data: {
            content,
            sha: response.data.sha,
          },
        };
      }

      return {
        success: false,
        error: { message: 'Path is not a file' },
      };
    } catch (error: any) {
      return this.handleError('Failed to get file content', error);
    }
  }

  /**
   * Simple conflict detection between two file versions
   */
  private detectFileConflicts(base: string, head: string): boolean {
    // Split into lines
    const baseLines = base.split('\n');
    const headLines = head.split('\n');

    // If same content, no conflict
    if (base === head) return false;

    // If different lengths and content, likely conflicts
    if (baseLines.length !== headLines.length) return true;

    // Check for differing lines
    let differences = 0;
    for (let i = 0; i < baseLines.length; i++) {
      if (baseLines[i] !== headLines[i]) {
        differences++;
      }
    }

    // If more than 20% of lines differ, consider it a conflict
    return differences / baseLines.length > 0.2;
  }

  /**
   * Resolve conflicts with provided resolutions
   */
  async resolveConflicts(
    branch: string,
    resolutions: Resolution[]
  ): Promise<GitHubOperationResult> {
    try {
      // Get the current branch reference
      const branchRef = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`,
      });

      const currentSha = branchRef.data.object.sha;

      // Get the current commit
      const currentCommit = await this.octokit.git.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        commit_sha: currentSha,
      });

      // Create blobs for all resolved files
      const blobs = await Promise.all(
        resolutions.map(async (resolution) => {
          const blob = await this.octokit.git.createBlob({
            owner: this.config.owner,
            repo: this.config.repo,
            content: Buffer.from(resolution.resolvedContent).toString('base64'),
            encoding: 'base64',
          });
          return {
            path: resolution.file,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.data.sha,
          };
        })
      );

      // Create new tree with resolved files
      const tree = await this.octokit.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        base_tree: currentCommit.data.tree.sha,
        tree: blobs,
      });

      // Create merge commit
      const commit = await this.octokit.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message: `chore: resolve conflicts in ${resolutions.length} file(s)`,
        tree: tree.data.sha,
        parents: [currentSha],
      });

      // Update branch reference
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`,
        sha: commit.data.sha,
        force: false,
      });

      return {
        success: true,
        data: {
          commit: {
            sha: commit.data.sha,
            message: commit.data.message,
            url: commit.data.html_url,
          },
          filesResolved: resolutions.length,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to resolve conflicts', error);
    }
  }

  /**
   * Cherry-pick commits to target branch
   */
  async cherryPick(
    commits: string[],
    targetBranch: string,
    createPR: boolean = false
  ): Promise<GitHubOperationResult> {
    try {
      // Get target branch reference
      const branchRef = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${targetBranch}`,
      });

      let currentSha = branchRef.data.object.sha;
      const cherryPickedCommits: CommitInfo[] = [];

      // Cherry-pick each commit
      for (const commitSha of commits) {
        // Get the commit
        const commit = await this.octokit.git.getCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          commit_sha: commitSha,
        });

        // Create new commit with same tree and message
        const newCommit = await this.octokit.git.createCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          message: `${commit.data.message}\n\n(cherry picked from commit ${commitSha})`,
          tree: commit.data.tree.sha,
          parents: [currentSha],
        });

        cherryPickedCommits.push({
          sha: newCommit.data.sha,
          message: newCommit.data.message,
          author: {
            name: newCommit.data.author.name,
            email: newCommit.data.author.email,
            date: newCommit.data.author.date,
          },
          url: newCommit.data.html_url,
        });

        currentSha = newCommit.data.sha;
      }

      // Update branch reference
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${targetBranch}`,
        sha: currentSha,
        force: false,
      });

      let prData = null;
      if (createPR) {
        // Create a PR for the cherry-picked commits
        const pr = await this.createPR({
          title: `Cherry-pick: ${commits.length} commit(s) to ${targetBranch}`,
          body: `Cherry-picked commits:\n${commits.map((sha) => `- ${sha}`).join('\n')}`,
          base: this.config.defaultBranch || 'main',
          head: targetBranch,
        });
        prData = pr.data;
      }

      return {
        success: true,
        data: {
          commits: cherryPickedCommits,
          finalSha: currentSha,
          targetBranch,
          pr: prData,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to cherry-pick commits', error);
    }
  }

  /**
   * Add inline review comment to PR
   */
  async addReviewComment(
    prNumber: number,
    comment: ReviewComment
  ): Promise<GitHubOperationResult> {
    try {
      // Get the PR to get the latest commit SHA
      const pr = await this.octokit.pulls.get({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: prNumber,
      });

      const response = await this.octokit.pulls.createReviewComment({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: prNumber,
        commit_id: pr.data.head.sha,
        path: comment.path,
        body: comment.body,
        ...(comment.line && { line: comment.line }),
        ...(comment.side && { side: comment.side }),
        ...(comment.startLine && { start_line: comment.startLine }),
        ...(comment.startSide && { start_side: comment.startSide }),
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          path: response.data.path,
          line: response.data.line,
          body: response.data.body,
          url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to add review comment', error);
    }
  }

  /**
   * Submit a PR review
   */
  async submitReview(prNumber: number, review: Review): Promise<GitHubOperationResult> {
    try {
      // If there are inline comments, create them first
      if (review.comments && review.comments.length > 0) {
        const pr = await this.octokit.pulls.get({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: prNumber,
        });

        await Promise.all(
          review.comments.map((comment) =>
            this.octokit.pulls.createReviewComment({
              owner: this.config.owner,
              repo: this.config.repo,
              pull_number: prNumber,
              commit_id: pr.data.head.sha,
              path: comment.path,
              body: comment.body,
              ...(comment.line && { line: comment.line }),
              ...(comment.side && { side: comment.side }),
            })
          )
        );
      }

      // Submit the review
      const response = await this.octokit.pulls.createReview({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: prNumber,
        event: review.event,
        body: review.body,
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          state: response.data.state,
          body: response.data.body,
          url: response.data.html_url,
          submittedAt: response.data.submitted_at,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to submit review', error);
    }
  }

  /**
   * Get diff between two branches or commits
   */
  async getDiff(
    base: string,
    head: string,
    files?: string[]
  ): Promise<GitHubOperationResult> {
    try {
      const comparison = await this.octokit.repos.compareCommitsWithBasehead({
        owner: this.config.owner,
        repo: this.config.repo,
        basehead: `${base}...${head}`,
      });

      let diffFiles = comparison.data.files || [];

      // Filter by specific files if provided
      if (files && files.length > 0) {
        diffFiles = diffFiles.filter((f) => files.includes(f.filename));
      }

      const result: DiffResult = {
        files: diffFiles.map((file) => ({
          filename: file.filename,
          status: file.status as any,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          previousFilename: file.previous_filename,
        })),
        totalAdditions: diffFiles.reduce((sum, f) => sum + f.additions, 0),
        totalDeletions: diffFiles.reduce((sum, f) => sum + f.deletions, 0),
        totalChanges: diffFiles.reduce((sum, f) => sum + f.changes, 0),
        compareUrl: comparison.data.html_url,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return this.handleError('Failed to get diff', error);
    }
  }

  /**
   * Get diff for a specific commit
   */
  async getCommitDiff(commitSha: string): Promise<GitHubOperationResult> {
    try {
      const commit = await this.octokit.repos.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: commitSha,
      });

      const result: DiffResult = {
        files: (commit.data.files || []).map((file) => ({
          filename: file.filename,
          status: file.status as any,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          previousFilename: file.previous_filename,
        })),
        totalAdditions: commit.data.stats?.additions || 0,
        totalDeletions: commit.data.stats?.deletions || 0,
        totalChanges: commit.data.stats?.total || 0,
        compareUrl: commit.data.html_url,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return this.handleError('Failed to get commit diff', error);
    }
  }

  /**
   * Get commit history with pagination
   */
  async getCommitHistory(
    branch: string,
    page: number = 1,
    perPage: number = 30,
    author?: string,
    since?: string,
    until?: string
  ): Promise<GitHubOperationResult> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        sha: branch,
        page,
        per_page: perPage,
        ...(author && { author }),
        ...(since && { since }),
        ...(until && { until }),
      });

      return {
        success: true,
        data: {
          commits: response.data.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
              name: commit.commit.author?.name,
              email: commit.commit.author?.email,
              date: commit.commit.author?.date,
            },
            url: commit.html_url,
          })),
          page,
          perPage,
          hasMore: response.data.length === perPage,
        },
      };
    } catch (error: any) {
      return this.handleError('Failed to get commit history', error);
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
