import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedChatContainer } from '../EnhancedChatContainer';
import type { FileOperation } from '../EnhancedChatContainer';

// Mock the useEditor hook
const mockUseEditor = jest.fn();

jest.mock('../../../context/EditorContext', () => ({
  useEditor: () => mockUseEditor(),
}));

// Mock fetch for streaming responses
global.fetch = jest.fn();

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();

const createMockEditorContext = (overrides = {}) => ({
  files: [
    { path: '/src/index.ts', content: 'console.log("hello");', language: 'typescript' },
    { path: '/package.json', content: '{"name": "test"}', language: 'json' },
  ],
  activeFile: null,
  testOutput: [],
  testResults: null,
  isGenerating: false,
  filesystem: {
    source: null as 'local' | 'github' | null,
    sourceInfo: null,
    isConnected: false,
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

describe('EnhancedChatContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Offline State', () => {
    it('should show welcome message when filesystem not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<EnhancedChatContainer />);

      expect(screen.getByText(/Not connected - open a folder to get started/)).toBeInTheDocument();
    });

    it('should disable input when filesystem not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      expect(textarea).toBeDisabled();
    });

    it('should disable send button when filesystem not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<EnhancedChatContainer />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Connected State - Local', () => {
    const localContext = createMockEditorContext({
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
    });

    it('should show enabled input when connected to local filesystem', () => {
      mockUseEditor.mockReturnValue(localContext);
      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      expect(textarea).not.toBeDisabled();
    });

    it('should display project context in sidebar', () => {
      mockUseEditor.mockReturnValue(localContext);
      render(<EnhancedChatContainer showFileContext={true} />);

      expect(screen.getByText(/Filesystem: local/)).toBeInTheDocument();
      expect(screen.getByText(/Local Path:/)).toBeInTheDocument();
      expect(screen.getByText(/\/Users\/test\/my-project/)).toBeInTheDocument();
    });

    it('should list project files in sidebar', () => {
      mockUseEditor.mockReturnValue(localContext);
      render(<EnhancedChatContainer showFileContext={true} />);

      expect(screen.getByText('/src/index.ts')).toBeInTheDocument();
      expect(screen.getByText('/package.json')).toBeInTheDocument();
    });

    it('should show active file indicator', () => {
      const contextWithActiveFile = createMockEditorContext({
        ...localContext,
        activeFile: { path: '/src/index.ts', content: 'console.log("hello");', language: 'typescript' },
      });
      mockUseEditor.mockReturnValue(contextWithActiveFile);
      render(<EnhancedChatContainer showFileContext={true} />);

      const activeFileElement = screen.getByText('/src/index.ts');
      expect(activeFileElement).toHaveClass('font-bold');
    });
  });

  describe('Connected State - GitHub', () => {
    const githubContext = createMockEditorContext({
      filesystem: {
        source: 'github' as const,
        sourceInfo: {
          type: 'github' as const,
          connected: true,
          displayName: 'octocat/Hello-World',
          config: {
            owner: 'octocat',
            repo: 'Hello-World',
            branch: 'main',
          },
        },
        isConnected: true,
        error: null,
      },
    });

    it('should display GitHub repository info in sidebar', () => {
      mockUseEditor.mockReturnValue(githubContext);
      render(<EnhancedChatContainer showFileContext={true} />);

      expect(screen.getByText(/Filesystem: github/)).toBeInTheDocument();
      expect(screen.getByText(/Repository: octocat\/Hello-World/)).toBeInTheDocument();
      expect(screen.getByText(/Branch: main/)).toBeInTheDocument();
    });

    it('should enable chat when connected to GitHub', () => {
      mockUseEditor.mockReturnValue(githubContext);
      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('Message Sending', () => {
    const connectedContext = createMockEditorContext({
      filesystem: {
        source: 'local' as const,
        sourceInfo: {
          type: 'local' as const,
          connected: true,
          displayName: 'test-project',
          config: { rootPath: '/test' },
        },
        isConnected: true,
        error: null,
      },
    });

    it('should disable send button when input is empty', () => {
      mockUseEditor.mockReturnValue(connectedContext);
      render(<EnhancedChatContainer />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has content', () => {
      mockUseEditor.mockReturnValue(connectedContext);
      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Hello AI' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });

    it('should add user message when send clicked', async () => {
      mockUseEditor.mockReturnValue(connectedContext);
      
      // Mock successful fetch response
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"content":"Hello"}\n\n') })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should call API with project context', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const mockReader = {
        read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'What files are in this project?' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      
      // Should include system message with context
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[0].content).toContain('Filesystem: local');
      expect(body.messages[0].content).toContain('/src/index.ts');
    });

    it('should clear input after sending', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const mockReader = {
        read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test' } });
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Streaming Responses', () => {
    const connectedContext = createMockEditorContext({
      filesystem: {
        source: 'local' as const,
        sourceInfo: {
          type: 'local' as const,
          connected: true,
          displayName: 'test-project',
          config: { rootPath: '/test' },
        },
        isConnected: true,
        error: null,
      },
    });

    it('should display streamed AI response', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode('data: {"content":"Hello "}\n\n') 
          })
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode('data: {"content":"World"}\n\n') 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Hi' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/Hello World/)).toBeInTheDocument();
      });
    });

    it('should handle streaming errors gracefully', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EnhancedChatContainer />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to send message/)).toBeInTheDocument();
      });
    });
  });

  describe('File Operations', () => {
    const connectedContext = createMockEditorContext({
      filesystem: {
        source: 'local' as const,
        sourceInfo: {
          type: 'local' as const,
          connected: true,
          displayName: 'test-project',
          config: { rootPath: '/test' },
        },
        isConnected: true,
        error: null,
      },
    });

    it('should parse file operations from AI response', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const responseWithFileOp = `
Here's a new component:

<file_operation type="create" path="/src/Button.tsx">
const Button = () => <button>Click me</button>;
export default Button;
</file_operation>
      `;

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode(`data: {"content":"${responseWithFileOp}"}\n\n`) 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer allowFileOperations={true} />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Create a button component' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/File Operations/)).toBeInTheDocument();
        expect(screen.getByText('/src/Button.tsx')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      });
    });

    it('should not show file operations when allowFileOperations is false', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const responseWithFileOp = '<file_operation type="create" path="/test.ts">code</file_operation>';

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode(`data: {"content":"${responseWithFileOp}"}\n\n`) 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer allowFileOperations={false} />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.queryByText(/File Operations/)).not.toBeInTheDocument();
      });
    });

    it('should remove operation when rejected', async () => {
      mockUseEditor.mockReturnValue(connectedContext);

      const responseWithFileOp = '<file_operation type="create" path="/test.ts">code</file_operation>';

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode(`data: {"content":"${responseWithFileOp}"}\n\n`) 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      render(<EnhancedChatContainer allowFileOperations={true} />);

      const textarea = screen.getByPlaceholderText(/Ask me anything about your project/);
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.queryByText(/File Operations/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Visibility', () => {
    const connectedContext = createMockEditorContext({
      filesystem: {
        source: 'local' as const,
        sourceInfo: {
          type: 'local' as const,
          connected: true,
          displayName: 'test-project',
          config: { rootPath: '/test' },
        },
        isConnected: true,
        error: null,
      },
    });

    it('should show sidebar when showFileContext is true', () => {
      mockUseEditor.mockReturnValue(connectedContext);
      render(<EnhancedChatContainer showFileContext={true} />);

      expect(screen.getByText(/Project Context/)).toBeInTheDocument();
    });

    it('should hide sidebar when showFileContext is false', () => {
      mockUseEditor.mockReturnValue(connectedContext);
      render(<EnhancedChatContainer showFileContext={false} />);

      expect(screen.queryByText(/Project Context/)).not.toBeInTheDocument();
    });
  });
});
