import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilesystemStatus } from '../FilesystemStatus';

// Mock the useEditor hook
const mockDisconnectFilesystem = jest.fn();
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
  connectGitHub: jest.fn(),
  disconnectFilesystem: mockDisconnectFilesystem,
  loadFile: jest.fn(),
  saveFile: jest.fn(),
  createNewFile: jest.fn(),
  deleteFile: jest.fn(),
  renameFile: jest.fn(),
  refreshFileTree: jest.fn(),
  ...overrides,
});

describe('FilesystemStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
  });

  describe('Offline State', () => {
    it('should display offline status when not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<FilesystemStatus />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should show offline icon when not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<FilesystemStatus />);

      const badge = screen.getByText('Offline');
      expect(badge).toHaveClass('bg-gray-100');
    });

    it('should not show disconnect button by default when offline', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<FilesystemStatus />);

      expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument();
    });
  });

  describe('Local Filesystem', () => {
    it('should display local status when connected to local filesystem', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'local',
            sourceInfo: {
              type: 'local',
              connected: true,
              displayName: 'my-project',
              config: {},
            },
            isConnected: true,
            error: null,
          },
        })
      );

      render(<FilesystemStatus />);
      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByText('my-project')).toBeInTheDocument();
    });

    it('should show folder icon for local filesystem', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'local',
            sourceInfo: {
              type: 'local',
              connected: true,
              displayName: 'my-project',
              config: {},
            },
            isConnected: true,
            error: null,
          },
        })
      );

      render(<FilesystemStatus />);
      const badge = screen.getByText('Local');
      expect(badge).toHaveClass('bg-blue-100');
    });

    it('should show disconnect button when showDisconnect is true', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'local',
            sourceInfo: {
              type: 'local',
              connected: true,
              displayName: 'my-project',
              config: {},
            },
            isConnected: true,
            error: null,
          },
        })
      );

      render(<FilesystemStatus showDisconnect={true} />);
      expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    });

    it('should call disconnectFilesystem when disconnect button clicked', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'local',
            sourceInfo: {
              type: 'local',
              connected: true,
              displayName: 'my-project',
              config: {},
            },
            isConnected: true,
            error: null,
          },
        })
      );

      render(<FilesystemStatus showDisconnect={true} />);
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      fireEvent.click(disconnectButton);

      expect(mockDisconnectFilesystem).toHaveBeenCalledTimes(1);
    });
  });

  describe('GitHub Filesystem', () => {
    it('should display GitHub status when connected to GitHub', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'github',
            sourceInfo: {
              type: 'github',
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
        })
      );

      render(<FilesystemStatus />);
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('should show repository details for GitHub', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'github',
            sourceInfo: {
              type: 'github',
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
        })
      );

      render(<FilesystemStatus />);
      expect(screen.getByText('octocat/Hello-World')).toBeInTheDocument();
      expect(screen.getByText(/octocat\/Hello-World \(main\)/)).toBeInTheDocument();
    });    it('should show GitHub icon for GitHub filesystem', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'github',
            sourceInfo: {
              type: 'github',
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
        })
      );

      render(<FilesystemStatus />);
      const badge = screen.getByText('GitHub');
      expect(badge).toHaveClass('bg-purple-100');
    });

    it('should truncate long repository names', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: 'github',
            sourceInfo: {
              type: 'github',
              connected: true,
              displayName: 'very-long-organization-name/very-long-repository-name-that-should-be-truncated',
              config: {
                owner: 'very-long-organization-name',
                repo: 'very-long-repository-name-that-should-be-truncated',
                branch: 'main',
              },
            },
            isConnected: true,
            error: null,
          },
        })
      );

      render(<FilesystemStatus />);
      const repoNames = screen.getAllByText(/very-long-organization-name/);
      // Both the displayName and the details should have truncate class
      expect(repoNames.length).toBeGreaterThan(0);
      repoNames.forEach(elem => {
        expect(elem).toHaveClass('truncate');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error indicator when error exists', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: null,
            sourceInfo: null,
            isConnected: false,
            error: {
              code: 'CONNECTION_FAILED',
              message: 'Failed to connect',
            },
          },
        })
      );

      render(<FilesystemStatus />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByTitle('Failed to connect')).toBeInTheDocument();
    });

    it('should show error with offline status', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: null,
            sourceInfo: null,
            isConnected: false,
            error: {
              code: 'EACCES',
              message: 'Permission denied',
            },
          },
        })
      );

      render(<FilesystemStatus />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByTitle('Permission denied')).toBeInTheDocument();
    });
  });  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      const { container } = render(<FilesystemStatus className="custom-class" />);

      const statusElement = container.querySelector('.custom-class');
      expect(statusElement).toBeInTheDocument();
    });
  });
});
