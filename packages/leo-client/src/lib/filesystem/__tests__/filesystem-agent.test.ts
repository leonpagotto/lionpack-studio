/**
 * FilesystemAgent Tests
 *
 * Comprehensive tests for AI-safe filesystem agent.
 * Tests permission checks, validation, batch operations, and history tracking.
 */

import { FilesystemAgent, type FileOperation } from '../filesystem-agent';
import { FilesystemService } from '../filesystem-service';

// Mock FilesystemService
jest.mock('../filesystem-service');

describe('FilesystemAgent', () => {
  let mockService: jest.Mocked<FilesystemService>;
  let agent: FilesystemAgent;

  beforeEach(() => {
    // Create mock service
    mockService = new FilesystemService() as jest.Mocked<FilesystemService>;

    // Setup default mock responses
    mockService.readFile = jest.fn().mockResolvedValue({
      ok: true,
      value: 'file content',
    });

    mockService.writeFile = jest.fn().mockResolvedValue({
      ok: true,
      value: undefined,
    });

    mockService.createFile = jest.fn().mockResolvedValue({
      ok: true,
      value: undefined,
    });

    mockService.deleteEntry = jest.fn().mockResolvedValue({
      ok: true,
      value: undefined,
    });

    mockService.renameEntry = jest.fn().mockResolvedValue({
      ok: true,
      value: undefined,
    });

    // Create agent with default config
    agent = new FilesystemAgent(mockService);
  });

  describe('Constructor & Configuration', () => {
    it('should create agent with default config', () => {
      const config = agent.getConfig();

      expect(config.allowedPaths).toEqual(['/']);
      expect(config.deniedPaths).toEqual([]);
      expect(config.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
      expect(config.maxBatchSize).toBe(100);
      expect(config.trackHistory).toBe(true);
    });

    it('should create agent with custom config', () => {
      const customAgent = new FilesystemAgent(mockService, {
        allowedPaths: ['/src', '/docs'],
        deniedPaths: ['/src/secrets'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxBatchSize: 50,
        trackHistory: false,
      });

      const config = customAgent.getConfig();

      expect(config.allowedPaths).toEqual(['/src', '/docs']);
      expect(config.deniedPaths).toEqual(['/src/secrets']);
      expect(config.maxFileSize).toBe(5 * 1024 * 1024);
      expect(config.maxBatchSize).toBe(50);
      expect(config.trackHistory).toBe(false);
    });

    it('should update config', () => {
      agent.updateConfig({
        allowedPaths: ['/custom'],
        maxFileSize: 1024,
      });

      const config = agent.getConfig();

      expect(config.allowedPaths).toEqual(['/custom']);
      expect(config.maxFileSize).toBe(1024);
      // Other configs unchanged
      expect(config.maxBatchSize).toBe(100);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      agent = new FilesystemAgent(mockService, {
        allowedPaths: ['/src', '/docs'],
        deniedPaths: ['/src/secrets.ts', '/docs/private'],
      });
    });

    describe('Allowed Paths', () => {
      it('should allow operations in allowed directories', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/index.ts',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
        expect(validation.violations).toHaveLength(0);
      });

      it('should allow operations in subdirectories of allowed paths', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/components/Button.tsx',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
        expect(validation.violations).toHaveLength(0);
      });

      it('should deny operations outside allowed directories', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/config/database.ts',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations).toHaveLength(1);
        expect(validation.violations[0].reason).toContain('outside allowed directories');
      });

      it('should allow operations with root allowed path', async () => {
        const rootAgent = new FilesystemAgent(mockService, {
          allowedPaths: ['/'],
        });

        const operation: FileOperation = {
          type: 'read',
          path: '/any/path/file.ts',
        };

        const validation = await rootAgent.validate([operation]);

        expect(validation.ok).toBe(true);
      });
    });

    describe('Denied Paths', () => {
      it('should deny operations on explicitly denied files', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/secrets.ts',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations).toHaveLength(1);
        expect(validation.violations[0].reason).toContain('explicitly denied');
      });

      it('should deny operations in denied directories', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/docs/private/sensitive.md',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations).toHaveLength(1);
      });

      it('should prioritize denied paths over allowed paths', async () => {
        // /src is allowed, but /src/secrets.ts is denied
        const operation: FileOperation = {
          type: 'write',
          path: '/src/secrets.ts',
          content: 'API_KEY=secret',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations[0].reason).toContain('explicitly denied');
      });
    });

    describe('Path Normalization', () => {
      it('should normalize paths with leading slashes', async () => {
        const op1: FileOperation = { type: 'read', path: '/src/index.ts' };
        const op2: FileOperation = { type: 'read', path: 'src/index.ts' };

        const val1 = await agent.validate([op1]);
        const val2 = await agent.validate([op2]);

        expect(val1.ok).toBe(val2.ok);
      });

      it('should normalize paths with trailing slashes', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/components/',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
      });

      it('should resolve parent directory references (..)', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/components/../index.ts', // Resolves to /src/index.ts
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
      });

      it('should resolve current directory references (.)', async () => {
        const operation: FileOperation = {
          type: 'read',
          path: '/src/./index.ts', // Resolves to /src/index.ts
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
      });
    });

    describe('Rename Permission Checks', () => {
      it('should check both source and destination paths for rename', async () => {
        const operation: FileOperation = {
          type: 'rename',
          path: '/src/old.ts',
          newPath: '/src/new.ts',
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(true);
      });

      it('should deny rename if destination is denied', async () => {
        const operation: FileOperation = {
          type: 'rename',
          path: '/src/file.ts',
          newPath: '/src/secrets.ts', // Denied path
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations[0].reason).toContain('explicitly denied');
      });

      it('should deny rename if destination is outside allowed paths', async () => {
        const operation: FileOperation = {
          type: 'rename',
          path: '/src/file.ts',
          newPath: '/config/file.ts', // Outside allowed
        };

        const validation = await agent.validate([operation]);

        expect(validation.ok).toBe(false);
        expect(validation.violations[0].reason).toContain('outside allowed directories');
      });
    });
  });

  describe('File Size Limits', () => {
    beforeEach(() => {
      agent = new FilesystemAgent(mockService, {
        maxFileSize: 1024, // 1KB for testing
      });
    });

    it('should allow files within size limit', async () => {
      const operation: FileOperation = {
        type: 'write',
        path: '/test.ts',
        content: 'small content',
      };

      const validation = await agent.validate([operation]);

      expect(validation.ok).toBe(true);
    });

    it('should deny files exceeding size limit (string)', async () => {
      const largeContent = 'x'.repeat(2000); // 2KB

      const operation: FileOperation = {
        type: 'write',
        path: '/test.ts',
        content: largeContent,
      };

      const validation = await agent.validate([operation]);

      expect(validation.ok).toBe(false);
      expect(validation.violations[0].reason).toContain('exceeds maximum');
    });

    it('should deny files exceeding size limit (Uint8Array)', async () => {
      const largeContent = new Uint8Array(2000); // 2KB

      const operation: FileOperation = {
        type: 'create',
        path: '/test.bin',
        content: largeContent,
      };

      const validation = await agent.validate([operation]);

      expect(validation.ok).toBe(false);
      expect(validation.violations[0].reason).toContain('exceeds maximum');
    });

    it('should not check size for read/delete/rename operations', async () => {
      const operations: FileOperation[] = [
        { type: 'read', path: '/test.ts' },
        { type: 'delete', path: '/test.ts' },
        { type: 'rename', path: '/old.ts', newPath: '/new.ts' },
      ];

      const validation = await agent.validate(operations);

      expect(validation.ok).toBe(true);
    });
  });

  describe('Batch Size Limits', () => {
    beforeEach(() => {
      agent = new FilesystemAgent(mockService, {
        maxBatchSize: 3,
      });
    });

    it('should allow batches within size limit', async () => {
      const operations: FileOperation[] = [
        { type: 'read', path: '/file1.ts' },
        { type: 'read', path: '/file2.ts' },
        { type: 'read', path: '/file3.ts' },
      ];

      const validation = await agent.validate(operations);

      expect(validation.ok).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should warn when batch exceeds size limit', async () => {
      const operations: FileOperation[] = [
        { type: 'read', path: '/file1.ts' },
        { type: 'read', path: '/file2.ts' },
        { type: 'read', path: '/file3.ts' },
        { type: 'read', path: '/file4.ts' },
        { type: 'read', path: '/file5.ts' },
      ];

      const validation = await agent.validate(operations);

      expect(validation.warnings).toHaveLength(1);
      expect(validation.warnings[0]).toContain('exceeds maximum');
      expect(validation.operations).toHaveLength(3); // Only first 3 processed
    });
  });

  describe('Validation', () => {
    it('should validate operations have required fields', async () => {
      const operations: FileOperation[] = [
        { type: 'rename', path: '/old.ts' } as FileOperation, // Missing newPath
        { type: 'write', path: '/test.ts' } as FileOperation, // Missing content
        { type: 'create', path: '/new.ts' } as FileOperation, // Missing content
      ];

      const validation = await agent.validate(operations);

      expect(validation.ok).toBe(false);
      expect(validation.violations).toHaveLength(3);
      expect(validation.violations[0].reason).toContain('requires newPath');
      expect(validation.violations[1].reason).toContain('requires content');
      expect(validation.violations[2].reason).toContain('requires content');
    });

    it('should return valid operations separately from violations', async () => {
      const operations: FileOperation[] = [
        { type: 'read', path: '/allowed.ts' },
        { type: 'read', path: '/denied.ts' }, // Will fail if denied
        { type: 'write', path: '/test.ts', content: 'content' },
      ];

      const deniedAgent = new FilesystemAgent(mockService, {
        deniedPaths: ['/denied.ts'],
      });

      const validation = await deniedAgent.validate(operations);

      expect(validation.ok).toBe(false);
      expect(validation.operations).toHaveLength(2); // 2 valid
      expect(validation.violations).toHaveLength(1); // 1 violation
    });
  });

  describe('Execute Single Operation', () => {
    it('should execute read operation', async () => {
      mockService.readFile = jest.fn().mockResolvedValue({
        ok: true,
        value: 'file content',
      });

      const operation: FileOperation = {
        type: 'read',
        path: '/test.ts',
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(true);
      expect(mockService.readFile).toHaveBeenCalledWith('/test.ts');
    });

    it('should execute write operation', async () => {
      const operation: FileOperation = {
        type: 'write',
        path: '/test.ts',
        content: 'new content',
        options: { overwrite: true },
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(true);
      expect(mockService.writeFile).toHaveBeenCalledWith(
        '/test.ts',
        'new content',
        { overwrite: true }
      );
    });

    it('should execute create operation', async () => {
      const operation: FileOperation = {
        type: 'create',
        path: '/new.ts',
        content: 'initial content',
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(true);
      expect(mockService.createFile).toHaveBeenCalledWith('/new.ts', 'initial content');
    });

    it('should execute delete operation', async () => {
      const operation: FileOperation = {
        type: 'delete',
        path: '/old.ts',
        options: { recursive: false },
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(true);
      expect(mockService.deleteEntry).toHaveBeenCalledWith('/old.ts', {
        recursive: false,
      });
    });

    it('should execute rename operation', async () => {
      const operation: FileOperation = {
        type: 'rename',
        path: '/old.ts',
        newPath: '/new.ts',
        options: { overwrite: false },
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(true);
      expect(mockService.renameEntry).toHaveBeenCalledWith('/old.ts', '/new.ts', {
        overwrite: false,
      });
    });

    it('should fail execution if permission denied', async () => {
      const deniedAgent = new FilesystemAgent(mockService, {
        deniedPaths: ['/secrets.ts'],
      });

      const operation: FileOperation = {
        type: 'write',
        path: '/secrets.ts',
        content: 'secret',
      };

      const result = await deniedAgent.execute(operation);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EACCES');
      expect(result.error?.message).toContain('denied');
      expect(mockService.writeFile).not.toHaveBeenCalled();
    });

    it('should handle filesystem errors', async () => {
      mockService.readFile = jest.fn().mockResolvedValue({
        ok: false,
        error: {
          code: 'ENOENT',
          message: 'File not found',
          path: '/missing.ts',
        },
      });

      const operation: FileOperation = {
        type: 'read',
        path: '/missing.ts',
      };

      const result = await agent.execute(operation);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENOENT');
      expect(result.error?.message).toBe('File not found');
    });

    it('should include timestamp in result', async () => {
      const beforeTime = Date.now();

      const operation: FileOperation = {
        type: 'read',
        path: '/test.ts',
      };

      const result = await agent.execute(operation);

      const afterTime = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Execute Batch', () => {
    it('should execute multiple operations in sequence', async () => {
      const operations: FileOperation[] = [
        { type: 'create', path: '/file1.ts', content: 'content1' },
        { type: 'create', path: '/file2.ts', content: 'content2' },
        { type: 'create', path: '/file3.ts', content: 'content3' },
      ];

      mockService.createFile.mockResolvedValue({ ok: true, value: undefined });

      const history = await agent.executeBatch(operations);

      expect(history.totalOperations).toBe(3);
      expect(history.successCount).toBe(3);
      expect(history.failureCount).toBe(0);
    });

    it('should stop on first error by default', async () => {
      const operations: FileOperation[] = [
        { type: 'create', path: '/file1.ts', content: 'content1' },
        { type: 'create', path: '/file2.ts', content: 'content2' },
        { type: 'create', path: '/file3.ts', content: 'content3' },
      ];

      mockService.createFile
        .mockResolvedValueOnce({ ok: true, value: undefined })
        .mockResolvedValueOnce({
          ok: false,
          error: { code: 'EEXIST', message: 'File exists' },
        });

      const history = await agent.executeBatch(operations);

      expect(history.totalOperations).toBe(2); // Stopped after 2nd
      expect(history.successCount).toBe(1);
      expect(history.failureCount).toBe(1);
    });

    it('should continue on error when continueOnError is true', async () => {
      const operations: FileOperation[] = [
        { type: 'create', path: '/file1.ts', content: 'content1' },
        { type: 'create', path: '/file2.ts', content: 'content2' },
        { type: 'create', path: '/file3.ts', content: 'content3' },
      ];

      mockService.createFile
        .mockResolvedValueOnce({ ok: true, value: undefined })
        .mockResolvedValueOnce({
          ok: false,
          error: { code: 'EEXIST', message: 'File exists' },
        })
        .mockResolvedValueOnce({ ok: true, value: undefined });

      const history = await agent.executeBatch(operations, {
        continueOnError: true,
      });

      expect(history.totalOperations).toBe(3);
      expect(history.successCount).toBe(2);
      expect(history.failureCount).toBe(1);
    });

    it('should include start and end times', async () => {
      const beforeTime = Date.now();

      const operations: FileOperation[] = [
        { type: 'read', path: '/test.ts' },
      ];

      const history = await agent.executeBatch(operations);

      const afterTime = Date.now();

      expect(history.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(history.endTime).toBeLessThanOrEqual(afterTime);
      expect(history.endTime!).toBeGreaterThanOrEqual(history.startTime);
    });
  });

  describe('Operation History', () => {
    it('should track operation history by default', async () => {
      expect(agent.getHistory()).toHaveLength(0);

      await agent.execute({ type: 'read', path: '/test1.ts' });
      await agent.execute({ type: 'read', path: '/test2.ts' });

      const history = agent.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].operation.path).toBe('/test1.ts');
      expect(history[1].operation.path).toBe('/test2.ts');
    });

    it('should not track history when trackHistory is false', async () => {
      const noHistoryAgent = new FilesystemAgent(mockService, {
        trackHistory: false,
      });

      await noHistoryAgent.execute({ type: 'read', path: '/test.ts' });

      expect(noHistoryAgent.getHistory()).toHaveLength(0);
    });

    it('should track failed operations in history', async () => {
      const deniedAgent = new FilesystemAgent(mockService, {
        deniedPaths: ['/secrets.ts'],
      });

      await deniedAgent.execute({
        type: 'write',
        path: '/secrets.ts',
        content: 'secret',
      });

      const history = deniedAgent.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(false);
      expect(history[0].error).toBeDefined();
    });

    it('should clear history', async () => {
      await agent.execute({ type: 'read', path: '/test1.ts' });
      await agent.execute({ type: 'read', path: '/test2.ts' });

      expect(agent.getHistory()).toHaveLength(2);

      agent.clearHistory();

      expect(agent.getHistory()).toHaveLength(0);
    });

    it('should return copy of history (immutable)', async () => {
      await agent.execute({ type: 'read', path: '/test.ts' });

      const history1 = agent.getHistory();
      const history2 = agent.getHistory();

      expect(history1).not.toBe(history2); // Different arrays
      expect(history1).toEqual(history2); // Same content
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty batch', async () => {
      const history = await agent.executeBatch([]);

      expect(history.totalOperations).toBe(0);
      expect(history.successCount).toBe(0);
      expect(history.failureCount).toBe(0);
    });

    it('should handle unknown operation type', async () => {
      // Create agent with allowed path first
      const testAgent = new FilesystemAgent(mockService, {
        allowedPaths: ['/'],
      });

      const invalidOp = {
        type: 'invalid',
        path: '/test.ts',
      } as any;

      const result = await testAgent.execute(invalidOp);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unknown operation type');
    });

    it('should handle exception during execution', async () => {
      const testAgent = new FilesystemAgent(mockService, {
        allowedPaths: ['/'],
      });

      mockService.readFile.mockRejectedValueOnce(new Error('Network error'));

      const operation: FileOperation = {
        type: 'read',
        path: '/test.ts',
      };

      const result = await testAgent.execute(operation);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });

    it('should handle paths with special characters', async () => {
      const testAgent = new FilesystemAgent(mockService, {
        allowedPaths: ['/src'],
      });

      const operation: FileOperation = {
        type: 'read',
        path: '/src/файл.ts', // Cyrillic characters
      };

      const validation = await testAgent.validate([operation]);

      expect(validation.ok).toBe(true);
    });

    it('should handle very long paths', async () => {
      const testAgent = new FilesystemAgent(mockService, {
        allowedPaths: ['/src'],
      });

      const longPath = '/src/' + 'very-long-name/'.repeat(50) + 'file.ts';

      const operation: FileOperation = {
        type: 'read',
        path: longPath,
      };

      const validation = await testAgent.validate([operation]);

      expect(validation.ok).toBe(true);
    });
  });
});
