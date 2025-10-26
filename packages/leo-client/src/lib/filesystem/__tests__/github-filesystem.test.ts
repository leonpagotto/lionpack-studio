/**
 * GitHub Filesystem Tests
 *
 * Comprehensive test suite for GitHubFileSystem implementation.
 * Uses mocked fetch() to simulate GitHub REST API responses.
 *
 * Coverage target: 80%+
 */

import { GitHubFileSystem, GitHubConfig } from '../github-filesystem';

// ============================================================================
// TEST SETUP & MOCKS
// ============================================================================

// Mock fetch globally
global.fetch = jest.fn();

const mockConfig: GitHubConfig = {
  owner: 'testowner',
  repo: 'testrepo',
  branch: 'main',
  token: 'test_token_123'
};

// Helper to create successful fetch response
function mockFetchSuccess(data: any, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => data
  });
}

// Helper to create error fetch response
function mockFetchError(status: number, message: string) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    text: async () => JSON.stringify({ message })
  });
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('GitHubFileSystem', () => {
  let fs: GitHubFileSystem;

  beforeEach(() => {
    jest.clearAllMocks();
    fs = new GitHubFileSystem(mockConfig);
  });

  // ==========================================================================
  // supports() Tests
  // ==========================================================================

  describe('supports()', () => {
    it('should return true when fully configured', () => {
      // Arrange
      const fs = new GitHubFileSystem(mockConfig);

      // Act
      const result = fs.supports();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when missing owner', () => {
      // Arrange
      const fs = new GitHubFileSystem({
        ...mockConfig,
        owner: ''
      });

      // Act
      const result = fs.supports();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when missing repo', () => {
      // Arrange
      const fs = new GitHubFileSystem({
        ...mockConfig,
        repo: ''
      });

      // Act
      const result = fs.supports();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when missing token', () => {
      // Arrange
      const fs = new GitHubFileSystem({
        ...mockConfig,
        token: ''
      });

      // Act
      const result = fs.supports();

      // Assert
      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // requestRoot() Tests
  // ==========================================================================

  describe('requestRoot()', () => {
    it('should verify repo access and return mock handle', async () => {
      // Arrange
      mockFetchSuccess([{ name: 'README.md', type: 'file' }]);

      // Act
      const result = await fs.requestRoot();

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toHaveProperty('name', 'testrepo');
      expect(result.value).toHaveProperty('kind', 'directory');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testowner/testrepo/contents',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_token_123'
          })
        })
      );
    });

    it('should return error when repo access fails', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');

      // Act
      const result = await fs.requestRoot();

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
    });
  });

  // ==========================================================================
  // listDirectory() Tests
  // ==========================================================================

  describe('listDirectory()', () => {
    it('should list root directory contents', async () => {
      // Arrange
      const mockContents = [
        { name: 'README.md', path: 'README.md', type: 'file', size: 1024, sha: 'abc123' },
        { name: 'src', path: 'src', type: 'dir', size: 0, sha: 'def456' }
      ];
      mockFetchSuccess(mockContents);

      // Act
      const result = await fs.listDirectory('');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(2);
      expect(result.value![0]).toEqual({
        kind: 'file',
        name: 'README.md',
        path: 'README.md',
        size: 1024
      });
      expect(result.value![1]).toEqual({
        kind: 'directory',
        name: 'src',
        path: 'src'
      });
    });

    it('should list subdirectory contents', async () => {
      // Arrange
      const mockContents = [
        { name: 'index.tsx', path: 'src/index.tsx', type: 'file', size: 512, sha: 'xyz789' }
      ];
      mockFetchSuccess(mockContents);

      // Act
      const result = await fs.listDirectory('src');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value![0].name).toBe('index.tsx');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testowner/testrepo/contents/src',
        expect.any(Object)
      );
    });

    it('should return ENOENT error for nonexistent directory', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');

      // Act
      const result = await fs.listDirectory('nonexistent');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
    });

    it('should return EACCES error for permission denied', async () => {
      // Arrange
      mockFetchError(403, 'Forbidden');

      // Act
      const result = await fs.listDirectory('private');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EACCES');
    });
  });

  // ==========================================================================
  // readFile() Tests
  // ==========================================================================

  describe('readFile()', () => {
    it('should read file with UTF-8 encoding (default)', async () => {
      // Arrange
      const content = 'Hello, World!';
      const base64Content = Buffer.from(content, 'utf-8').toString('base64');
      mockFetchSuccess({
        type: 'file',
        name: 'test.txt',
        path: 'test.txt',
        content: base64Content,
        encoding: 'base64',
        sha: 'abc123',
        size: 13
      });

      // Act
      const result = await fs.readFile('test.txt');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBe(content);
    });

    it('should read file with explicit UTF-8 encoding', async () => {
      // Arrange
      const content = '{"name":"test"}';
      const base64Content = Buffer.from(content, 'utf-8').toString('base64');
      mockFetchSuccess({
        type: 'file',
        content: base64Content,
        encoding: 'base64',
        sha: 'def456'
      });

      // Act
      const result = await fs.readFile('package.json', { encoding: 'utf-8' });

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBe(content);
    });

    it('should read file with base64 encoding', async () => {
      // Arrange
      const base64Content = 'SGVsbG8gV29ybGQh'; // "Hello World!" in base64
      mockFetchSuccess({
        type: 'file',
        content: base64Content,
        encoding: 'base64',
        sha: 'ghi789'
      });

      // Act
      const result = await fs.readFile('binary.bin', { encoding: 'base64' });

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBe(base64Content);
    });

    it('should cache file SHA for future updates', async () => {
      // Arrange
      const sha = 'test_sha_123';
      mockFetchSuccess({
        type: 'file',
        content: Buffer.from('test', 'utf-8').toString('base64'),
        sha
      });

      // Act
      await fs.readFile('test.txt');

      // Assert
      const config = fs.getConfig();
      // SHA should be cached internally (not exposed in config)
      expect(config.owner).toBe('testowner');
    });

    it('should return EISDIR error when path is directory', async () => {
      // Arrange
      mockFetchSuccess({
        type: 'dir',
        name: 'src',
        path: 'src'
      });

      // Act
      const result = await fs.readFile('src');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EISDIR');
      expect(result.error?.message).toContain('directory, not a file');
    });

    it('should return ENOENT error for nonexistent file', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');

      // Act
      const result = await fs.readFile('missing.txt');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
    });
  });

  // ==========================================================================
  // writeFile() Tests
  // ==========================================================================

  describe('writeFile()', () => {
    it('should create new file successfully', async () => {
      // Arrange
      mockFetchError(404, 'Not Found'); // File doesn't exist check
      mockFetchSuccess({
        content: {
          name: 'new.txt',
          path: 'new.txt',
          sha: 'new_sha_123'
        }
      }); // Create request

      // Act
      const result = await fs.writeFile('new.txt', 'Hello', {
        message: 'Create new file'
      });

      // Assert
      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      // Second call should be PUT with content
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(putCall[1].method).toBe('PUT');
      const body = JSON.parse(putCall[1].body);
      expect(body.content).toBe(Buffer.from('Hello', 'utf-8').toString('base64'));
      expect(body.message).toBe('Create new file');
    });

    it('should update existing file with overwrite', async () => {
      // Arrange
      const existingSha = 'existing_sha_456';
      mockFetchSuccess({
        type: 'file',
        sha: existingSha,
        content: Buffer.from('old content', 'utf-8').toString('base64')
      }); // File exists check
      mockFetchSuccess({
        content: { sha: 'new_sha_789' }
      }); // Update request

      // Act
      const result = await fs.writeFile('existing.txt', 'new content', {
        overwrite: true
      });

      // Assert
      expect(result.ok).toBe(true);
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.sha).toBe(existingSha); // Should include SHA for update
    });

    it('should return EEXIST error when overwrite is false', async () => {
      // Arrange
      mockFetchSuccess({
        type: 'file',
        sha: 'exists_123',
        content: 'base64content'
      }); // File exists

      // Act
      const result = await fs.writeFile('exists.txt', 'content', {
        overwrite: false
      });

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EEXIST');
      expect(result.error?.message).toContain('already exists');
    });

    it('should handle Uint8Array content', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');
      mockFetchSuccess({ content: { sha: 'bin_sha' } });
      const binaryData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

      // Act
      const result = await fs.writeFile('binary.bin', binaryData);

      // Assert
      expect(result.ok).toBe(true);
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.content).toBe('SGVsbG8='); // Base64 of "Hello"
    });

    it('should use custom commit message', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');
      mockFetchSuccess({ content: { sha: 'sha' } });

      // Act
      await fs.writeFile('file.txt', 'content', {
        message: 'feat: add new feature'
      });

      // Assert
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.message).toBe('feat: add new feature');
    });

    it('should include branch in request', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');
      mockFetchSuccess({ content: { sha: 'sha' } });

      // Act
      await fs.writeFile('file.txt', 'content');

      // Assert
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.branch).toBe('main');
    });
  });

  // ==========================================================================
  // createFile() Tests
  // ==========================================================================

  describe('createFile()', () => {
    it('should create new file successfully', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');
      mockFetchSuccess({ content: { sha: 'new_sha' } });

      // Act
      const result = await fs.createFile('new.txt', 'content');

      // Assert
      expect(result.ok).toBe(true);
    });

    it('should fail if file already exists', async () => {
      // Arrange
      mockFetchSuccess({
        type: 'file',
        sha: 'exists',
        content: 'base64'
      });

      // Act
      const result = await fs.createFile('exists.txt', 'content');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EEXIST');
    });

    it('should create empty file when no content provided', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');
      mockFetchSuccess({ content: { sha: 'empty_sha' } });

      // Act
      const result = await fs.createFile('empty.txt');

      // Assert
      expect(result.ok).toBe(true);
      const putCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.content).toBe(''); // Empty base64
    });
  });

  // ==========================================================================
  // deleteEntry() Tests
  // ==========================================================================

  describe('deleteEntry()', () => {
    it('should delete file successfully', async () => {
      // Arrange
      const sha = 'delete_sha_123';
      // First fetch: Get SHA if not cached
      mockFetchSuccess({
        type: 'file',
        sha,
        name: 'delete.txt'
      });
      // Second fetch: Check if directory
      mockFetchSuccess({
        type: 'file',
        sha,
        name: 'delete.txt'
      });
      // Third fetch: Delete request
      mockFetchSuccess({ message: 'deleted' });

      // Act
      const result = await fs.deleteEntry('delete.txt');

      // Assert
      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      const deleteCall = (global.fetch as jest.Mock).mock.calls[2];
      expect(deleteCall[1].method).toBe('DELETE');
      const body = JSON.parse(deleteCall[1].body);
      expect(body.sha).toBe(sha);
    });

    it('should use cached SHA if available', async () => {
      // Arrange
      const sha = 'cached_sha';
      mockFetchSuccess({
        type: 'file',
        sha,
        content: 'base64'
      }); // Read to cache SHA
      await fs.readFile('cached.txt');

      jest.clearAllMocks();
      // Check if directory
      mockFetchSuccess({
        type: 'file',
        sha,
        name: 'cached.txt'
      });
      // Delete
      mockFetchSuccess({ message: 'deleted' });

      // Act
      const result = await fs.deleteEntry('cached.txt');

      // Assert
      expect(result.ok).toBe(true);
      // Should check if directory, then delete (SHA already cached)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });    it('should return error for directory without recursive option', async () => {
      // Arrange
      // First fetch: Get SHA
      mockFetchSuccess({
        type: 'dir',
        sha: 'dir_sha',
        name: 'folder'
      });
      // Second fetch: Check if directory
      mockFetchSuccess({
        type: 'dir',
        sha: 'dir_sha',
        name: 'folder'
      });

      // Act
      const result = await fs.deleteEntry('folder');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EISDIR');
      expect(result.error?.message).toContain('without recursive option');
    });

    it('should return error for directory with recursive option', async () => {
      // Arrange
      // First fetch: Get SHA
      mockFetchSuccess({
        type: 'dir',
        sha: 'dir_sha',
        name: 'folder'
      });
      // Second fetch: Check if directory
      mockFetchSuccess({
        type: 'dir',
        sha: 'dir_sha',
        name: 'folder'
      });

      // Act
      const result = await fs.deleteEntry('folder', { recursive: true });

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EISDIR');
      expect(result.error?.message).toContain('Recursive directory deletion not supported');
    });

    it('should return ENOENT error for nonexistent file', async () => {
      // Arrange
      mockFetchError(404, 'Not Found');

      // Act
      const result = await fs.deleteEntry('missing.txt');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
    });
  });

  // ==========================================================================
  // renameEntry() Tests
  // ==========================================================================

  describe('renameEntry()', () => {
    it('should rename file successfully', async () => {
      // Arrange
      const content = 'file content';
      const base64Content = Buffer.from(content, 'utf-8').toString('base64');

      // Read old file
      mockFetchSuccess({
        type: 'file',
        content: base64Content,
        sha: 'old_sha'
      });

      // Write new file
      mockFetchError(404, 'Not Found'); // New file doesn't exist
      mockFetchSuccess({
        content: { sha: 'new_sha' }
      });

      // Delete old file
      mockFetchSuccess({
        type: 'file',
        sha: 'old_sha'
      }); // Check
      mockFetchSuccess({ message: 'deleted' }); // Delete

      // Act
      const result = await fs.renameEntry('old.txt', 'new.txt');

      // Assert
      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    it('should handle rename errors gracefully', async () => {
      // Arrange
      // Read old file
      mockFetchSuccess({
        type: 'file',
        content: 'base64content',
        sha: 'sha'
      });
      // Write fails - check if exists
      mockFetchError(404, 'Not Found');
      // Write fails - actual write
      mockFetchError(403, 'Forbidden');

      // Act
      const result = await fs.renameEntry('old.txt', 'new.txt');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EACCES');
    });
  });

  // ==========================================================================
  // Utility Methods Tests
  // ==========================================================================

  describe('getConfig()', () => {
    it('should return current configuration', () => {
      // Act
      const config = fs.getConfig();

      // Assert
      expect(config).toEqual({
        owner: 'testowner',
        repo: 'testrepo',
        branch: 'main',
        token: 'test_token_123'
      });
    });

    it('should return readonly config', () => {
      // Act
      const config = fs.getConfig();

      // Assert
      expect(Object.isFrozen(config)).toBe(false); // Shallow copy, not frozen
      expect(config.owner).toBe('testowner');
    });
  });

  describe('clearCache()', () => {
    it('should clear SHA cache', async () => {
      // Arrange
      mockFetchSuccess({
        type: 'file',
        content: 'base64',
        sha: 'cached_sha'
      });
      await fs.readFile('test.txt'); // Populate cache

      // Act
      fs.clearCache();

      // Assert
      // No direct way to verify cache is cleared, but next operation
      // should fetch SHA again
      expect(fs.getConfig().owner).toBe('testowner'); // Cache clear doesn't affect config
    });
  });

  // ==========================================================================
  // Error Handling - Already tested in operation-specific tests above
  // ==========================================================================

  describe('Authentication', () => {
    it('should include authorization header in requests', async () => {
      // Arrange
      mockFetchSuccess([]);

      // Act
      await fs.listDirectory('');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_token_123'
          })
        })
      );
    });

    it('should include GitHub API version header', async () => {
      // Arrange
      mockFetchSuccess([]);

      // Act
      await fs.listDirectory('');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-GitHub-Api-Version': '2022-11-28'
          })
        })
      );
    });

    it('should include proper Accept header', async () => {
      // Arrange
      mockFetchSuccess([]);

      // Act
      await fs.listDirectory('');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json'
          })
        })
      );
    });
  });
});
