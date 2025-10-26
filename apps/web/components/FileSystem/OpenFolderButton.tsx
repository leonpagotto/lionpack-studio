import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';

interface OpenFolderButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button component to open a local folder using the File System Access API.
 *
 * Features:
 * - Triggers File System Access API picker
 * - Shows connection status (Not Connected / Local Folder name)
 * - Handles errors gracefully (API not supported, user cancelled)
 * - Loading state during folder selection
 *
 * @example
 * ```tsx
 * <OpenFolderButton variant="outline" size="md" />
 * ```
 */
export function OpenFolderButton({
  className = '',
  variant = 'default',
  size = 'md'
}: OpenFolderButtonProps) {
  const { filesystem, openLocalFolder } = useEditor();
  const [loading, setLoading] = useState(false);

  const isLocalConnected = filesystem.isConnected && filesystem.source === 'local';
  const folderName = filesystem.sourceInfo?.displayName || 'Local Folder';
  const error = filesystem.error;

  const handleClick = async () => {
    setLoading(true);

    try {
      await openLocalFolder();
      // Error state is managed by EditorContext
    } catch (err) {
      console.error('OpenFolderButton error:', err);
    } finally {
      setLoading(false);
    }
  };  // Variant styles
  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    outline: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-transparent'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        title={isLocalConnected ? `Connected to: ${folderName}` : 'Open a local folder'}
      >
        {/* Icon */}
        <svg
          className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-2`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isLocalConnected ? (
            // Folder open icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          ) : (
            // Folder icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          )}
        </svg>

        {/* Text */}
        <span>
          {loading ? 'Opening...' : isLocalConnected ? folderName : 'Open Folder'}
        </span>

        {/* Loading spinner */}
        {loading && (
          <svg
            className={`animate-spin ml-2 ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {error.code === 'EACCES'
              ? 'Permission denied. Please grant access to the folder.'
              : error.message || 'Failed to open folder'}
          </span>
        </div>
      )}
    </div>
  );
}
