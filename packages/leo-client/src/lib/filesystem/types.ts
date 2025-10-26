/**
 * LionPack Studio - Filesystem Types
 * Unified abstraction for local (browser) filesystem interactions.
 */

export type FileKind = 'file' | 'directory'

export interface FileSystemEntryBase {
  kind: FileKind
  name: string
  /** Normalized POSIX-like path relative to chosen root */
  path: string
}

export interface FileEntry extends FileSystemEntryBase {
  kind: 'file'
  size?: number
  lastModified?: number
  /** Optional textual content preview if eagerly loaded */
  preview?: string
}

export interface DirectoryEntry extends FileSystemEntryBase {
  kind: 'directory'
}

export type FileSystemEntry = FileEntry | DirectoryEntry

export interface ReadFileOptions {
  /** Encoding: if omitted returns Uint8Array */
  encoding?: 'utf-8' | 'base64'
}

export interface WriteFileOptions {
  /** If true, create intermediate directories (best-effort) */
  recursive?: boolean
  /** Overwrite existing file (default true) */
  overwrite?: boolean
}

export interface DeleteEntryOptions {
  /** Recursively delete directory contents */
  recursive?: boolean
}

export interface RenameEntryOptions {
  /** Overwrite if destination exists */
  overwrite?: boolean
}

export interface FilesystemError {
  code: 'ENOENT' | 'EACCES' | 'EEXIST' | 'ENOTDIR' | 'EISDIR' | 'EBADF' | 'UNKNOWN'
  message: string
  path?: string
  cause?: unknown
}

export interface FilesystemResult<T> {
  ok: boolean
  value?: T
  error?: FilesystemError
}

export interface Filesystem {
  /** Returns true if environment supports operations */
  supports(): boolean
  /** List directory contents */
  listDirectory(path: string): Promise<FilesystemResult<FileSystemEntry[]>>
  /** Read file content */
  readFile(path: string, options?: ReadFileOptions): Promise<FilesystemResult<string | Uint8Array>>
  /** Write (create/overwrite) file content */
  writeFile(path: string, data: string | Uint8Array, options?: WriteFileOptions): Promise<FilesystemResult<void>>
  /** Create new file (error if exists) */
  createFile(path: string, data?: string | Uint8Array): Promise<FilesystemResult<void>>
  /** Delete file or directory */
  deleteEntry(path: string, options?: DeleteEntryOptions): Promise<FilesystemResult<void>>
  /** Rename or move within same root */
  renameEntry(src: string, dest: string, options?: RenameEntryOptions): Promise<FilesystemResult<void>>
}

/** Utility to normalize error objects */
export function normalizeError(e: unknown, path?: string): FilesystemError {
  if (e && typeof e === 'object') {
    const msg = (e as any).message || String(e)
    const name = (e as any).name || ''
    // Simple heuristics based on message patterns from FS Access API
    if (/NotFound|not found|does not exist/i.test(msg)) {
      return { code: 'ENOENT', message: msg, path, cause: e }
    }
    if (/Permission|denied|security|abort/i.test(msg) || name === 'AbortError') {
      return { code: 'EACCES', message: msg, path, cause: e }
    }
    if (/Already exists|EEXIST|exists/i.test(msg)) {
      return { code: 'EEXIST', message: msg, path, cause: e }
    }
  }
  return { code: 'UNKNOWN', message: (e as any)?.message || 'Unknown filesystem error', path, cause: e }
}
