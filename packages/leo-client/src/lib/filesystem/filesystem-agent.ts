/**
 * Filesystem Agent
 *
 * AI-safe wrapper around FilesystemService for autonomous file operations.
 * Provides permission checks, validation, and batch operations for AI agents.
 *
 * @example
 * ```typescript
 * const agent = new FilesystemAgent(filesystemService, {
 *   allowedPaths: ['/src', '/docs'],
 *   deniedPaths: ['/src/config/secrets.ts'],
 * });
 *
 * // Validate before executing
 * const validation = await agent.validate([
 *   { type: 'write', path: '/src/index.ts', content: '...' },
 *   { type: 'create', path: '/src/utils.ts', content: '...' },
 * ]);
 *
 * if (validation.ok) {
 *   const result = await agent.executeBatch(validation.operations);
 * }
 * ```
 */

import { FilesystemService } from './filesystem-service';
import type {
  FilesystemResult,
  FilesystemError,
  WriteFileOptions,
  DeleteEntryOptions,
  RenameEntryOptions,
} from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type OperationType = 'read' | 'write' | 'create' | 'delete' | 'rename';

export interface FileOperation {
  type: OperationType;
  path: string;
  content?: string | Uint8Array;
  newPath?: string; // For rename operations
  options?: WriteFileOptions | DeleteEntryOptions | RenameEntryOptions;
}

export interface OperationResult {
  operation: FileOperation;
  success: boolean;
  error?: FilesystemError;
  timestamp: number;
}

export interface ValidationResult {
  ok: boolean;
  operations: FileOperation[];
  violations: PermissionViolation[];
  warnings: string[];
}

export interface PermissionViolation {
  operation: FileOperation;
  reason: string;
  path: string;
}

export interface FilesystemAgentConfig {
  /** Paths that operations are allowed in (e.g., ['/src', '/docs']) */
  allowedPaths?: string[];
  /** Paths that operations are explicitly denied (e.g., ['/config/secrets.ts']) */
  deniedPaths?: string[];
  /** Maximum file size for write operations (bytes, default 10MB) */
  maxFileSize?: number;
  /** Maximum number of operations in a batch (default 100) */
  maxBatchSize?: number;
  /** Enable operation history tracking (default true) */
  trackHistory?: boolean;
}

export interface OperationHistory {
  operations: OperationResult[];
  startTime: number;
  endTime?: number;
  totalOperations: number;
  successCount: number;
  failureCount: number;
}

// ============================================================================
// FILESYSTEM AGENT
// ============================================================================

/**
 * AI-safe filesystem agent with permission controls.
 *
 * Features:
 * - Path-based permission system
 * - Dry-run validation before execution
 * - Batch operation support
 * - Operation history for audit/undo
 * - File size limits
 * - Denied path protection
 */
export class FilesystemAgent {
  private fs: FilesystemService;
  private config: Required<FilesystemAgentConfig>;
  private history: OperationResult[] = [];

  constructor(
    filesystemService: FilesystemService,
    config: FilesystemAgentConfig = {}
  ) {
    this.fs = filesystemService;
    this.config = {
      allowedPaths: config.allowedPaths || ['/'],
      deniedPaths: config.deniedPaths || [],
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxBatchSize: config.maxBatchSize || 100,
      trackHistory: config.trackHistory !== false,
    };
  }

  // ==========================================================================
  // PERMISSION CHECKING
  // ==========================================================================

  /**
   * Check if an operation is allowed on the given path.
   */
  private checkPermission(operation: FileOperation): PermissionViolation | null {
    const { type, path, newPath } = operation;

    // Check denied paths first (highest priority)
    if (this.isDeniedPath(path)) {
      return {
        operation,
        reason: 'Path is explicitly denied',
        path,
      };
    }

    // Check if path is within allowed paths
    if (!this.isAllowedPath(path)) {
      return {
        operation,
        reason: 'Path is outside allowed directories',
        path,
      };
    }

    // For rename operations, check destination path too
    if (type === 'rename' && newPath) {
      if (this.isDeniedPath(newPath)) {
        return {
          operation,
          reason: 'Destination path is explicitly denied',
          path: newPath,
        };
      }

      if (!this.isAllowedPath(newPath)) {
        return {
          operation,
          reason: 'Destination path is outside allowed directories',
          path: newPath,
        };
      }
    }

    return null;
  }

  /**
   * Check if path is in allowed paths.
   */
  private isAllowedPath(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    return this.config.allowedPaths.some((allowed) => {
      const normalizedAllowed = this.normalizePath(allowed);

      // Special case: root path (/) allows everything
      if (normalizedAllowed === '') {
        return true;
      }

      return (
        normalizedPath === normalizedAllowed ||
        normalizedPath.startsWith(normalizedAllowed + '/')
      );
    });
  }

  /**
   * Check if path is explicitly denied.
   */
  private isDeniedPath(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    return this.config.deniedPaths.some((denied) => {
      const normalizedDenied = this.normalizePath(denied);
      return (
        normalizedPath === normalizedDenied ||
        normalizedPath.startsWith(normalizedDenied + '/')
      );
    });
  }

