/**
 * FilesystemService Tests
 * 
 * Comprehensive test suite for FilesystemService wrapper.
 * Tests source switching, error handling, and convenience methods.
 * 
 * Coverage target: 80%+
 */

import { FilesystemService } from '../filesystem-service';
import { LocalFileSystem } from '../local-filesystem';
import { GitHubFileSystem } from '../github-filesystem';

// ============================================================================
// TEST SETUP & MOCKS
// ============================================================================

// Mock LocalFileSystem
jest.mock('../local-filesystem');
const MockedLocalFileSystem = LocalFileSystem as jest.MockedClass<typeof LocalFileSystem>;

// Mock GitHubFileSystem
jest.mock('../github-filesystem');
const MockedGitHubFileSystem = GitHubFileSystem as jest.MockedClass<typeof GitHubFileSystem>;

describe('FilesystemService', () => {
  let service: FilesystemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FilesystemService();
  });

  // ==========================================================================
  // Construction Tests
  // ==========================================================================

  describe('constructor()', () => {
    it('should create service instance', () => {
      expect(service).toBeInstanceOf(FilesystemService);
    });

    it('should initialize with no active source', () => {
      expect(service.isConnected()).toBe(false);
      expect(service.getCurrentSource()).toBeNull();
    });

    it('should accept configuration', () => {
      const service = new FilesystemService({
        defaultSource: 'local',
        autoReconnect: false
      });
      expect(service).toBeInstanceOf(FilesystemService);
    });
  });

  // ==========================================================================
  // Source Management Tests
  // ==========================================================================

  describe('useLocal()', () => {
    it('should switch to local source when supported', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);

      // Act
      const result = await service.useLocal();

      // Assert
      expect(result.ok).toBe(true);
      expect(service.getCurrentSource()).toBe('local');
      expect(service.isConnected()).toBe(true);
    });

    it('should return error when File System Access API not supported', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(false);

      // Act
      const result = await service.useLocal();

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('UNKNOWN');
      expect(result.error?.message).toContain('not supported');
    });

    it('should disconnect GitHub when switching to local', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: { kind: 'directory', name: 'repo' } as any
      });

      await service.useGitHub({ owner: 'user', repo: 'repo', token: 'token' });

      // Act
      await service.useLocal();

      // Assert
      expect(service.getCurrentSource()).toBe('local');
    });
  });

  describe('useGitHub()', () => {
    it('should switch to GitHub source when config valid', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: { kind: 'directory', name: 'repo' } as any
      });

      // Act
      const result = await service.useGitHub(config);

      // Assert
      expect(result.ok).toBe(true);
      expect(service.getCurrentSource()).toBe('github');
      expect(service.isConnected()).toBe(true);
    });

    it('should return error when config incomplete', async () => {
      // Arrange
      const config = { owner: '', repo: '', token: '' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(false);

      // Act
      const result = await service.useGitHub(config);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('UNKNOWN');
      expect(result.error?.message).toContain('incomplete');
    });

    it('should return error when connection verification fails', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'bad_token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: false,
        error: { code: 'EACCES', message: 'Unauthorized' }
      });

      // Act
      const result = await service.useGitHub(config);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EACCES');
    });

    it('should store config for reconnection', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: { kind: 'directory' } as any
      });

      // Act
      await service.useGitHub(config);
      const reconnectResult = await service.reconnectGitHub();

      // Assert
      expect(reconnectResult.ok).toBe(true);
    });
  });

  describe('disconnect()', () => {
    it('should clear current source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      await service.useLocal();

      // Act
      service.disconnect();

      // Assert
      expect(service.isConnected()).toBe(false);
      expect(service.getCurrentSource()).toBeNull();
    });
  });

  describe('getSourceInfo()', () => {
    it('should return local source info', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      await service.useLocal();

      // Act
      const info = service.getSourceInfo();

      // Assert
      expect(info.type).toBe('local');
      expect(info.connected).toBe(true);
      expect(info.displayName).toBe('Local Files');
    });

    it('should return GitHub source info', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: {} as any
      });
      MockedGitHubFileSystem.prototype.getConfig.mockReturnValue(config);
      await service.useGitHub(config);

      // Act
      const info = service.getSourceInfo();

      // Assert
      expect(info.type).toBe('github');
      expect(info.connected).toBe(true);
      expect(info.displayName).toBe('user/repo');
    });

    it('should return not connected info when no source', () => {
      // Act
      const info = service.getSourceInfo();

      // Assert
      expect(info.type).toBeNull();
      expect(info.connected).toBe(false);
      expect(info.displayName).toBe('Not Connected');
    });
  });

  // ==========================================================================
  // Filesystem Operations Tests
  // ==========================================================================

  describe('listDirectory()', () => {
    it('should return error when not connected', async () => {
      // Act
      const result = await service.listDirectory('/src');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EBADF');
      expect(result.error?.message).toContain('Not connected');
    });

    it('should delegate to local filesystem when connected', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.listDirectory.mockResolvedValue({
        ok: true,
        value: [{ kind: 'file', name: 'test.txt', path: 'test.txt' }]
      });
      await service.useLocal();

      // Act
      const result = await service.listDirectory('/');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(MockedLocalFileSystem.prototype.listDirectory).toHaveBeenCalledWith('/');
    });

    it('should delegate to GitHub filesystem when connected', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: {} as any
      });
      MockedGitHubFileSystem.prototype.listDirectory.mockResolvedValue({
        ok: true,
        value: [{ kind: 'file', name: 'README.md', path: 'README.md' }]
      });
      await service.useGitHub(config);

      // Act
      const result = await service.listDirectory('/');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value![0].name).toBe('README.md');
    });
  });

  describe('readFile()', () => {
    it('should return error when not connected', async () => {
      // Act
      const result = await service.readFile('test.txt');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EBADF');
    });

    it('should read file from active source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.readFile.mockResolvedValue({
        ok: true,
        value: 'file content'
      });
      await service.useLocal();

      // Act
      const result = await service.readFile('test.txt');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBe('file content');
    });
  });

  describe('writeFile()', () => {
    it('should return error when not connected', async () => {
      // Act
      const result = await service.writeFile('test.txt', 'content');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('EBADF');
    });

    it('should write file to active source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.writeFile.mockResolvedValue({
        ok: true,
        value: undefined
      });
      await service.useLocal();

      // Act
      const result = await service.writeFile('test.txt', 'content');

      // Assert
      expect(result.ok).toBe(true);
      expect(MockedLocalFileSystem.prototype.writeFile).toHaveBeenCalledWith(
        'test.txt',
        'content',
        undefined
      );
    });
  });

  describe('createFile()', () => {
    it('should create file in active source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.createFile.mockResolvedValue({
        ok: true,
        value: undefined
      });
      await service.useLocal();

      // Act
      const result = await service.createFile('new.txt', 'content');

      // Assert
      expect(result.ok).toBe(true);
    });
  });

  describe('deleteEntry()', () => {
    it('should delete entry from active source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.deleteEntry.mockResolvedValue({
        ok: true,
        value: undefined
      });
      await service.useLocal();

      // Act
      const result = await service.deleteEntry('test.txt');

      // Assert
      expect(result.ok).toBe(true);
    });
  });

  describe('renameEntry()', () => {
    it('should rename entry in active source', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.renameEntry.mockResolvedValue({
        ok: true,
        value: undefined
      });
      await service.useLocal();

      // Act
      const result = await service.renameEntry('old.txt', 'new.txt');

      // Assert
      expect(result.ok).toBe(true);
    });
  });

  // ==========================================================================
  // Convenience Methods Tests
  // ==========================================================================

  describe('readJSON()', () => {
    it('should read and parse JSON file', async () => {
      // Arrange
      const jsonData = { name: 'test', version: '1.0.0' };
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.readFile.mockResolvedValue({
        ok: true,
        value: JSON.stringify(jsonData)
      });
      await service.useLocal();

      // Act
      const result = await service.readJSON('package.json');

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toEqual(jsonData);
    });

    it('should return error for invalid JSON', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.readFile.mockResolvedValue({
        ok: true,
        value: 'not valid json{'
      });
      await service.useLocal();

      // Act
      const result = await service.readJSON('bad.json');

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.message).toContain('Invalid JSON');
    });
  });

  describe('writeJSON()', () => {
    it('should serialize and write JSON file', async () => {
      // Arrange
      const data = { name: 'test', value: 123 };
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.writeFile.mockResolvedValue({
        ok: true,
        value: undefined
      });
      await service.useLocal();

      // Act
      const result = await service.writeJSON('data.json', data);

      // Assert
      expect(result.ok).toBe(true);
      expect(MockedLocalFileSystem.prototype.writeFile).toHaveBeenCalledWith(
        'data.json',
        JSON.stringify(data, null, 2),
        undefined
      );
    });
  });

  describe('exists()', () => {
    it('should return true when file exists', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.readFile.mockResolvedValue({
        ok: true,
        value: 'content'
      });
      await service.useLocal();

      // Act
      const exists = await service.exists('test.txt');

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      MockedLocalFileSystem.prototype.readFile.mockResolvedValue({
        ok: false,
        error: { code: 'ENOENT', message: 'Not found' }
      });
      await service.useLocal();

      // Act
      const exists = await service.exists('missing.txt');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('clearCache()', () => {
    it('should clear GitHub filesystem cache when connected', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: {} as any
      });
      MockedGitHubFileSystem.prototype.clearCache.mockReturnValue();
      await service.useGitHub(config);

      // Act
      service.clearCache();

      // Assert
      expect(MockedGitHubFileSystem.prototype.clearCache).toHaveBeenCalled();
    });

    it('should do nothing when not using GitHub', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      await service.useLocal();

      // Act & Assert (should not throw)
      service.clearCache();
    });
  });

  describe('reconnectGitHub()', () => {
    it('should reconnect to last GitHub source', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: {} as any
      });
      await service.useGitHub(config);
      service.disconnect();

      // Act
      const result = await service.reconnectGitHub();

      // Assert
      expect(result.ok).toBe(true);
      expect(service.getCurrentSource()).toBe('github');
    });

    it('should return error when no previous connection', async () => {
      // Act
      const result = await service.reconnectGitHub();

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
      expect(result.error?.message).toContain('No previous');
    });
  });

  // ==========================================================================
  // supports() Tests
  // ==========================================================================

  describe('supports()', () => {
    it('should return false when not connected', () => {
      expect(service.supports()).toBe(false);
    });

    it('should return true when connected to local', async () => {
      // Arrange
      MockedLocalFileSystem.prototype.supports.mockReturnValue(true);
      await service.useLocal();

      // Act & Assert
      expect(service.supports()).toBe(true);
    });

    it('should return true when connected to GitHub', async () => {
      // Arrange
      const config = { owner: 'user', repo: 'repo', token: 'token' };
      MockedGitHubFileSystem.prototype.supports.mockReturnValue(true);
      MockedGitHubFileSystem.prototype.requestRoot.mockResolvedValue({
        ok: true,
        value: {} as any
      });
      await service.useGitHub(config);

      // Act & Assert
      expect(service.supports()).toBe(true);
    });
  });
});
