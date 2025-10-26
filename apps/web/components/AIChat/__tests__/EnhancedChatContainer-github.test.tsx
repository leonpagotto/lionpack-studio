import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedChatContainer } from '../EnhancedChatContainer';
import type { GitHubOperation } from '../EnhancedChatContainer';

// Mock the useEditor hook
const mockUseEditor = jest.fn();

jest.mock('../../../context/EditorContext', () => ({
  useEditor: () => mockUseEditor(),
}));

// Mock GitHubService
const mockCreatePR = jest.fn();
const mockCreateIssue = jest.fn();
const mockCreateBranch = jest.fn();

jest.mock('@lionpack/leo-client', () => ({
  FilesystemAgent: jest.fn(),
  GitHubService: jest.fn().mockImplementation(() => ({
    createPR: mockCreatePR,
    createIssue: mockCreateIssue,
    createBranch: mockCreateBranch,
  })),
}));

// Mock fetch for streaming responses
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const createMockEditorContext = (overrides = {}) => ({
  files: [
    { path: '/src/index.ts', content: 'console.log("hello");', language: 'typescript' },
  ],
  activeFile: null,
  testOutput: [],
  testResults: null,
  isGenerating: false,
  filesystem: {
    source: 'local' as const,
    sourceInfo: {
      type: 'local' as const,
      connected: true,
      displayName: 'my-project',
      config: { rootPath: '/Users/test/my-project' },
    },
    isConnected: true,
    error: null,
  },
  filesystemService: {} as any,
  setFiles: jest.fn(),
  selectFile: jest.fn(),
  addTestOutput: jest.fn(),
  setTestResults: jest.fn(),
  setIsGenerating: jest.fn(),
  reset: jest.fn(),
  openLocalFolder: jest.fn(),
  connectGitHub: jest.fn(),
  disconnectFilesystem: jest.fn(),
  loadFile: jest.fn(),
  saveFile: jest.fn(),
  createNewFile: jest.fn(),
  deleteFile: jest.fn(),
  renameFile: jest.fn(),
  refreshFileTree: jest.fn(),
  ...overrides,
});