  /**
   * Normalize path for comparison (remove leading/trailing slashes, resolve ..).
   */
  private normalizePath(path: string): string {
    // Remove leading slash for consistency
    let normalized = path.startsWith('/') ? path.slice(1) : path;

    // Remove trailing slash
    if (normalized.endsWith('/') && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }

    // Resolve .. and . (simple implementation)
    const parts = normalized.split('/').filter((p) => p !== '.');
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '') {
        resolved.push(part);
      }
    }

    return resolved.join('/');
  }

  /**
   * Check file size constraint for write operations.
   */
  private checkFileSize(content: string | Uint8Array): string | null {
    const size =
      typeof content === 'string'
        ? new Blob([content]).size
        : content.byteLength;

    if (size > this.config.maxFileSize) {
      const maxMB = (this.config.maxFileSize / (1024 * 1024)).toFixed(1);
      const actualMB = (size / (1024 * 1024)).toFixed(1);
      return `File size ${actualMB}MB exceeds maximum ${maxMB}MB`;
    }

    return null;
  }

  // ==========================================================================
  // VALIDATION (DRY-RUN)
  // ==========================================================================

  /**
   * Validate a batch of operations without executing them.
   * Returns validation result with violations and warnings.
   */
  async validate(operations: FileOperation[]): Promise<ValidationResult> {
    const violations: PermissionViolation[] = [];
    const warnings: string[] = [];

    // Check batch size
    if (operations.length > this.config.maxBatchSize) {
      warnings.push(
        `Batch size ${operations.length} exceeds maximum ${this.config.maxBatchSize}. Only first ${this.config.maxBatchSize} will be processed.`
      );
    }

    // Validate each operation
    const validOperations: FileOperation[] = [];

    for (const op of operations.slice(0, this.config.maxBatchSize)) {
      // Check permissions
      const violation = this.checkPermission(op);
      if (violation) {
        violations.push(violation);
        continue;
      }

      // Check file size for write/create operations
      if ((op.type === 'write' || op.type === 'create') && op.content) {
        const sizeError = this.checkFileSize(op.content);
        if (sizeError) {
          violations.push({
            operation: op,
            reason: sizeError,
            path: op.path,
          });
          continue;
        }
      }

      // Validate operation type has required fields
      if (op.type === 'rename' && !op.newPath) {
        violations.push({
          operation: op,
          reason: 'Rename operation requires newPath',
          path: op.path,
        });
        continue;
      }

      if ((op.type === 'write' || op.type === 'create') && op.content === undefined) {
        violations.push({
          operation: op,
          reason: `${op.type} operation requires content`,
          path: op.path,
        });
        continue;
      }

      validOperations.push(op);
    }

    return {
      ok: violations.length === 0,
      operations: validOperations,
      violations,
      warnings,
    };
  }

  // ==========================================================================
  // EXECUTION
  // ==========================================================================

  /**
   * Execute a single file operation.
   */
  async execute(operation: FileOperation): Promise<OperationResult> {
    const startTime = Date.now();

    // Validate first
    const validation = await this.validate([operation]);
    if (!validation.ok) {
      const result: OperationResult = {
        operation,
        success: false,
        error: {
          code: 'EACCES',
          message: validation.violations[0]?.reason || 'Permission denied',
          path: operation.path,
        },
        timestamp: startTime,
      };

      if (this.config.trackHistory) {
        this.history.push(result);
      }

      return result;
    }

    // Execute operation
    let fsResult: FilesystemResult<any>;

    try {
      switch (operation.type) {
        case 'read':
          fsResult = await this.fs.readFile(operation.path);
          break;

        case 'write':
          fsResult = await this.fs.writeFile(
            operation.path,
            operation.content!,
            operation.options as WriteFileOptions
          );
          break;

        case 'create':
          fsResult = await this.fs.createFile(operation.path, operation.content);
          break;

        case 'delete':
          fsResult = await this.fs.deleteEntry(
            operation.path,
            operation.options as DeleteEntryOptions
          );
          break;

        case 'rename':
          fsResult = await this.fs.renameEntry(
            operation.path,
            operation.newPath!,
            operation.options as RenameEntryOptions
          );
          break;

        default:
          fsResult = {
            ok: false,
            error: {
              code: 'UNKNOWN',
              message: `Unknown operation type: ${(operation as any).type}`,
            },
          };
      }
    } catch (error) {
      fsResult = {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown error',
          cause: error,
        },
      };
    }

    const result: OperationResult = {
      operation,
      success: fsResult.ok,
      error: fsResult.error,
      timestamp: startTime,
    };

    if (this.config.trackHistory) {
      this.history.push(result);
    }

    return result;
  }

  /**
   * Execute multiple operations in sequence.
   * Stops on first error unless continueOnError is true.
   */
  async executeBatch(
    operations: FileOperation[],
    options: { continueOnError?: boolean } = {}
  ): Promise<OperationHistory> {
    const startTime = Date.now();
    const results: OperationResult[] = [];

    for (const operation of operations) {
      const result = await this.execute(operation);
      results.push(result);

      if (!result.success && !options.continueOnError) {
        break;
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      operations: results,
      startTime,
      endTime: Date.now(),
      totalOperations: results.length,
      successCount,
      failureCount,
    };
  }

  // ==========================================================================
  // HISTORY & UTILITIES
  // ==========================================================================

  /**
   * Get operation history.
   */
  getHistory(): OperationResult[] {
    return [...this.history];
  }

  /**
   * Clear operation history.
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get agent configuration.
   */
  getConfig(): Readonly<Required<FilesystemAgentConfig>> {
    return { ...this.config };
  }

  /**
   * Update agent configuration.
   */
  updateConfig(config: Partial<FilesystemAgentConfig>): void {
    if (config.allowedPaths !== undefined) {
      this.config.allowedPaths = config.allowedPaths;
    }
    if (config.deniedPaths !== undefined) {
      this.config.deniedPaths = config.deniedPaths;
    }
    if (config.maxFileSize !== undefined) {
      this.config.maxFileSize = config.maxFileSize;
    }
    if (config.maxBatchSize !== undefined) {
      this.config.maxBatchSize = config.maxBatchSize;
    }
    if (config.trackHistory !== undefined) {
      this.config.trackHistory = config.trackHistory;
    }
  }
}
