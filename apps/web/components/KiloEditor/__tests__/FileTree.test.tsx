import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileTree, { type FileNode } from '../FileTree';
import type { EditorContextType, GeneratedFile } from '../../../context/EditorContext';

// Mock EditorContext
const mockLoadFile = jest.fn();
const mockSelectFile = jest.fn();
const mockUseEditor = jest.fn();

jest.mock('../../../context/EditorContext', () => ({
  useEditor: () => mockUseEditor(),
}));

// Mock FileTreeContextMenu (so we can test it renders without testing its internals)
jest.mock('../../FileSystem/FileTreeContextMenu', () => ({
  FileTreeContextMenu: ({ file, position, onClose }: any) => (
    <div data-testid="context-menu" data-file-path={file.path} data-x={position.x} data-y={position.y}>
      <button onClick={onClose}>Close Menu</button>
    </div>
  ),
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
    selectFile: mockSelectFile,
    addTestOutput: jest.fn(),
    setTestResults: jest.fn(),
    setIsGenerating: jest.fn(),
    reset: jest.fn(),
    openLocalFolder: jest.fn(),
    connectGitHub: jest.fn(),
    disconnectFilesystem: jest.fn(),
    loadFile: mockLoadFile,
    saveFile: jest.fn(),
    createNewFile: jest.fn(),
    deleteFile: jest.fn(),
    renameFile: jest.fn(),
    refreshFileTree: jest.fn(),
    ...overrides,
  };
}

describe('FileTree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(createMockEditorContext());
  });

  describe('Rendering', () => {
    it('should show empty state when no files', () => {
      render(<FileTree files={[]} />);

      expect(screen.getByText('No files generated yet')).toBeInTheDocument();
      expect(screen.getByText('0 files')).toBeInTheDocument();
    });

    it('should show file count with correct pluralization', () => {
      const singleFile: FileNode = {
        path: 'test.ts',
        content: '',
        language: 'typescript',
      };

      const { rerender } = render(<FileTree files={[singleFile]} />);
      expect(screen.getByText('1 file')).toBeInTheDocument();

      const multipleFiles: FileNode[] = [
        { path: 'test1.ts', content: '', language: 'typescript' },
        { path: 'test2.ts', content: '', language: 'typescript' },
      ];

      rerender(<FileTree files={multipleFiles} />);
      expect(screen.getByText('2 files')).toBeInTheDocument();
    });

    it('should render file list with filenames', () => {
      const files: FileNode[] = [
        { path: 'src/index.ts', content: '', language: 'typescript' },
        { path: 'src/utils.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.getByText('utils.ts')).toBeInTheDocument();
    });

    it('should show file icons based on language', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
        { path: 'test.js', content: '', language: 'javascript' },
        { path: 'test.tsx', content: '', language: 'tsx' },
        { path: 'test.css', content: '', language: 'css' },
        { path: 'test.html', content: '', language: 'html' },
        { path: 'test.json', content: '', language: 'json' },
        { path: 'test.py', content: '', language: 'python' },
      ];

      const { container } = render(<FileTree files={files} />);

      // Check that icons are rendered (emojis in text content)
      expect(container.textContent).toContain('📘'); // TypeScript
      expect(container.textContent).toContain('📙'); // JavaScript
      expect(container.textContent).toContain('⚛️'); // React
      expect(container.textContent).toContain('🎨'); // CSS
      expect(container.textContent).toContain('📗'); // HTML
      expect(container.textContent).toContain('📊'); // JSON
      expect(container.textContent).toContain('🐍'); // Python
    });
  });

  describe('File Selection (with props)', () => {
    it('should call onSelectFile when file is clicked', () => {
      const onSelectFile = jest.fn();
      const files: FileNode[] = [
        { path: 'test.ts', content: 'content', language: 'typescript' },
      ];

      render(<FileTree files={files} onSelectFile={onSelectFile} />);

      fireEvent.click(screen.getByText('test.ts'));

      expect(onSelectFile).toHaveBeenCalledWith(files[0]);
    });

    it('should highlight active file', () => {
      const files: FileNode[] = [
        { path: 'test1.ts', content: '', language: 'typescript' },
        { path: 'test2.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} activeFile="test1.ts" />);

      const activeFileElement = screen.getByText('test1.ts').parentElement;
      expect(activeFileElement).toHaveClass('bg-blue-100');
    });
  });

  describe('File Selection (with EditorContext)', () => {
    it('should use EditorContext files when no props provided', () => {
      const contextFiles: GeneratedFile[] = [
        { path: 'context-file.ts', content: '', language: 'typescript' },
      ];

      mockUseEditor.mockReturnValue(
        createMockEditorContext({ files: contextFiles })
      );

      render(<FileTree />);

      expect(screen.getByText('context-file.ts')).toBeInTheDocument();
    });

    it('should use EditorContext activeFile when no activeFile prop', () => {
      const contextFiles: GeneratedFile[] = [
        { path: 'test1.ts', content: '', language: 'typescript' },
        { path: 'test2.ts', content: '', language: 'typescript' },
      ];

      mockUseEditor.mockReturnValue(
        createMockEditorContext({
          files: contextFiles,
          activeFile: contextFiles[0],
        })
      );

      render(<FileTree />);

      const activeFileElement = screen.getByText('test1.ts').parentElement;
      expect(activeFileElement).toHaveClass('bg-blue-100');
    });

    it('should load file from EditorContext when clicked', async () => {
      const contextFiles: GeneratedFile[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      mockUseEditor.mockReturnValue(
        createMockEditorContext({ files: contextFiles })
      );
      mockLoadFile.mockResolvedValue(undefined);

      render(<FileTree />);

      fireEvent.click(screen.getByText('test.ts'));

      await waitFor(() => {
        expect(mockLoadFile).toHaveBeenCalledWith('test.ts');
      });
    });

    it('should handle file load errors gracefully', async () => {
      const contextFiles: GeneratedFile[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      mockUseEditor.mockReturnValue(
        createMockEditorContext({ files: contextFiles })
      );
      mockLoadFile.mockRejectedValue(new Error('File not found'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<FileTree />);

      fireEvent.click(screen.getByText('test.ts'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load file:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Folder Expansion', () => {
    it('should show expand/collapse button for folders', () => {
      const files: FileNode[] = [
        {
          path: 'src',
          content: '',
          language: 'directory',
          isDirectory: true,
          children: [
            { path: 'src/index.ts', content: '', language: 'typescript' },
          ],
        },
      ];

      render(<FileTree files={files} />);

      // Should show expand button (▶)
      expect(screen.getByText('▶')).toBeInTheDocument();
    });

    it('should expand folder when expand button clicked', () => {
      const files: FileNode[] = [
        {
          path: 'src',
          content: '',
          language: 'directory',
          isDirectory: true,
          children: [
            { path: 'src/index.ts', content: '', language: 'typescript' },
          ],
        },
      ];

      render(<FileTree files={files} />);

      // Initially collapsed, child not visible
      expect(screen.queryByText('index.ts')).not.toBeInTheDocument();

      // Click expand button
      fireEvent.click(screen.getByText('▶'));

      // Now expanded, child visible
      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.getByText('▼')).toBeInTheDocument(); // Collapse icon
    });

    it('should collapse folder when collapse button clicked', () => {
      const files: FileNode[] = [
        {
          path: 'src',
          content: '',
          language: 'directory',
          isDirectory: true,
          children: [
            { path: 'src/index.ts', content: '', language: 'typescript' },
          ],
        },
      ];

      render(<FileTree files={files} />);

      // Expand folder
      fireEvent.click(screen.getByText('▶'));
      expect(screen.getByText('index.ts')).toBeInTheDocument();

      // Collapse folder
      fireEvent.click(screen.getByText('▼'));
      expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
    });

    it('should not trigger file click when expand button clicked', () => {
      const onSelectFile = jest.fn();
      const files: FileNode[] = [
        {
          path: 'src',
          content: '',
          language: 'directory',
          isDirectory: true,
          children: [
            { path: 'src/index.ts', content: '', language: 'typescript' },
          ],
        },
      ];

      render(<FileTree files={files} onSelectFile={onSelectFile} />);

      fireEvent.click(screen.getByText('▶'));

      expect(onSelectFile).not.toHaveBeenCalled();
    });

    it('should render nested folders with correct indentation', () => {
      const files: FileNode[] = [
        {
          path: 'src',
          content: '',
          language: 'directory',
          isDirectory: true,
          children: [
            {
              path: 'src/components',
              content: '',
              language: 'directory',
              isDirectory: true,
              children: [
                { path: 'src/components/Button.tsx', content: '', language: 'tsx' },
              ],
            },
          ],
        },
      ];

      render(<FileTree files={files} />);

      // Expand src
      fireEvent.click(screen.getByText('▶'));

      // Expand components
      const expandButtons = screen.getAllByText('▶');
      fireEvent.click(expandButtons[0]);

      // Check file is visible
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();

      // Check indentation (level 2 = 44px: level * 16 + 12)
      const buttonElement = screen.getByText('Button.tsx').parentElement;
      expect(buttonElement).toHaveStyle('padding-left: 44px');
    });
  });

  describe('Context Menu', () => {
    it('should show context menu on right click', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      const fileElement = screen.getByText('test.ts').parentElement!;
      fireEvent.contextMenu(fileElement);

      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    it('should show context menu at mouse position', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      const fileElement = screen.getByText('test.ts').parentElement!;
      fireEvent.contextMenu(fileElement, { clientX: 150, clientY: 200 });

      const menu = screen.getByTestId('context-menu');
      expect(menu).toHaveAttribute('data-x', '150');
      expect(menu).toHaveAttribute('data-y', '200');
    });

    it('should pass correct file to context menu', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      const fileElement = screen.getByText('test.ts').parentElement!;
      fireEvent.contextMenu(fileElement);

      const menu = screen.getByTestId('context-menu');
      expect(menu).toHaveAttribute('data-file-path', 'test.ts');
    });

    it('should close context menu when onClose called', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      // Open menu
      const fileElement = screen.getByText('test.ts').parentElement!;
      fireEvent.contextMenu(fileElement);

      expect(screen.getByTestId('context-menu')).toBeInTheDocument();

      // Close menu
      fireEvent.click(screen.getByText('Close Menu'));

      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });

    it('should prevent default browser context menu', () => {
      const files: FileNode[] = [
        { path: 'test.ts', content: '', language: 'typescript' },
      ];

      render(<FileTree files={files} />);

      const fileElement = screen.getByText('test.ts').parentElement!;
      const event = new MouseEvent('contextmenu', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fileElement.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show "No files generated yet" when EditorContext has no files', () => {
      mockUseEditor.mockReturnValue(createMockEditorContext({ files: [] }));

      render(<FileTree />);

      expect(screen.getByText('No files generated yet')).toBeInTheDocument();
    });
  });
});