describe('EnhancedChatContainer - GitHub Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
    (global.fetch as jest.Mock).mockReset();
    mockCreatePR.mockReset();
    mockCreateIssue.mockReset();
    mockCreateBranch.mockReset();
  });

  describe('GitHub Operation Parsing', () => {
    it('should parse PR creation tags from AI response', async () => {
      const aiResponseWithPR = `I'll create a pull request for you.

<github_pr title="feat: Add new feature" base="main" head="feature-branch">
This PR adds the new feature we discussed.

Changes:
- Added feature X
- Updated documentation
</github_pr>

The PR has been prepared. Please review and approve.`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithPR),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create a PR for the new feature' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE PR: feat: Add new feature/)).toBeInTheDocument();
      });

      expect(screen.getByText(/feature-branch → main/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    });

    it('should parse issue creation tags from AI response', async () => {
      const aiResponseWithIssue = `I'll create an issue for this bug.

<github_issue title="Bug: Login fails on mobile" labels="bug,priority-high">
The login button doesn't work on mobile devices.

Steps to reproduce:
1. Open app on mobile
2. Try to login
3. Nothing happens

Expected: User should be logged in
Actual: No response
</github_issue>

Issue created successfully.`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithIssue),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Report the login bug' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE ISSUE: Bug: Login fails on mobile/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Labels: bug, priority-high/)).toBeInTheDocument();
    });

    it('should parse branch creation tags from AI response', async () => {
      const aiResponseWithBranch = `I'll create a new branch for this feature.

<github_branch name="feature/github-integration" from="main"/>

Branch created successfully.`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithBranch),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create a new feature branch' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE BRANCH: feature\/github-integration/)).toBeInTheDocument();
      });

      expect(screen.getByText(/From: main/)).toBeInTheDocument();
    });

    it('should parse multiple GitHub operations in one response', async () => {
      const aiResponseWithMultiple = `I'll set this up for you.

<github_branch name="feature/new-feature" from="main"/>

<github_issue title="Task: Implement new feature" labels="enhancement">
Track the implementation of the new feature.
</github_issue>

Both created successfully.`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithMultiple),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Setup new feature' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE BRANCH: feature\/new-feature/)).toBeInTheDocument();
        expect(screen.getByText(/CREATE ISSUE: Task: Implement new feature/)).toBeInTheDocument();
      });
    });
  });

  describe('GitHub Operation Approval Flow', () => {
    it('should execute PR creation on approval', async () => {
      mockCreatePR.mockResolvedValue({
        success: true,
        data: { number: 42, url: 'https://github.com/test/repo/pull/42', title: 'feat: Add feature' },
      });

      const aiResponseWithPR = `<github_pr title="feat: Add feature" base="main" head="feature">PR description</github_pr>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithPR),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create PR' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE PR: feat: Add feature/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockCreatePR).toHaveBeenCalledWith({
          title: 'feat: Add feature',
          body: 'PR description',
          base: 'main',
          head: 'feature',
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/✅ Created PR #42/)).toBeInTheDocument();
      });
    });

    it('should execute issue creation on approval', async () => {
      mockCreateIssue.mockResolvedValue({
        success: true,
        data: { number: 10, url: 'https://github.com/test/repo/issues/10', title: 'Bug: Fix issue' },
      });

      const aiResponseWithIssue = `<github_issue title="Bug: Fix issue" labels="bug">Issue description</github_issue>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithIssue),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create issue' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE ISSUE: Bug: Fix issue/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockCreateIssue).toHaveBeenCalledWith({
          title: 'Bug: Fix issue',
          body: 'Issue description',
          labels: ['bug'],
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/✅ Created Issue #10/)).toBeInTheDocument();
      });
    });

    it('should execute branch creation on approval', async () => {
      mockCreateBranch.mockResolvedValue({
        success: true,
        data: { name: 'feature/new', sha: 'abc123' },
      });

      const aiResponseWithBranch = `<github_branch name="feature/new" from="main"/>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithBranch),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create branch' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE BRANCH: feature\/new/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockCreateBranch).toHaveBeenCalledWith('feature/new', 'main');
      });

      await waitFor(() => {
        expect(screen.getByText(/✅ Created branch: feature\/new/)).toBeInTheDocument();
      });
    });

    it('should remove operation from pending list on rejection', async () => {
      const aiResponseWithPR = `<github_pr title="feat: Test" base="main" head="feature">Test PR</github_pr>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithPR),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create PR' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE PR: feat: Test/)).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.queryByText(/CREATE PR: feat: Test/)).not.toBeInTheDocument();
      });

      expect(mockCreatePR).not.toHaveBeenCalled();
    });
  });

  describe('GitHub Operation Error Handling', () => {
    it('should show error message when PR creation fails', async () => {
      mockCreatePR.mockResolvedValue({
        success: false,
        error: { message: 'GitHub API error: Rate limit exceeded' },
      });

      const aiResponseWithPR = `<github_pr title="feat: Test" base="main" head="feature">Test</github_pr>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithPR),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create PR' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE PR: feat: Test/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText(/❌ Failed to create PR: GitHub API error: Rate limit exceeded/)).toBeInTheDocument();
      });
    });

    it('should show error message when issue creation fails', async () => {
      mockCreateIssue.mockResolvedValue({
        success: false,
        error: { message: 'Permission denied' },
      });

      const aiResponseWithIssue = `<github_issue title="Test" labels="">Test</github_issue>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithIssue),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create issue' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE ISSUE: Test/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText(/❌ Failed to create issue: Permission denied/)).toBeInTheDocument();
      });
    });
  });

  describe('GitHub Operation UI States', () => {
    it('should disable buttons while operation is executing', async () => {
      mockCreatePR.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: { number: 42 } }), 100)
          )
      );

      const aiResponseWithPR = `<github_pr title="feat: Test" base="main" head="feature">Test</github_pr>`;

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(aiResponseWithPR),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      render(<EnhancedChatContainer />);

      const input = screen.getByPlaceholderText(/Ask me anything/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'Create PR' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/CREATE PR: feat: Test/)).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /Approve/i });
      const rejectButton = screen.getByRole('button', { name: /Reject/i });

      fireEvent.click(approveButton);

      // Buttons should be disabled while executing
      await waitFor(() => {
        expect(screen.getByText(/Executing.../)).toBeInTheDocument();
      });

      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });
});
