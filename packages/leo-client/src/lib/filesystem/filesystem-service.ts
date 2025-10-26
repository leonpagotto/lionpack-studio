/**
 * Filesystem Service
 *
 * Unified service for managing multiple filesystem sources (local and GitHub).
 * Provides source switching, error handling, and a simplified API for UI components.
 *
 * @example
 * ```typescript
 * const service = new FilesystemService();
 *
 * // Use local filesystem
 * await service.useLocal();
 *
 * // Or use GitHub repository
 * await service.useGitHub({ owner: 'user', repo: 'project', token: 'ghp_...' });
 *
 * // Operations work the same regardless of source
 * const files = await service.listDirectory('/src');
 * ```
 */

import { LocalFileSystem } from './local-filesystem';
import { GitHubFileSystem, GitHubConfig } from './github-filesystem';
import {
  Filesystem,
  FileSystemEntry,
  FilesystemResult,
  ReadFileOptions,
  WriteFileOptions,
  RenameEntryOptions
} from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FilesystemSource = 'local' | 'github' | null;

export interface FilesystemServiceConfig {
  /** Default source to use if none specified */
  defaultSource?: FilesystemSource;
  /** Auto-detect and use last successful source */
  autoReconnect?: boolean;
}

export interface SourceInfo {
  type: FilesystemSource;
  connected: boolean;
  displayName: string;
  config?: GitHubConfig | { rootPath?: string };
}

// ============================================================================
// FILESYSTEM SERVICE
// ============================================================================

/**
 * Unified filesystem service managing multiple sources.
 *
 * Handles:
 * - Source switching (local ↔ GitHub)
 * - Connection state management
 * - Error recovery and fallback
 * - Simplified API for UI components
 */
export class FilesystemService implements Filesystem {
  private localFS: LocalFileSystem;
  private githubFS: GitHubFileSystem | null = null;
  private currentSource: FilesystemSource = null;
  private lastGitHubConfig: GitHubConfig | null = null;

  constructor(_config: FilesystemServiceConfig = {}) {
    // Config reserved for future use (auto-reconnect, default source, etc.)
    this.localFS = new LocalFileSystem();
  }

  // ==========================================================================
  // SOURCE MANAGEMENT
  // ==========================================================================

  /**
   * Switch to local filesystem source.
   * Uses browser's File System Access API.
   */
  async useLocal(): Promise<FilesystemResult<void>> {
    if (!this.localFS.supports()) {
      return {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: 'File System Access API not supported in this browser. Try Chrome, Edge, or Opera.'
        }
      };
    }

    this.currentSource = 'local';
    this.githubFS = null;

