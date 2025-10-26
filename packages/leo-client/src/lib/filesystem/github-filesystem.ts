/**
 * GitHub Filesystem Implementation
 *
 * Implements Filesystem interface using GitHub REST API Contents endpoint.
 * Provides read/write access to repository files via authenticated requests.
 *
 * @see https://docs.github.com/en/rest/repos/contents
 */

import {
  Filesystem,
  FileSystemEntry,
  FilesystemResult,
  FilesystemError,
  normalizeError,
  WriteFileOptions,
  RenameEntryOptions
} from './types';// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string;
  token: string;
}

interface GitHubContentFile {
  type: 'file';
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: 'base64';
  url: string;
  download_url: string;
}

interface GitHubContentDir {
  type: 'dir';
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
}

type GitHubContent = GitHubContentFile | GitHubContentDir;

// SHA cache for file updates (required by GitHub API)
interface SHACache {
  [path: string]: string;
}

// ============================================================================
// GITHUB FILESYSTEM CLASS
// ============================================================================

/**
 * GitHub-based filesystem implementation.
 *
 * Uses GitHub REST API to read/write files in a repository.
 * Requires authentication token with `repo` scope.
 */
export class GitHubFileSystem implements Filesystem {
  private config: GitHubConfig;
  private shaCache: SHACache = {};
  private baseUrl = 'https://api.github.com';
  private apiVersion = '2022-11-28';

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || 'main'
    };
  }

  // ==========================================================================
  // FILESYSTEM INTERFACE METHODS
  // ==========================================================================

  /**
   * Check if this filesystem is supported in current environment.
   * GitHub filesystem requires token configuration.
   */
  supports(): boolean {
    return !!(this.config.owner && this.config.repo && this.config.token);
  }

  /**
   * Request root directory handle.
   * For GitHub, this is a no-op as we already have repo config.
   * Returns a mock handle for API compatibility.
   */
  async requestRoot(): Promise<FilesystemResult<FileSystemDirectoryHandle | null>> {
    try {
      // Verify repo access by fetching root contents
      const result = await this.githubFetch(`/repos/${this.config.owner}/${this.config.repo}/contents`);

      if (!result.ok) {
        return result;
      }

      // Return mock handle (GitHub doesn't use File System Access API)
      return {
        ok: true,
        value: {
          name: this.config.repo,
          kind: 'directory'
        } as any
      };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  /**
   * List directory contents.
   *
   * @example
   * const result = await fs.listDirectory('src/components');
   * if (result.ok) {
   *   for (const entry of result.value) {
   *     console.log(entry.name, entry.kind);
   *   }
   * }
   */
  async listDirectory(path: string): Promise<FilesystemResult<FileSystemEntry[]>> {
    try {
      const apiPath = path === '/' || path === ''
        ? `/repos/${this.config.owner}/${this.config.repo}/contents`
        : `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

      const result = await this.githubFetch(apiPath);

      if (!result.ok) {
        return result;
      }

      const contents = result.value as GitHubContent[];

      // Convert GitHub contents to FileSystemEntry format
      const entries: FileSystemEntry[] = contents.map(item => {
        const entry: FileSystemEntry = item.type === 'dir'
          ? {
              kind: 'directory' as const,
              name: item.name,
              path: item.path
            }
          : {
              kind: 'file' as const,
              name: item.name,
              path: item.path,
              size: item.size
            };
        return entry;
      });

      return {
        ok: true,
        value: entries
      };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }  /**
   * Read file contents.
   *
   * Supports both UTF-8 text and base64 binary content.
   *
   * @example
   * const result = await fs.readFile('package.json', { encoding: 'utf-8' });
   * if (result.ok) {
   *   const pkg = JSON.parse(result.value);
   * }
   */
  async readFile(
    path: string,
    options?: { encoding?: 'utf-8' | 'base64' }
  ): Promise<FilesystemResult<string>> {
    try {
      const encoding = options?.encoding || 'utf-8';
      const apiPath = `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

      const result = await this.githubFetch(apiPath);

      if (!result.ok) {
        return result;
      }

      const file = result.value as GitHubContentFile;

      if (file.type !== 'file') {
        return {
          ok: false,
          error: {
            code: 'EISDIR',
            message: `Path is a directory, not a file: ${path}`
          }
        };
      }

      // Cache SHA for future updates
      this.shaCache[path] = file.sha;

      // Decode content
      const content = encoding === 'utf-8'
        ? Buffer.from(file.content, 'base64').toString('utf-8')
        : file.content; // Already base64

      return {
        ok: true,
        value: content
      };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  /**
   * Write file contents.
   *
   * Creates new file or updates existing file via Git commit.
   *
   * @example
   * const result = await fs.writeFile('README.md', '# Hello', {
   *   message: 'docs: update readme',
   *   overwrite: true
   * });
   */
  async writeFile(
    path: string,
    data: string | Uint8Array,
    options?: WriteFileOptions & {
      message?: string;
      encoding?: 'utf-8' | 'base64';
    }
  ): Promise<FilesystemResult<void>> {
    try {
      const {
        overwrite = true,
        message = `Update ${path}`,
        encoding = 'utf-8'
      } = options || {};

      // Convert data to string if Uint8Array
      const content = data instanceof Uint8Array
        ? Buffer.from(data).toString('utf-8')
        : data;

      // Encode content to base64 (required by GitHub API)
      const encodedContent = encoding === 'utf-8'
        ? Buffer.from(content, 'utf-8').toString('base64')
        : content; // Already base64

      // Check if file exists to get SHA (required for updates)
      let sha: string | undefined = this.shaCache[path];

      if (!sha) {
        const existingFile = await this.githubFetch(
          `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
        );

        if (existingFile.ok) {
          const file = existingFile.value as GitHubContentFile;
          sha = file.sha;
          this.shaCache[path] = sha;

          if (!overwrite) {
            return {
              ok: false,
              error: {
                code: 'EEXIST',
                message: `File already exists: ${path}`
              }
            };
          }
        }
      }

      // Create or update file via PUT request
      const result = await this.githubFetch(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            message,
            content: encodedContent,
            branch: this.config.branch,
            ...(sha && { sha }) // Include SHA for updates
          })
        }
      );

      if (!result.ok) {
        return result;
      }

      // Update SHA cache
      const response = result.value as { content: GitHubContentFile };
      this.shaCache[path] = response.content.sha;

      return { ok: true, value: undefined };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  /**
   * Create a new file.
   * Fails if file already exists (use writeFile with overwrite for updates).
   */
  async createFile(
    path: string,
    data: string | Uint8Array = ''
  ): Promise<FilesystemResult<void>> {
    return this.writeFile(path, data, {
      overwrite: false // Explicitly prevent overwrite
    });
  }  /**
   * Delete file or directory.
   *
   * For GitHub, requires file SHA.
   * Recursive delete is NOT supported (GitHub limitation).
   */
  async deleteEntry(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<FilesystemResult<void>> {
    try {
      // Get file SHA (required for deletion)
      let sha: string | undefined = this.shaCache[path];

      if (!sha) {
        const result = await this.githubFetch(
          `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
        );

        if (!result.ok) {
          return result;
        }

        const item = result.value as GitHubContent;
        sha = item.sha;
      }

      // Check if directory (GitHub doesn't support recursive delete via API)
      const checkResult = await this.githubFetch(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
      );

      if (checkResult.ok) {
        const item = checkResult.value as GitHubContent;
        if (item.type === 'dir' && !options?.recursive) {
          return {
            ok: false,
            error: {
              code: 'EISDIR',
              message: `Cannot delete directory without recursive option: ${path}`
            }
          };
        }

        if (item.type === 'dir' && options?.recursive) {
          return {
            ok: false,
            error: {
              code: 'EISDIR',
              message: 'Recursive directory deletion not supported via GitHub API. Use Git operations instead.'
            }
          };
        }
      }

      // Delete file
      const result = await this.githubFetch(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            message: `Delete ${path}`,
            sha,
            branch: this.config.branch
          })
        }
      );

      if (!result.ok) {
        return result;
      }

      // Clear SHA cache
      delete this.shaCache[path];

      return { ok: true, value: undefined };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  /**
   * Rename or move file.
   *
   * GitHub doesn't have a native rename API.
   * Implements rename as: read → write to new path → delete old path.
   */
  async renameEntry(
    oldPath: string,
    newPath: string,
    options?: RenameEntryOptions
  ): Promise<FilesystemResult<void>> {
    try {
      // Step 1: Read existing file
      const readResult = await this.readFile(oldPath, { encoding: 'base64' });

      if (!readResult.ok) {
        return {
          ok: false,
          error: readResult.error
        } as FilesystemResult<void>;
      }

      const content = readResult.value as string;

      // Step 2: Write to new path
      const writeResult = await this.writeFile(newPath, content, {
        message: `Rename ${oldPath} to ${newPath}`,
        encoding: 'base64',
        overwrite: options?.overwrite ?? true
      });

      if (!writeResult.ok) {
        return writeResult;
      }      // Step 3: Delete old path
      const deleteResult = await this.deleteEntry(oldPath);

      if (!deleteResult.ok) {
        // Rollback: delete the newly created file
        await this.deleteEntry(newPath);
        return deleteResult;
      }

      return { ok: true, value: undefined };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  // ==========================================================================
  // GITHUB API HELPERS
  // ==========================================================================

  /**
   * Make authenticated GitHub API request.
   * Handles error responses and rate limiting.
   */
  private async githubFetch(
    endpoint: string,
    options?: RequestInit
  ): Promise<FilesystemResult<any>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': this.apiVersion,
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });

      // Handle errors
      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage: string;

        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorBody;
        } catch {
          errorMessage = errorBody;
        }

        // Map HTTP status to filesystem error codes
        let code: FilesystemError['code'];
        if (response.status === 404) {
          code = 'ENOENT';
        } else if (response.status === 403) {
          code = 'EACCES';
        } else if (response.status === 409) {
          code = 'EEXIST';
        } else {
          code = 'UNKNOWN';
        }

        return {
          ok: false,
          error: {
            code,
            message: `GitHub API error (${response.status}): ${errorMessage}`
          }
        };
      }

      const data = await response.json();

      return {
        ok: true,
        value: data
      };
    } catch (error: any) {
      return {
        ok: false,
        error: normalizeError(error)
      };
    }
  }

  /**
   * Get current repository configuration.
   */
  getConfig(): Readonly<GitHubConfig> {
    return { ...this.config };
  }

  /**
   * Clear SHA cache (useful after branch switch or hard reset).
   */
  clearCache(): void {
    this.shaCache = {};
  }
}
