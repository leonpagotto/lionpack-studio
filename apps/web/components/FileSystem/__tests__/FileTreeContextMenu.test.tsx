import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileTreeContextMenu } from '../FileTreeContextMenu';
import type { EditorContextType, GeneratedFile } from '../../../context/EditorContext';

// Mock EditorContext
const mockCreateNewFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockRenameFile = jest.fn();
const mockUseEditor = jest.fn();

jest.mock('../../../context/EditorContext', () => ({
  useEditor: () => mockUseEditor(),
}));

function createMockEditorContext(
  overrides?: Partial<EditorContextType>
): EditorContextType {
  return {
    files: [],
    activeFile: null,
    testOutput: [],
    testResults: null,
    isGenerating: false,
    filesystem: {
      source: null,
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
    createNewFile: mockCreateNewFile,
    deleteFile: mockDeleteFile,
    renameFile: mockRenameFile,
    refreshFileTree: jest.fn(),
    ...overrides,
  };
}

function createMockFile(overrides?: Partial<GeneratedFile>): GeneratedFile {
  return {
    path: 'src/test.ts',
    content: 'test content',
    language: 'typescript',
    ...overrides,
  };
}

describe('FileTreeContextMenu', () => {
  const mockOnClose = jest.fn();
  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());

    // Mock window functions
    global.prompt = jest.fn();
    global.confirm = jest.fn();
    global.alert = jest.fn();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render context menu at specified position', () => {
      const file = createMockFile();
      const { container } = render(
        <FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />
      );

      const menu = container.querySelector('[style*="left: 100px"]');
      expect(menu).toBeInTheDocument();
    });

    it('should display all menu items', () => {
      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      expect(screen.getByText('New File')).toBeInTheDocument();
      expect(screen.getByText('New Folder')).toBeInTheDocument();
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Copy Path')).toBeInTheDocument();
    });

    it('should show separators between menu sections', () => {
      const file = createMockFile();
      const { container } = render(
        <FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />
      );

      const separators = container.querySelectorAll('.h-px');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should apply danger styling to delete button', () => {
      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      const deleteButton = screen.getByText('Delete').closest('button');
      expect(deleteButton).toHaveClass('text-red-600');
    });
  });

  describe('New File Action', () => {
    it('should create new file in same directory as selected file', async () => {
      (global.prompt as jest.Mock).mockReturnValue('newfile.ts');
      mockCreateNewFile.mockResolvedValue(undefined);

      const file = createMockFile({ path: 'src/components/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(mockCreateNewFile).toHaveBeenCalledWith('src/components/newfile.ts', '// New file\n');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should create new file in root when file is in root', async () => {
      (global.prompt as jest.Mock).mockReturnValue('root.ts');
      mockCreateNewFile.mockResolvedValue(undefined);

      const file = createMockFile({ path: 'test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(mockCreateNewFile).toHaveBeenCalledWith('root.ts', '// New file\n');
      });
    });

    it('should create new file in directory when directory selected', async () => {
      (global.prompt as jest.Mock).mockReturnValue('file.ts');
      mockCreateNewFile.mockResolvedValue(undefined);

      const directory = createMockFile({ path: 'src/components', language: 'directory' });
      render(<FileTreeContextMenu file={directory} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(mockCreateNewFile).toHaveBeenCalledWith('src/components/file.ts', '// New file\n');
      });
    });

    it('should not create file when prompt is cancelled', async () => {
      (global.prompt as jest.Mock).mockReturnValue(null);

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(mockCreateNewFile).not.toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show alert when file creation fails', async () => {
      (global.prompt as jest.Mock).mockReturnValue('newfile.ts');
      mockCreateNewFile.mockRejectedValue(new Error('Permission denied'));

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to create file. Please try again.');
      });
    });
  });

  describe('New Folder Action', () => {
    it('should create new folder with .gitkeep file', async () => {
      (global.prompt as jest.Mock).mockReturnValue('newfolder');
      mockCreateNewFile.mockResolvedValue(undefined);

      const file = createMockFile({ path: 'src/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New Folder'));

      await waitFor(() => {
        expect(mockCreateNewFile).toHaveBeenCalledWith('src/newfolder/.gitkeep', '');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not create folder when prompt is cancelled', async () => {
      (global.prompt as jest.Mock).mockReturnValue(null);

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New Folder'));

      await waitFor(() => {
        expect(mockCreateNewFile).not.toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show alert when folder creation fails', async () => {
      (global.prompt as jest.Mock).mockReturnValue('newfolder');
      mockCreateNewFile.mockRejectedValue(new Error('Permission denied'));

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New Folder'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to create folder. Please try again.');
      });
    });
  });

  describe('Rename Action', () => {
    it('should rename file with new name', async () => {
      (global.prompt as jest.Mock).mockReturnValue('renamed.ts');
      mockRenameFile.mockResolvedValue(undefined);

      const file = createMockFile({ path: 'src/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Rename'));

      await waitFor(() => {
        expect(mockRenameFile).toHaveBeenCalledWith('src/test.tsx', 'src/renamed.ts');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show current filename in rename prompt', async () => {
      const file = createMockFile({ path: 'src/components/Button.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Rename'));

      expect(global.prompt).toHaveBeenCalledWith('Enter new name:', 'Button.tsx');
    });

    it('should not rename when new name is same as current', async () => {
      (global.prompt as jest.Mock).mockReturnValue('test.tsx');

      const file = createMockFile({ path: 'src/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Rename'));

      await waitFor(() => {
        expect(mockRenameFile).not.toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not rename when prompt is cancelled', async () => {
      (global.prompt as jest.Mock).mockReturnValue(null);

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Rename'));

      await waitFor(() => {
        expect(mockRenameFile).not.toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show alert when rename fails', async () => {
      (global.prompt as jest.Mock).mockReturnValue('renamed.ts');
      mockRenameFile.mockRejectedValue(new Error('Permission denied'));

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Rename'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to rename. Please try again.');
      });
    });
  });

  describe('Delete Action', () => {
    it('should delete file after confirmation', async () => {
      (global.confirm as jest.Mock).mockReturnValue(true);
      mockDeleteFile.mockResolvedValue(undefined);

      const file = createMockFile({ path: 'src/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockDeleteFile).toHaveBeenCalledWith('src/test.tsx');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show different confirmation message for directory', async () => {
      (global.confirm as jest.Mock).mockReturnValue(true);
      mockDeleteFile.mockResolvedValue(undefined);

      const directory = createMockFile({ path: 'src/components', language: 'directory' });
      render(<FileTreeContextMenu file={directory} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Delete'));

      expect(global.confirm).toHaveBeenCalledWith('Delete folder "src/components" and all its contents?');
    });

    it('should show file confirmation message for file', async () => {
      const file = createMockFile({ path: 'src/test.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Delete'));

      expect(global.confirm).toHaveBeenCalledWith('Delete file "src/test.tsx"?');
    });

    it('should not delete when confirmation is declined', async () => {
      (global.confirm as jest.Mock).mockReturnValue(false);

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show alert when delete fails', async () => {
      (global.confirm as jest.Mock).mockReturnValue(true);
      mockDeleteFile.mockRejectedValue(new Error('Permission denied'));

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to delete. Please try again.');
      });
    });
  });

  describe('Copy Path Action', () => {
    it('should copy file path to clipboard', async () => {
      const file = createMockFile({ path: 'src/components/Button.tsx' });
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Copy Path'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('src/components/Button.tsx');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show alert when clipboard write fails', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Copy Path'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to copy path to clipboard.');
      });
    });
  });

  describe('Close Behavior', () => {
    it('should close when clicking outside menu', async () => {
      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      // Click outside (on document body)
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not close when clicking inside menu', async () => {
      const file = createMockFile();
      const { container } = render(
        <FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />
      );

      const menu = container.querySelector('[style*="left: 100px"]') as HTMLElement;
      fireEvent.mouseDown(menu);

      await waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should close when pressing Escape key', async () => {
      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should close after any menu action', async () => {
      (global.prompt as jest.Mock).mockReturnValue(null);

      const file = createMockFile();
      render(<FileTreeContextMenu file={file} position={mockPosition} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('New File'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Menu Positioning', () => {
    it('should adjust position when menu would go off right edge', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 150, writable: true });

      const file = createMockFile();
      const { container } = render(
        <FileTreeContextMenu file={file} position={{ x: 100, y: 100 }} onClose={mockOnClose} />
      );

      // Menu should be positioned to the left to fit on screen
      const menu = container.querySelector('[style*="left:"]') as HTMLElement;
      const leftValue = parseInt(menu.style.left);
      expect(leftValue).toBeLessThan(100); // Adjusted left
    });

    it('should adjust position when menu would go off bottom edge', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerHeight', { value: 150, writable: true });

      const file = createMockFile();
      const { container } = render(
        <FileTreeContextMenu file={file} position={{ x: 100, y: 100 }} onClose={mockOnClose} />
      );

      // Menu should be positioned above to fit on screen
      const menu = container.querySelector('[style*="top:"]') as HTMLElement;
      const topValue = parseInt(menu.style.top);
      expect(topValue).toBeLessThan(100); // Adjusted up
    });
  });
});
