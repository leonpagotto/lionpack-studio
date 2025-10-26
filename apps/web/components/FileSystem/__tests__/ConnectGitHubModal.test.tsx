import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectGitHubModal } from '../ConnectGitHubModal';

// Mock the useEditor hook
const mockConnectGitHub = jest.fn();
const mockUseEditor = jest.fn();

jest.mock('../../../context/EditorContext', () => ({
  useEditor: () => mockUseEditor(),
}));

const createMockEditorContext = (overrides = {}) => ({
  files: [],
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
  connectGitHub: mockConnectGitHub,
  disconnectFilesystem: jest.fn(),
  loadFile: jest.fn(),
  saveFile: jest.fn(),
  createNewFile: jest.fn(),
  deleteFile: jest.fn(),
  renameFile: jest.fn(),
  refreshFileTree: jest.fn(),
  ...overrides,
});

describe('ConnectGitHubModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
  });

  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);
      expect(screen.getByText('Connect GitHub Repository')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      render(<ConnectGitHubModal open={false} onClose={mockOnClose} />);
      expect(screen.queryByText('Connect GitHub Repository')).not.toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/repository owner/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repository name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/branch/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/personal access token/i)).toBeInTheDocument();
    });

    it('should render OAuth button', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);
      const oauthButton = screen.getByRole('button', { name: /Sign in with GitHub/i });
      expect(oauthButton).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: '' }); // × button has no accessible name
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields on input', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const ownerInput = screen.getByLabelText(/repository owner/i) as HTMLInputElement;
      const repoInput = screen.getByLabelText(/repository name/i) as HTMLInputElement;
      const branchInput = screen.getByLabelText(/branch/i) as HTMLInputElement;
      const tokenInput = screen.getByLabelText(/personal access token/i) as HTMLInputElement;

      fireEvent.change(ownerInput, { target: { value: 'octocat' } });
      fireEvent.change(repoInput, { target: { value: 'Hello-World' } });
      fireEvent.change(branchInput, { target: { value: 'develop' } });
      fireEvent.change(tokenInput, { target: { value: 'ghp_test123' } });

      expect(ownerInput.value).toBe('octocat');
      expect(repoInput.value).toBe('Hello-World');
      expect(branchInput.value).toBe('develop');
      expect(tokenInput.value).toBe('ghp_test123');
    });

    it('should call onClose when close button clicked', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', () => {
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const backdrop = screen.getByText('Connect GitHub Repository').closest('div')?.parentElement;
      if (backdrop && backdrop.classList.contains('inset-0')) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Form Submission', () => {
    it('should call connectGitHub with form data on submit', async () => {
      mockConnectGitHub.mockResolvedValue(undefined);
      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const ownerInput = screen.getByLabelText(/repository owner/i);
      const repoInput = screen.getByLabelText(/repository name/i);
      const branchInput = screen.getByLabelText(/branch/i);
      const tokenInput = screen.getByLabelText(/personal access token/i);

      fireEvent.change(ownerInput, { target: { value: 'octocat' } });
      fireEvent.change(repoInput, { target: { value: 'Hello-World' } });
      fireEvent.change(branchInput, { target: { value: 'main' } });
      fireEvent.change(tokenInput, { target: { value: 'ghp_test123' } });

      const submitButton = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockConnectGitHub).toHaveBeenCalledWith({
          owner: 'octocat',
          repo: 'Hello-World',
          branch: 'main',
          token: 'ghp_test123',
        });
      });
    });

    it('should show loading state during submission', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockConnectGitHub.mockReturnValue(promise);

      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const ownerInput = screen.getByLabelText(/repository owner/i);
      const repoInput = screen.getByLabelText(/repository name/i);
      const tokenInput = screen.getByLabelText(/personal access token/i);

      fireEvent.change(ownerInput, { target: { value: 'octocat' } });
      fireEvent.change(repoInput, { target: { value: 'Hello-World' } });
      fireEvent.change(tokenInput, { target: { value: 'ghp_test123' } });

      const submitButton = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connecting/i)).toBeInTheDocument();
      });

      resolvePromise!();
    });
  });

  describe('Error Handling', () => {
    it('should display error from filesystem context', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: null,
            sourceInfo: null,
            isConnected: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Invalid token',
            },
          },
        })
      );

      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  describe('OAuth Flow', () => {
    it('should redirect to OAuth login on OAuth button click', () => {
      // Store original location
      const originalLocation = window.location;

      // Mock window.location.href setter
      delete (window as any).location;
      (window as any).location = { ...originalLocation, href: '' };
      Object.defineProperty(window.location, 'href', {
        writable: true,
        value: '',
      });

      render(<ConnectGitHubModal open={true} onClose={mockOnClose} />);

      const oauthButton = screen.getByRole('button', { name: /Sign in with GitHub/i });
      fireEvent.click(oauthButton);

      expect(window.location.href).toBe('/api/auth/github/login');

      // Restore original location
      (window as any).location = originalLocation;
    });
  });
});
