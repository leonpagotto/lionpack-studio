import React from 'react';
import { useEditor } from '../../context/EditorContext';

interface FilesystemStatusProps {
  className?: string;
  showDisconnect?: boolean;
}

/**
 * Status indicator showing the current filesystem source.
 *
 * Features:
 * - Displays source type (Local / GitHub / Not Connected)
 * - Shows repository info if GitHub (owner/repo/branch)
 * - Error indicator with message
 * - Optional disconnect action
 *
 * @example
 * ```tsx
 * <FilesystemStatus showDisconnect={true} />
 * ```
 */
export function FilesystemStatus({
  className = '',
  showDisconnect = true
}: FilesystemStatusProps) {
  const { filesystem, disconnectFilesystem } = useEditor();

  const getStatusIcon = () => {
    if (!filesystem.isConnected) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414zm-1.414 5.658a3 3 0 00-4.243 0m0 0l-.707.707m12.728 2.828l2.829 2.829M19.5 7.5l-2.829 2.829m-10.607 0L3.636 7.929M7.5 21L5.636 19.136" />
        </svg>
      );
    }

    if (filesystem.source === 'local') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    }

    if (filesystem.source === 'github') {
      return (
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      );
    }

    return null;
  };

  const getStatusText = () => {
    if (!filesystem.isConnected) {
      return 'Not Connected';
    }

    if (filesystem.sourceInfo) {
      return filesystem.sourceInfo.displayName;
    }

    return filesystem.source === 'local' ? 'Local Folder' : 'GitHub Repository';
  };

  const getStatusBadge = () => {
    if (!filesystem.isConnected) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          Offline
        </span>
      );
    }

    if (filesystem.source === 'local') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          Local
        </span>
      );
    }

    if (filesystem.source === 'github') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
          GitHub
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {/* Status Display */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getStatusIcon()}

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {getStatusText()}
            </span>
            {getStatusBadge()}
          </div>

          {/* Repository details for GitHub */}
          {filesystem.source === 'github' && filesystem.sourceInfo?.config && 'owner' in filesystem.sourceInfo.config && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {filesystem.sourceInfo.config.owner}/{filesystem.sourceInfo.config.repo}
              {filesystem.sourceInfo.config.branch && ` (${filesystem.sourceInfo.config.branch})`}
            </span>
          )}
        </div>
      </div>

      {/* Error Indicator */}
      {filesystem.error && (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium" title={filesystem.error.message}>
            Error
          </span>
        </div>
      )}

      {/* Disconnect Button */}
      {showDisconnect && filesystem.isConnected && (
        <button
          onClick={disconnectFilesystem}
          className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="Disconnect filesystem"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
