import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import type { GeneratedFile } from '../../context/EditorContext';

interface Position {
  x: number;
  y: number;
}

interface FileTreeContextMenuProps {
  file: GeneratedFile;
  position: Position;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
}

/**
 * Context menu for file tree operations.
 *
 * Features:
 * - New File / New Folder
 * - Rename file/folder
 * - Delete file/folder (with confirmation)
 * - Copy path to clipboard
 * - Click outside to close
 *
 * @example
 * ```tsx
 * <FileTreeContextMenu
 *   file={selectedFile}
 *   position={{ x: 100, y: 200 }}
 *   onClose={() => setContextMenu(null)}
 * />
 * ```
 */
export function FileTreeContextMenu({
  file,
  position,
  onClose,
}: FileTreeContextMenuProps) {
  const { createNewFile, deleteFile, renameFile } = useEditor();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Close on Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const isDirectory = file.language === 'directory';

  const handleNewFile = async () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const basePath = isDirectory ? file.path : file.path.split('/').slice(0, -1).join('/');
      const newPath = basePath ? `${basePath}/${fileName}` : fileName;

      try {
        await createNewFile(newPath, '// New file\n');
      } catch (error) {
        console.error('Failed to create file:', error);
        alert('Failed to create file. Please try again.');
      }
    }
    onClose();
  };

  const handleNewFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const basePath = isDirectory ? file.path : file.path.split('/').slice(0, -1).join('/');
      const newPath = basePath ? `${basePath}/${folderName}/.gitkeep` : `${folderName}/.gitkeep`;

      try {
        // Create a .gitkeep file to create the folder
        await createNewFile(newPath, '');
      } catch (error) {
        console.error('Failed to create folder:', error);
        alert('Failed to create folder. Please try again.');
      }
    }
    onClose();
  };

  const handleRename = async () => {
    const currentName = file.path.split('/').pop() || '';
    const newName = prompt('Enter new name:', currentName);

    if (newName && newName !== currentName) {
      const basePath = file.path.split('/').slice(0, -1).join('/');
      const newPath = basePath ? `${basePath}/${newName}` : newName;

      try {
        await renameFile(file.path, newPath);
      } catch (error) {
        console.error('Failed to rename:', error);
        alert('Failed to rename. Please try again.');
      }
    }
    onClose();
  };

  const handleDelete = async () => {
    const confirmMessage = isDirectory
      ? `Delete folder "${file.path}" and all its contents?`
      : `Delete file "${file.path}"?`;

    if (confirm(confirmMessage)) {
      try {
        await deleteFile(file.path);
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete. Please try again.');
      }
    }
    onClose();
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path).then(
      () => {
        // Success - could show a toast notification here
        console.log('Path copied to clipboard:', file.path);
      },
      (err) => {
        console.error('Failed to copy path:', err);
        alert('Failed to copy path to clipboard.');
      }
    );
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      label: 'New File',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: handleNewFile,
    },
    {
      label: 'New Folder',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: handleNewFolder,
    },
    {
      label: '',
      separator: true,
      onClick: () => {},
    },
    {
      label: 'Rename',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: handleRename,
    },
    {
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDelete,
      danger: true,
    },
    {
      label: '',
      separator: true,
      onClick: () => {},
    },
    {
      label: 'Copy Path',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleCopyPath,
    },
  ];

  // Calculate menu position to avoid going off-screen
  const menuWidth = 200;
  const menuHeight = 250; // approximate
  const adjustedX = position.x + menuWidth > window.innerWidth ? position.x - menuWidth : position.x;
  const adjustedY = position.y + menuHeight > window.innerHeight ? position.y - menuHeight : position.y;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] z-50"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
    >
      {menuItems.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-gray-200 dark:bg-gray-700 my-1"
            />
          );
        }

        return (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
              item.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
