/**
 * LionPack Studio - LocalFileSystem (Browser File System Access API)
 * Phase 1 implementation for Story 3.11.
 */
import { Filesystem, FilesystemResult, FileSystemEntry, normalizeError } from './types'

// Types guarded so Node build doesn't error
type DirHandle = any // FileSystemDirectoryHandle
type FileHandle = any // FileSystemFileHandle

export interface LocalFilesystemConfig {
  /** Root directory handle selected by user */
  rootHandle: DirHandle | null
}

export class LocalFileSystem implements Filesystem {
  private root: DirHandle | null

  constructor(config?: LocalFilesystemConfig) {
    this.root = config?.rootHandle || null
  }

  supports(): boolean {
    return typeof window !== 'undefined' && !!(window as any).showDirectoryPicker
  }

  /** Allow user to pick a root directory */
  async requestRoot(): Promise<FilesystemResult<void>> {
    if (!this.supports()) {
      return { ok: false, error: { code: 'EBADF', message: 'File System Access API not supported' } }
    }
    try {
      // @ts-ignore
      this.root = await (window as any).showDirectoryPicker()
      return { ok: true, value: undefined }
    } catch (e) {
      return { ok: false, error: normalizeError(e) }
    }
  }

  private ensureRoot(): FilesystemResult<DirHandle> {
    if (!this.root) {
      return { ok: false, error: { code: 'EBADF', message: 'Root directory not selected' } }
    }
    return { ok: true, value: this.root }
  }

  private async traverse(path: string): Promise<FilesystemResult<{ parent: DirHandle; name: string }>> {
    const rootRes = this.ensureRoot()
    if (!rootRes.ok) return rootRes as any
    const segments = path.split('/').filter(Boolean)
    let current: DirHandle = rootRes.value!
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]
      try {
        current = await current.getDirectoryHandle(seg)
      } catch (e) {
        return { ok: false, error: normalizeError(e, path) }
      }
    }
    return { ok: true, value: { parent: current, name: segments[segments.length - 1] } }
  }

  async listDirectory(path: string): Promise<FilesystemResult<FileSystemEntry[]>> {
    const rootRes = this.ensureRoot()
    if (!rootRes.ok) return rootRes as any
    let dir: DirHandle
    try {
      dir = path ? await rootRes.value!.getDirectoryHandle(path) : rootRes.value!
    } catch (e) {
      return { ok: false, error: normalizeError(e, path) }
    }

    const entries: FileSystemEntry[] = []
    try {
      // Async iteration over directory entries
      // @ts-ignore
      for await (const [name, handle] of (dir as any).entries()) {
        if (handle.kind === 'file') {
          try {
            const file = await handle.getFile()
            entries.push({ kind: 'file', name, path: path ? `${path}/${name}` : name, size: file.size, lastModified: file.lastModified })
          } catch {
            entries.push({ kind: 'file', name, path: path ? `${path}/${name}` : name })
          }
        } else if (handle.kind === 'directory') {
          entries.push({ kind: 'directory', name, path: path ? `${path}/${name}` : name })
        }
      }
      return { ok: true, value: entries }
    } catch (e) {
      return { ok: false, error: normalizeError(e, path) }
    }
  }

  async readFile(path: string, options?: { encoding?: 'utf-8' | 'base64' }): Promise<FilesystemResult<string | Uint8Array>> {
    const parts = await this.traverse(path)
    if (!parts.ok) return parts as any
    try {
      const { parent, name } = parts.value! // Non-null after ok check
      const fileHandle: FileHandle = await parent.getFileHandle(name)
      const file = await fileHandle.getFile()
      if (options?.encoding === 'base64') {
        const buf = new Uint8Array(await file.arrayBuffer())
        // Convert to base64
        let binary = ''
        buf.forEach(b => { binary += String.fromCharCode(b) })
        return { ok: true, value: btoa(binary) }
      }
      if (options?.encoding === 'utf-8' || !options?.encoding) {
        const text = await file.text()
        return { ok: true, value: text }
      }
      return { ok: true, value: new Uint8Array(await file.arrayBuffer()) }
    } catch (e) {
      return { ok: false, error: normalizeError(e, path) }
    }
  }

  async writeFile(path: string, data: string | Uint8Array, options?: { recursive?: boolean; overwrite?: boolean }): Promise<FilesystemResult<void>> {
    const { recursive = true, overwrite = true } = options || {}
    const rootRes = this.ensureRoot()
    if (!rootRes.ok) return rootRes as any
    const segments = path.split('/').filter(Boolean)
    let current: DirHandle = rootRes.value!
    // Create intermediate directories
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]
      try {
        current = await current.getDirectoryHandle(seg, { create: recursive })
      } catch (e) {
        return { ok: false, error: normalizeError(e, path) }
      }
    }
    const fileName = segments[segments.length - 1]
    try {
      const fileHandle: FileHandle = await current.getFileHandle(fileName, { create: true })
      if (!overwrite) {
        // If not overwriting, ensure file did not previously exist by checking size/time
        try {
          const existing = await fileHandle.getFile()
          if (existing.size > 0 || existing.lastModified) {
            return { ok: false, error: { code: 'EEXIST', message: 'File already exists', path } }
          }
        } catch { /* ignore */ }
      }
      const writable = await fileHandle.createWritable()
      if (typeof data === 'string') {
        await writable.write(data)
      } else {
        await writable.write(data)
      }
      await writable.close()
      return { ok: true, value: undefined }
    } catch (e) {
      return { ok: false, error: normalizeError(e, path) }
    }
  }

  async createFile(path: string, data?: string | Uint8Array): Promise<FilesystemResult<void>> {
    // Force overwrite=false semantics
    const writeRes = await this.writeFile(path, data || '', { overwrite: false })
    if (!writeRes.ok && writeRes.error?.code === 'EEXIST') {
      return writeRes
    }
    return writeRes
  }

  async deleteEntry(path: string, options?: { recursive?: boolean }): Promise<FilesystemResult<void>> {
    const { recursive = false } = options || {}
    const parts = await this.traverse(path)
    if (!parts.ok) return parts as any
    try {
      // Directory delete: need to detect kind
      try {
        const { parent, name } = parts.value! // Non-null after ok check
        await parent.removeEntry(name, { recursive })
        return { ok: true, value: undefined }
      } catch (e) {
        return { ok: false, error: normalizeError(e, path) }
      }
    } catch (e) {
      return { ok: false, error: normalizeError(e, path) }
    }
  }

  async renameEntry(src: string, dest: string, _options?: { overwrite?: boolean }): Promise<FilesystemResult<void>> {
    // FS Access API does not yet have native rename; implement copy + delete fallback.
    // For Phase 1 we provide simplified implementation: read -> write -> delete.
    try {
      const readRes = await this.readFile(src)
      if (!readRes.ok) return readRes as any
      const writeRes = await this.writeFile(dest, typeof readRes.value === 'string' ? readRes.value : readRes.value as Uint8Array, { overwrite: true })
      if (!writeRes.ok) return writeRes as any
      const delRes = await this.deleteEntry(src)
      if (!delRes.ok) return delRes as any
      return { ok: true, value: undefined }
    } catch (e) {
      return { ok: false, error: normalizeError(e) }
    }
  }
}
