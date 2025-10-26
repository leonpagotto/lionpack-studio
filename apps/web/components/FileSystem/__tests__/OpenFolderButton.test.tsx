import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OpenFolderButton } from '../OpenFolderButton';

// Mock the useEditor hook
const mockOpenLocalFolder = jest.fn();
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
  openLocalFolder: mockOpenLocalFolder,
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

describe('OpenFolderButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
  });

  describe('Rendering', () => {
    it('should render with default text when not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());
      render(<OpenFolderButton />);
      expect(screen.getByText('Open Folder')).toBeInTheDocument();
    });

    it('should render folder name when connected to local filesystem', () => {
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
      render(<OpenFolderButton />);
      expect(screen.getByText('my-project')).toBeInTheDocument();
    });

    it('should render with different variants', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());

      const { rerender } = render(<OpenFolderButton variant="default" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');

      rerender(<OpenFolderButton variant="outline" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should render with different sizes', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());

      const { rerender } = render(<OpenFolderButton size="sm" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('px-2');

      rerender(<OpenFolderButton size="lg" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
    });
  });

  describe('Interactions', () => {
    it('should call openLocalFolder when clicked', async () => {
      mockOpenLocalFolder.mockResolvedValue(undefined);
      mockUseEditor.mockReturnValue(createMockEditorContext());

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOpenLocalFolder).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state while opening folder', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOpenLocalFolder.mockReturnValue(promise);
      mockUseEditor.mockReturnValue(createMockEditorContext());

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Opening...')).toBeInTheDocument();
      });

      resolvePromise!();
    });

    it('should be disabled while loading', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOpenLocalFolder.mockReturnValue(promise);
      mockUseEditor.mockReturnValue(createMockEditorContext());

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      resolvePromise!();
    });
  });

  describe('Error Handling', () => {
    it('should display error when filesystem has error', () => {
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

      render(<OpenFolderButton />);
      expect(screen.getByText('Permission denied. Please grant access to the folder.')).toBeInTheDocument();
    });

    it('should display generic error message for unknown errors', () => {
      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          filesystem: {
            source: null,
            sourceInfo: null,
            isConnected: false,
            error: {
              code: 'UNKNOWN',
              message: 'Something went wrong',
            },
          },
        })
      );

      render(<OpenFolderButton />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should show folder icon when not connected', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show open folder icon when connected', () => {
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

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate title attribute', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext());

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Open a local folder');
    });

    it('should have title with folder name when connected', () => {
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

      render(<OpenFolderButton />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Connected to: my-project');
    });
  });
});