    return { ok: true, value: undefined };
  }

  /**
   * Switch to GitHub repository source.
   * Validates configuration and connection.
   *
   * @param config GitHub repository configuration
   */
  async useGitHub(config: GitHubConfig): Promise<FilesystemResult<void>> {
    const fs = new GitHubFileSystem(config);

    if (!fs.supports()) {
      return {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: 'GitHub configuration incomplete. Provide owner, repo, and token.'
        }
      };
    }

    // Verify connection by checking root access
    const rootResult = await fs.requestRoot();
    if (!rootResult.ok) {
      return {
        ok: false,
        error: rootResult.error
      };
    }

    this.githubFS = fs;
    this.currentSource = 'github';
    this.lastGitHubConfig = config;

    return { ok: true, value: undefined };
  }

  /**
   * Disconnect from current source.
   */
  disconnect(): void {
    this.currentSource = null;
    this.githubFS = null;
  }

  /**
   * Get information about current source.
   */
  getSourceInfo(): SourceInfo {
    if (this.currentSource === 'local') {
      return {
        type: 'local',
        connected: true,
        displayName: 'Local Files',
        config: {}
      };
    }

    if (this.currentSource === 'github' && this.githubFS) {
      const config = this.githubFS.getConfig();
      return {
        type: 'github',
        connected: true,
        displayName: `${config.owner}/${config.repo}`,
        config
      };
    }

    return {
      type: null,
      connected: false,
      displayName: 'Not Connected'
    };
  }

  /**
   * Check if service is connected to a source.
   */
  isConnected(): boolean {
    return this.currentSource !== null;
  }

  /**
   * Get current source type.
   */
  getCurrentSource(): FilesystemSource {
    return this.currentSource;
  }

  // ==========================================================================
  // FILESYSTEM INTERFACE IMPLEMENTATION
  // ==========================================================================

  /**
   * Check if service can operate (has active source).
   */
  supports(): boolean {
    return this.currentSource !== null;
  }

  /**
   * List directory contents.
   *
   * @param path Relative path from root
   */
  async listDirectory(path: string): Promise<FilesystemResult<FileSystemEntry[]>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.listDirectory(path);
  }

  /**
   * Read file contents.
   *
   * @param path Relative path from root
   * @param options Encoding options (utf-8 or base64)
   */
  async readFile(
    path: string,
    options?: ReadFileOptions
  ): Promise<FilesystemResult<string | Uint8Array>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.readFile(path, options);
  }

  /**
   * Write file contents.
   * Creates file if it doesn't exist, updates if it does (with overwrite option).
   *
   * @param path Relative path from root
   * @param data File content (string or binary)
   * @param options Write options (overwrite, recursive, message)
   */
  async writeFile(
    path: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<FilesystemResult<void>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.writeFile(path, data, options);
  }

  /**
   * Create new file.
   * Fails if file already exists.
   *
   * @param path Relative path from root
   * @param data Initial file content (optional)
   */
  async createFile(
    path: string,
    data?: string | Uint8Array
  ): Promise<FilesystemResult<void>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.createFile(path, data);
  }

  /**
   * Delete file or directory.
   *
   * @param path Relative path from root
   * @param options Delete options (recursive)
   */
  async deleteEntry(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<FilesystemResult<void>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.deleteEntry(path, options);
  }

  /**
   * Rename or move file/directory.
   *
   * @param oldPath Current path
   * @param newPath New path
   * @param options Rename options (overwrite)
   */
  async renameEntry(
    oldPath: string,
    newPath: string,
    options?: RenameEntryOptions
  ): Promise<FilesystemResult<void>> {
    const fs = this.getActiveFilesystem();
    if (!fs) {
      return this.notConnectedError();
    }

    return fs.renameEntry(oldPath, newPath, options);
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Get active filesystem instance.
   * @private
   */
  private getActiveFilesystem(): Filesystem | null {
    if (this.currentSource === 'local') {
      return this.localFS;
    }

    if (this.currentSource === 'github') {
      return this.githubFS;
    }

    return null;
  }

  /**
   * Create "not connected" error result.
   * @private
   */
  private notConnectedError(): FilesystemResult<any> {
    return {
      ok: false,
      error: {
        code: 'EBADF',
        message: 'Not connected to any filesystem source. Call useLocal() or useGitHub() first.'
      }
    };
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Read file as JSON and parse.
   *
   * @param path Path to JSON file
   */
  async readJSON<T = any>(path: string): Promise<FilesystemResult<T>> {
    const result = await this.readFile(path, { encoding: 'utf-8' });

    if (!result.ok) {
      return result as FilesystemResult<T>;
    }

    try {
      const parsed = JSON.parse(result.value as string);
      return { ok: true, value: parsed };
    } catch (error: any) {
      return {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: `Invalid JSON in ${path}: ${error.message}`
        }
      };
    }
  }

  /**
   * Write object as JSON file.
   *
   * @param path Path to JSON file
   * @param data Object to serialize
   * @param options Write options
   */
  async writeJSON(
    path: string,
    data: any,
    options?: Omit<WriteFileOptions, 'encoding'>
  ): Promise<FilesystemResult<void>> {
    try {
      const json = JSON.stringify(data, null, 2);
      return this.writeFile(path, json, options);
    } catch (error: any) {
      return {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: `Cannot serialize to JSON: ${error.message}`
        }
      };
    }
  }

  /**
   * Check if file/directory exists.
   *
   * @param path Path to check
   */
  async exists(path: string): Promise<boolean> {
    const result = await this.readFile(path);
    return result.ok;
  }

  /**
   * Recursively create directory path.
   * Note: Not all filesystems support this (e.g., GitHub requires files).
   *
   * @param path Directory path
   */
  async createDirectory(path: string): Promise<FilesystemResult<void>> {
    // For GitHub, we can't create empty directories
    // Create a placeholder .gitkeep file instead
    if (this.currentSource === 'github') {
      return this.createFile(`${path}/.gitkeep`, '');
    }

    // For local, use writeFile with recursive option
    return this.createFile(`${path}/.placeholder`, '');
  }

  /**
   * Get file tree recursively.
   *
   * @param path Starting path
   * @param maxDepth Maximum recursion depth (default: 10)
   */
  async getTree(
    path: string = '',
    maxDepth: number = 10
  ): Promise<FilesystemResult<FileSystemEntry[]>> {
    if (maxDepth <= 0) {
      return { ok: true, value: [] };
    }

    const result = await this.listDirectory(path);
    if (!result.ok) {
      return result;
    }

    const entries: FileSystemEntry[] = [...result.value!];

    // Recursively fetch subdirectories
    for (const entry of result.value!) {
      if (entry.kind === 'directory') {
        const subResult = await this.getTree(entry.path, maxDepth - 1);
        if (subResult.ok) {
          entries.push(...subResult.value!);
        }
      }
    }

    return { ok: true, value: entries };
  }

  /**
   * Clear any caches (useful for GitHub filesystem).
   */
  clearCache(): void {
    if (this.githubFS) {
      this.githubFS.clearCache();
    }
  }

  /**
   * Reconnect to last GitHub source if available.
   */
  async reconnectGitHub(): Promise<FilesystemResult<void>> {
    if (!this.lastGitHubConfig) {
      return {
        ok: false,
        error: {
          code: 'ENOENT',
          message: 'No previous GitHub connection to reconnect to.'
        }
      };
    }

    return this.useGitHub(this.lastGitHubConfig);
  }
}
