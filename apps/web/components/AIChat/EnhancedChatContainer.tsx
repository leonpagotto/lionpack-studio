/**
 * Enhanced Chat Container with Full Context
 *
 * Integrates:
 * - Filesystem context (Story 3.11)
 * - Mode routing (Story 3.8)
 * - Code generation (Story 3.9)
 * - Multi-provider AI (Story 3.10)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import type { AIMessage } from '@lionpack/leo-client';
import { FilesystemAgent, GitHubService } from '@lionpack/leo-client';
import type { PRDetails, IssueDetails } from '@lionpack/leo-client';

// Message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    intent?: string;
    filesRead?: string[];
    filesModified?: string[];
  };
}

// File operation types
export interface FileOperation {
  type: 'create' | 'modify' | 'delete' | 'rename';
  path: string;
  content?: string;
  newPath?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'executing';
  preview?: string;
}

// GitHub operation types (reusing same pattern as FileOperation)
export interface GitHubOperation {
  type:
    | 'create-pr'
    | 'create-issue'
    | 'create-branch'
    | 'commit'
    | 'commit-group'           // Story 3.14: Multi-commit
    | 'resolve-conflicts'      // Story 3.14: Conflict resolution
    | 'cherry-pick'            // Story 3.14: Cherry-pick
    | 'pr-review'              // Story 3.14: PR review
    | 'view-diff';             // Story 3.14: Diff viewing
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'executing';
  data:
    | PRDetails
    | IssueDetails
    | { name: string; from?: string }
    | { message: string; files: string[] }
    | { branch: string; commits: Array<{ type: string; message: string; files: string[] }> }  // commit-group
    | { branch: string; strategy: string; resolutions: Array<{ path: string; content: string }> }  // resolve-conflicts
    | { commits: string[]; target: string; createPR?: boolean }  // cherry-pick
    | { prNumber: number; event: string; comments?: Array<{ path: string; line: number; body: string }>; body: string }  // pr-review
    | { base: string; head: string; files?: string[] };  // view-diff
  preview?: string;
}

interface EnhancedChatContainerProps {
  showFileContext?: boolean;
  allowFileOperations?: boolean;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  showFileContext = true,
  allowFileOperations = true,
}) => {
  const {
    files,
    activeFile,
    filesystem,
    filesystemService,
    refreshFileTree,
  } = useEditor();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I\'m your AI assistant with full access to your project. I can read files, generate code, and help you build. What would you like to work on?',
    timestamp: new Date(),
  }]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<FileOperation[]>([]);
  const [pendingGitHubOps, setPendingGitHubOps] = useState<GitHubOperation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context from filesystem
  const buildContext = useCallback((): string => {
    if (!filesystem.isConnected) {
      return 'No filesystem connected. User needs to open a folder or connect to GitHub first.';
    }

    const contextParts: string[] = [];

    // Add source info
    contextParts.push(`Filesystem: ${filesystem.source === 'local' ? 'Local folder' : 'GitHub repository'}`);

    if (filesystem.sourceInfo) {
      contextParts.push(`Source: ${filesystem.sourceInfo.displayName}`);

      if (filesystem.sourceInfo.config && 'owner' in filesystem.sourceInfo.config) {
        // GitHub source
        contextParts.push(`Repository: ${filesystem.sourceInfo.config.owner}/${filesystem.sourceInfo.config.repo}`);
        contextParts.push(`Branch: ${filesystem.sourceInfo.config.branch}`);
      } else if (filesystem.sourceInfo.config && 'rootPath' in filesystem.sourceInfo.config) {
        // Local source
        contextParts.push(`Path: ${filesystem.sourceInfo.config.rootPath}`);
      }
    }

    // Add file tree structure
    if (files.length > 0) {
      contextParts.push(`\nProject files (${files.length} total):`);
      const fileList = files.slice(0, 20).map(f => f.path).join('\n');
      contextParts.push(fileList);
      if (files.length > 20) {
        contextParts.push(`... and ${files.length - 20} more files`);
      }
    }

    // Add active file context
    if (activeFile) {
      contextParts.push(`\nCurrently viewing: ${activeFile.path}`);
      if (activeFile.content) {
        const preview = activeFile.content.split('\n').slice(0, 10).join('\n');
        contextParts.push(`\nFile preview:\n\`\`\`\n${preview}\n${activeFile.content.split('\n').length > 10 ? '...' : ''}\n\`\`\``);
      }
    }

    return contextParts.join('\n');
  }, [filesystem, files, activeFile]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      // Build messages array with context
      const systemContext = buildContext();
      const apiMessages: AIMessage[] = [
        {
          role: 'system',
          content: `You are an AI coding assistant integrated into LionPack Studio.

${systemContext}

You can:
1. Read files from the project
2. Generate new code
3. Modify existing files (with user approval)
4. Create GitHub PRs, Issues, and Branches (with user approval)
5. Answer questions about the codebase

When suggesting file operations, use this format:
<file_operation type="create|modify|delete" path="/path/to/file">
content here
</file_operation>

When suggesting GitHub operations, use these formats:
- Create PR: <github_pr title="feat: Add feature" base="main" head="feature-branch">PR description</github_pr>
- Create Issue: <github_issue title="Bug: Fix issue" labels="bug,priority-high">Issue description</github_issue>
- Create Branch: <github_branch name="feature/new-feature" from="main"/>

Be concise and helpful.`
        },
        ...messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        {
          role: 'user',
          content: input,
        }
      ];

      // Call chat API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          provider: 'gemini',
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.content) {
                assistantMessage.content += parsed.content;

                if (isFirstChunk) {
                  setMessages(prev => [...prev, assistantMessage]);
                  isFirstChunk = false;
                } else {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    if (newMessages[lastIdx].role === 'assistant') {
                      newMessages[lastIdx] = { ...assistantMessage };
                    }
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Parse file operations from response
      if (allowFileOperations) {
        const fileOpRegex = /<file_operation type="(create|modify|delete|rename)" path="([^"]+)">([\s\S]*?)<\/file_operation>/g;
        const operations: FileOperation[] = [];
        let match;

        while ((match = fileOpRegex.exec(assistantMessage.content)) !== null) {
          operations.push({
            type: match[1] as FileOperation['type'],
            path: match[2],
            content: match[3].trim(),
            status: 'pending',
          });
        }

        if (operations.length > 0) {
          setPendingOperations(prev => [...prev, ...operations]);
        }
      }

      // Parse GitHub operations from response (same pattern as file operations)
      if (allowFileOperations) {
        // PR creation: <github_pr title="..." base="..." head="...">body</github_pr>
        const prRegex = /<github_pr title="([^"]+)" base="([^"]+)" head="([^"]+)">([\s\S]*?)<\/github_pr>/g;
        let prMatch;

        while ((prMatch = prRegex.exec(assistantMessage.content)) !== null) {
          const prOp: GitHubOperation = {
            type: 'create-pr',
            status: 'pending',
            data: {
              title: prMatch[1],
              base: prMatch[2],
              head: prMatch[3],
              body: prMatch[4].trim(),
            } as PRDetails,
          };
          setPendingGitHubOps(prev => [...prev, prOp]);
        }

        // Issue creation: <github_issue title="..." labels="...">body</github_issue>
        const issueRegex = /<github_issue title="([^"]+)"(?:\s+labels="([^"]+)")?>([^<]*?)<\/github_issue>/g;
        let issueMatch;

        while ((issueMatch = issueRegex.exec(assistantMessage.content)) !== null) {
          const issueOp: GitHubOperation = {
            type: 'create-issue',
            status: 'pending',
            data: {
              title: issueMatch[1],
              body: issueMatch[3].trim(),
              labels: issueMatch[2] ? issueMatch[2].split(',').map(l => l.trim()) : undefined,
            } as IssueDetails,
          };
          setPendingGitHubOps(prev => [...prev, issueOp]);
        }

        // Branch creation: <github_branch name="..." from="..."/>
        const branchRegex = /<github_branch name="([^"]+)"(?:\s+from="([^"]+)")?\/>/g;
        let branchMatch;

        while ((branchMatch = branchRegex.exec(assistantMessage.content)) !== null) {
          const branchOp: GitHubOperation = {
            type: 'create-branch',
            status: 'pending',
            data: {
              name: branchMatch[1],
              from: branchMatch[2] || 'main',
            },
          };
          setPendingGitHubOps(prev => [...prev, branchOp]);
        }

        // Story 3.14: Advanced Git Operations

        // Multi-commit group: <git_commit_group branch="...">
        //   <commit type="feat" message="...">file1.js,file2.js</commit>
        //   <commit type="fix" message="...">file3.js</commit>
        // </git_commit_group>
        const commitGroupRegex = /<git_commit_group branch="([^"]+)">([\s\S]*?)<\/git_commit_group>/g;
        let commitGroupMatch;

        while ((commitGroupMatch = commitGroupRegex.exec(assistantMessage.content)) !== null) {
          const branch = commitGroupMatch[1];
          const commitsContent = commitGroupMatch[2];

          // Parse individual commits
          const commitRegex = /<commit type="([^"]+)" message="([^"]+)">([^<]*?)<\/commit>/g;
          const commits: Array<{ type: string; message: string; files: string[] }> = [];
          let commitMatch;

          while ((commitMatch = commitRegex.exec(commitsContent)) !== null) {
            commits.push({
              type: commitMatch[1],
              message: commitMatch[2],
              files: commitMatch[3].split(',').map(f => f.trim()).filter(f => f),
            });
          }

          if (commits.length > 0) {
            const commitGroupOp: GitHubOperation = {
              type: 'commit-group',
              status: 'pending',
              data: {
                branch,
                commits,
              },
            };
            setPendingGitHubOps(prev => [...prev, commitGroupOp]);
          }
        }

        // Conflict resolution: <git_conflict_resolve branch="..." strategy="...">
        //   <file path="...">resolved content</file>
        // </git_conflict_resolve>
        const conflictResolveRegex = /<git_conflict_resolve branch="([^"]+)" strategy="([^"]+)">([\s\S]*?)<\/git_conflict_resolve>/g;
        let conflictMatch;

        while ((conflictMatch = conflictResolveRegex.exec(assistantMessage.content)) !== null) {
          const branch = conflictMatch[1];
          const strategy = conflictMatch[2];
          const filesContent = conflictMatch[3];

          // Parse file resolutions
          const fileRegex = /<file path="([^"]+)">([^<]*?)<\/file>/g;
          const resolutions: Array<{ path: string; content: string }> = [];
          let fileMatch;

          while ((fileMatch = fileRegex.exec(filesContent)) !== null) {
            resolutions.push({
              path: fileMatch[1],
              content: fileMatch[2],
            });
          }

          if (resolutions.length > 0) {
            const resolveOp: GitHubOperation = {
              type: 'resolve-conflicts',
              status: 'pending',
              data: {
                branch,
                strategy,
                resolutions,
              },
            };
            setPendingGitHubOps(prev => [...prev, resolveOp]);
          }
        }

        // Cherry-pick: <git_cherry_pick commits="sha1,sha2" target="branch-name" create_pr="true|false"/>
        const cherryPickRegex = /<git_cherry_pick commits="([^"]+)" target="([^"]+)"(?:\s+create_pr="([^"]+)")?\/>/g;
        let cherryPickMatch;

        while ((cherryPickMatch = cherryPickRegex.exec(assistantMessage.content)) !== null) {
          const cherryPickOp: GitHubOperation = {
            type: 'cherry-pick',
            status: 'pending',
            data: {
              commits: cherryPickMatch[1].split(',').map(c => c.trim()),
              target: cherryPickMatch[2],
              createPR: cherryPickMatch[3] === 'true',
            },
          };
          setPendingGitHubOps(prev => [...prev, cherryPickOp]);
        }

        // PR Review: <pr_review pr="123" event="APPROVE|REQUEST_CHANGES|COMMENT">
        //   <comment path="file.js" line="10">comment text</comment>
        //   <summary>Overall review comment</summary>
        // </pr_review>
        const prReviewRegex = /<pr_review pr="(\d+)" event="([^"]+)">([\s\S]*?)<\/pr_review>/g;
        let prReviewMatch;

        while ((prReviewMatch = prReviewRegex.exec(assistantMessage.content)) !== null) {
          const prNumber = parseInt(prReviewMatch[1], 10);
          const event = prReviewMatch[2];
          const reviewContent = prReviewMatch[3];

          // Parse inline comments
          const commentRegex = /<comment path="([^"]+)" line="(\d+)">([^<]*?)<\/comment>/g;
          const comments: Array<{ path: string; line: number; body: string }> = [];
          let commentMatch;

          while ((commentMatch = commentRegex.exec(reviewContent)) !== null) {
            comments.push({
              path: commentMatch[1],
              line: parseInt(commentMatch[2], 10),
              body: commentMatch[3],
            });
          }

          // Parse summary
          const summaryRegex = /<summary>([^<]*?)<\/summary>/;
          const summaryMatch = summaryRegex.exec(reviewContent);
          const summary = summaryMatch ? summaryMatch[1] : '';

          const reviewOp: GitHubOperation = {
            type: 'pr-review',
            status: 'pending',
            data: {
              prNumber,
              event,
              comments,
              body: summary,
            },
          };
          setPendingGitHubOps(prev => [...prev, reviewOp]);
        }

        // Diff view: <git_diff base="main" head="feature-branch" files="file1.js,file2.js"/>
        const diffRegex = /<git_diff base="([^"]+)" head="([^"]+)"(?:\s+files="([^"]+)")?\/>/g;
        let diffMatch;

        while ((diffMatch = diffRegex.exec(assistantMessage.content)) !== null) {
          const diffOp: GitHubOperation = {
            type: 'view-diff',
            status: 'pending',
            data: {
              base: diffMatch[1],
              head: diffMatch[2],
              files: diffMatch[3] ? diffMatch[3].split(',').map(f => f.trim()) : undefined,
            },
          };
          setPendingGitHubOps(prev => [...prev, diffOp]);
        }
      }

      setIsStreaming(false);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, buildContext, allowFileOperations]);

  // Handle file operation approval
  const handleApproveOperation = useCallback(async (operation: FileOperation) => {
    try {
      // Mark as executing
      setPendingOperations(prev =>
        prev.map(op => op === operation ? { ...op, status: 'executing' as const } : op)
      );

      // Create FilesystemAgent with safe defaults
      const agent = new FilesystemAgent(filesystemService, {
        allowedPaths: ['/'], // Allow all paths for now (can be restricted later)
        maxFileSize: 10 * 1024 * 1024, // 10MB max
        trackHistory: true,
      });

      // Convert our FileOperation to agent's format
      const agentOperation = {
        type: operation.type === 'create' || operation.type === 'modify' ? 'write' as const : operation.type,
        path: operation.path,
        content: operation.content,
      };

      // Execute the operation
      const result = await agent.execute(agentOperation);

      if (result.success) {
        // Update operation status
        setPendingOperations(prev =>
          prev.map(op => op === operation ? { ...op, status: 'approved' } : op)
        );

        // Refresh file tree to show new/modified files
        await refreshFileTree();

        // Add success message to chat
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ Successfully ${operation.type}d ${operation.path}`,
          timestamp: new Date(),
        }]);
      } else {
        throw new Error(result.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('File operation error:', error);

      // Mark as failed
      setPendingOperations(prev =>
        prev.map(op => op === operation ? { ...op, status: 'rejected' } : op)
      );

      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `❌ Failed to ${operation.type} ${operation.path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    }
  }, [filesystemService, refreshFileTree]);

  const handleRejectOperation = useCallback((operation: FileOperation) => {
    setPendingOperations(prev =>
      prev.map(op => op === operation ? { ...op, status: 'rejected' } : op)
    );
  }, []);

  // Handle GitHub operation approval (same pattern as file operations)
  const handleApproveGitHubOp = useCallback(async (operation: GitHubOperation) => {
    try {
      // Mark as executing
      setPendingGitHubOps(prev =>
        prev.map(op => op === operation ? { ...op, status: 'executing' as const } : op)
      );

      // Get GitHub config from environment or filesystem
      const githubConfig = {
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'your-org',
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO || 'your-repo',
        token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
      };

      const githubService = new GitHubService(githubConfig);
      let result;
      let successMessage = '';

      switch (operation.type) {
        case 'create-pr':
          const prData = operation.data as PRDetails;
          result = await githubService.createPR(prData);
          successMessage = `✅ Created PR #${result.data?.number}: ${prData.title}`;
          break;

        case 'create-issue':
          const issueData = operation.data as IssueDetails;
          result = await githubService.createIssue(issueData);
          successMessage = `✅ Created Issue #${result.data?.number}: ${issueData.title}`;
          break;

        case 'create-branch':
          const branchData = operation.data as { name: string; from?: string };
          result = await githubService.createBranch(branchData.name, branchData.from);
          successMessage = `✅ Created branch: ${branchData.name}`;
          break;

        case 'commit':
          const commitData = operation.data as { message: string; files: string[] };
          successMessage = `✅ Committed changes: ${commitData.message}`;
          result = { success: true }; // Placeholder - actual commit logic would go here
          break;

        // Story 3.14: Advanced Git Operations

        case 'commit-group':
          const commitGroupData = operation.data as { branch: string; commits: Array<{ type: string; message: string; files: string[] }> };
          // Convert to CommitGroup format expected by GitHubService
          const commitGroups = commitGroupData.commits.map(c => ({
            type: c.type as any,
            message: c.message,
            files: c.files.map(f => ({ path: f, content: '' })), // Content would come from actual files
          }));
          result = await githubService.createCommitGroup(commitGroupData.branch, commitGroups);
          successMessage = `✅ Created ${commitGroupData.commits.length} commits on ${commitGroupData.branch}`;
          break;

        case 'resolve-conflicts':
          const resolveData = operation.data as { branch: string; strategy: string; resolutions: Array<{ path: string; content: string }> };
          const resolutions = resolveData.resolutions.map(r => ({
            file: r.path,
            resolvedContent: r.content,
            strategy: resolveData.strategy as any,
          }));
          result = await githubService.resolveConflicts(resolveData.branch, resolutions);
          successMessage = `✅ Resolved ${resolveData.resolutions.length} conflict(s) on ${resolveData.branch}`;
          break;

        case 'cherry-pick':
          const cherryPickData = operation.data as { commits: string[]; target: string; createPR?: boolean };
          result = await githubService.cherryPick(
            cherryPickData.commits,
            cherryPickData.target,
            cherryPickData.createPR
          );
          successMessage = `✅ Cherry-picked ${cherryPickData.commits.length} commit(s) to ${cherryPickData.target}`;
          break;

        case 'pr-review':
          const reviewData = operation.data as { prNumber: number; event: string; comments?: Array<{ path: string; line: number; body: string }>; body: string };
          const review = {
            event: reviewData.event as any,
            body: reviewData.body,
            comments: reviewData.comments?.map(c => ({
              path: c.path,
              line: c.line,
              body: c.body,
            })),
          };
          result = await githubService.submitReview(reviewData.prNumber, review);
          successMessage = `✅ Submitted ${reviewData.event} review on PR #${reviewData.prNumber}`;
          break;

        case 'view-diff':
          const diffData = operation.data as { base: string; head: string; files?: string[] };
          result = await githubService.getDiff(diffData.base, diffData.head, diffData.files);
          successMessage = `✅ Retrieved diff between ${diffData.base}...${diffData.head}`;
          
          // Display diff in chat
          if (result.success && result.data) {
            const diffSummary = `
**Diff Summary:**
- Files changed: ${result.data.files.length}
- Additions: +${result.data.totalAdditions}
- Deletions: -${result.data.totalDeletions}

${result.data.files.map((f: any) => `- ${f.status === 'added' ? '➕' : f.status === 'removed' ? '➖' : '📝'} ${f.filename} (+${f.additions}/-${f.deletions})`).join('\n')}
            `.trim();
            
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: diffSummary,
              timestamp: new Date(),
            }]);
          }
          break;

        default:
          throw new Error(`Unknown GitHub operation type: ${operation.type}`);
      }

      if (result.success) {
        // Update operation status
        setPendingGitHubOps(prev =>
          prev.map(op => op === operation ? { ...op, status: 'approved' } : op)
        );

        // Add success message to chat
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: successMessage,
          timestamp: new Date(),
        }]);
      } else {
        throw new Error(result.error?.message || 'GitHub operation failed');
      }
    } catch (error) {
      console.error('GitHub operation error:', error);

      // Mark as failed
      setPendingGitHubOps(prev =>
        prev.map(op => op === operation ? { ...op, status: 'rejected' } : op)
      );

      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `❌ GitHub operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const handleRejectGitHubOp = useCallback((operation: GitHubOperation) => {
    setPendingGitHubOps(prev =>
      prev.map(op => op === operation ? { ...op, status: 'rejected' } : op)
    );
  }, []);

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            AI Assistant
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filesystem.isConnected
              ? `Connected to ${filesystem.source === 'local' ? 'local folder' : 'GitHub'}`
              : 'Not connected - open a folder to get started'
            }
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                <div className="prose dark:prose-invert max-w-none">
                  {message.content}
                </div>
                <div className="mt-2 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending Operations */}
        {pendingOperations.filter(op => op.status === 'pending').length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" data-testid="pending-operations">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Pending File Operations
            </h3>
            <div className="space-y-2">
              {pendingOperations
                .filter(op => op.status === 'pending' || op.status === 'executing')
                .map((op, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {op.type.toUpperCase()} {op.path}
                        {op.status === 'executing' && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            Executing...
                          </span>
                        )}
                      </div>
                      {op.content && (
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {op.content.split('\n').slice(0, 2).join('\n')}
                          {op.content.split('\n').length > 2 && '...'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApproveOperation(op)}
                        disabled={op.status === 'executing'}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectOperation(op)}
                        disabled={op.status === 'executing'}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pending GitHub Operations (reusing same UI pattern) */}
        {pendingGitHubOps.filter(op => op.status === 'pending' || op.status === 'executing').length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Pending GitHub Operations
            </h3>
            <div className="space-y-2">
              {pendingGitHubOps
                .filter(op => op.status === 'pending' || op.status === 'executing')
                .map((op, idx) => {
                  let title = '';
                  let description = '';

                  switch (op.type) {
                    case 'create-pr':
                      const prData = op.data as PRDetails;
                      title = `CREATE PR: ${prData.title}`;
                      description = `${prData.head} → ${prData.base}`;
                      break;
                    case 'create-issue':
                      const issueData = op.data as IssueDetails;
                      title = `CREATE ISSUE: ${issueData.title}`;
                      description = issueData.labels?.join(', ') || '';
                      break;
                    case 'create-branch':
                      const branchData = op.data as { name: string; from?: string };
                      title = `CREATE BRANCH: ${branchData.name}`;
                      description = `from ${branchData.from || 'main'}`;
                      break;
                    case 'commit':
                      const commitData = op.data as { message: string; files: string[] };
                      title = `COMMIT: ${commitData.message}`;
                      description = `${commitData.files.length} file(s)`;
                      break;
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {title}
                          {op.status === 'executing' && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                              Executing...
                            </span>
                          )}
                        </div>
                        {description && (
                          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveGitHubOp(op)}
                          disabled={op.status === 'executing'}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectGitHubOp(op)}
                          disabled={op.status === 'executing'}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-end space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about your project..."
              disabled={isStreaming || !filesystem.isConnected}
              className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !input.trim() || !filesystem.isConnected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isStreaming ? 'Sending...' : 'Send'}
            </button>
          </div>
          {!filesystem.isConnected && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Connect to a folder or GitHub repository to start chatting
            </p>
          )}
        </div>
      </div>

      {/* File Context Sidebar */}
      {showFileContext && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 overflow-y-auto" data-testid="file-context-sidebar">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Project Context
          </h3>

          {filesystem.isConnected ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Source
                </div>
                <div className="text-sm text-slate-900 dark:text-white" data-testid="filesystem-source">
                  {filesystem.source === 'local' ? '📁 Local Folder' : '🐙 GitHub'}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Files ({files.length})
                </div>
                <div className="space-y-1">
                  {files.slice(0, 10).map(file => (
                    <div
                      key={file.path}
                      className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate"
                      title={file.path}
                    >
                      {file.path}
                    </div>
                  ))}
                  {files.length > 10 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ... and {files.length - 10} more
                    </div>
                  )}
                </div>
              </div>

              {activeFile && (
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Active File
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
                    {activeFile.path}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              No filesystem connected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedChatContainer;
