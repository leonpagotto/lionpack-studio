/**
 * LionPack Studio - LocalFileSystem Tests
 * Story 3.11 Phase 1 - Browser File System Access API tests
 */
import { LocalFileSystem } from '../local-filesystem'

// Mock File System Access API
const mockShowDirectoryPicker = jest.fn()

// Setup window mocks
beforeAll(() => {
  ;(global as any).window = {
    showDirectoryPicker: mockShowDirectoryPicker,
  }
})

afterAll(() => {
  // @ts-ignore
  delete global.window
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LocalFileSystem', () => {
  describe('supports()', () => {
    it('should return true when File System Access API is available', () => {
      const fs = new LocalFileSystem()
      expect(fs.supports()).toBe(true)
    })

    it('should return false when window is undefined (Node environment)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      const fs = new LocalFileSystem()
      expect(fs.supports()).toBe(false)
      // @ts-ignore
      global.window = originalWindow
    })

    it('should return false when showDirectoryPicker is not available', () => {
      const originalPicker = (global.window as any).showDirectoryPicker
      // @ts-ignore
      delete (global.window as any).showDirectoryPicker
      const fs = new LocalFileSystem()
      expect(fs.supports()).toBe(false)
      ;(global.window as any).showDirectoryPicker = originalPicker
    })
  })

  describe('requestRoot()', () => {
    it('should request and store root directory handle', async () => {
      const mockRootHandle = { kind: 'directory', name: 'root' }
      mockShowDirectoryPicker.mockResolvedValue(mockRootHandle)

      const fs = new LocalFileSystem()
      const result = await fs.requestRoot()

      expect(result.ok).toBe(true)
      expect(mockShowDirectoryPicker).toHaveBeenCalled()
    })

    it('should return error when user cancels picker', async () => {
      mockShowDirectoryPicker.mockRejectedValue(new DOMException('User cancelled', 'AbortError'))

      const fs = new LocalFileSystem()
      const result = await fs.requestRoot()

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('EACCES')
    })

    it('should return error when API not supported', async () => {
      const originalPicker = (global.window as any).showDirectoryPicker
      // @ts-ignore
      delete (global.window as any).showDirectoryPicker

      const fs = new LocalFileSystem()
      const result = await fs.requestRoot()

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('EBADF')
      ;(global.window as any).showDirectoryPicker = originalPicker
    })
  })

  describe('listDirectory()', () => {
    it('should list directory entries with file metadata', async () => {
      const mockFileHandle = {
        kind: 'file',
        name: 'test.txt',
        getFile: jest.fn().mockResolvedValue({
          size: 1024,
          lastModified: 1635000000000,
        }),
      }
      const mockDirHandle = {
        kind: 'directory',
        name: 'subdir',
      }

      // Create async iterator for directory entries
      const entries = [
        ['test.txt', mockFileHandle],
        ['subdir', mockDirHandle],
      ]
      const asyncIterator = {
        [Symbol.asyncIterator]() {
          let index = 0
          return {
            async next() {
              if (index < entries.length) {
                return { value: entries[index++], done: false }
              }
              return { value: undefined, done: true }
            },
          }
        },
      }

      const mockRootHandle = {
        kind: 'directory',
        entries: jest.fn().mockReturnValue(asyncIterator),
      }

      const fs = new LocalFileSystem({ rootHandle: mockRootHandle })
      const result = await fs.listDirectory('')

      expect(result.ok).toBe(true)
      expect(result.value).toHaveLength(2)
      expect(result.value?.[0]).toMatchObject({
        kind: 'file',
        name: 'test.txt',
        path: 'test.txt',
        size: 1024,
        lastModified: 1635000000000,
      })
      expect(result.value?.[1]).toMatchObject({
        kind: 'directory',
        name: 'subdir',
        path: 'subdir',
      })
    })

    it('should return ENOENT error when directory not found', async () => {
      const mockRootHandle = {
        kind: 'directory',
        getDirectoryHandle: jest.fn().mockRejectedValue(
          new DOMException('Directory not found', 'NotFoundError')
        ),
      }

      const fs = new LocalFileSystem({ rootHandle: mockRootHandle })
      const result = await fs.listDirectory('nonexistent')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('ENOENT')
      expect(result.error?.path).toBe('nonexistent')
    })

    it('should return error when root not selected', async () => {
      const fs = new LocalFileSystem()
      const result = await fs.listDirectory('')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('EBADF')
    })
  })

  describe('readFile()', () => {
    const setupReadMocks = (content: string) => {
      const mockFile = {
        text: jest.fn().mockResolvedValue(content),
        arrayBuffer: jest.fn().mockResolvedValue(new TextEncoder().encode(content).buffer),
        size: content.length,
        lastModified: Date.now(),
      }
      const mockFileHandle = {
        kind: 'file',
        getFile: jest.fn().mockResolvedValue(mockFile),
      }
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      }
      return { mockParentHandle, mockFile }
    }

    it('should read file as UTF-8 text by default', async () => {
      const { mockParentHandle, mockFile } = setupReadMocks('Hello, World!')
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.readFile('test.txt')

      expect(result.ok).toBe(true)
      expect(result.value).toBe('Hello, World!')
      expect(mockFile.text).toHaveBeenCalled()
    })

    it('should read file as UTF-8 when explicitly requested', async () => {
      const { mockParentHandle, mockFile } = setupReadMocks('UTF-8 content')
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.readFile('test.txt', { encoding: 'utf-8' })

      expect(result.ok).toBe(true)
      expect(result.value).toBe('UTF-8 content')
      expect(mockFile.text).toHaveBeenCalled()
    })

    it('should read file as base64 when requested', async () => {
      const { mockParentHandle } = setupReadMocks('Test')
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.readFile('test.txt', { encoding: 'base64' })

      expect(result.ok).toBe(true)
      expect(typeof result.value).toBe('string')
      // Base64 encoded "Test" should start with "VGVz"
      expect((result.value as string).startsWith('VGVz')).toBe(true)
    })

    it('should return ENOENT error when file not found', async () => {
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockRejectedValue(
          new DOMException('File not found', 'NotFoundError')
        ),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.readFile('missing.txt')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('ENOENT')
    })
  })

  describe('writeFile()', () => {
    const setupWriteMocks = () => {
      const mockWritable = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
      }
      const mockFileHandle = {
        kind: 'file',
        createWritable: jest.fn().mockResolvedValue(mockWritable),
        getFile: jest.fn().mockResolvedValue({ size: 0, lastModified: 0 }),
      }
      const mockParentHandle: any = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      }
      // Self-reference for recursive directory creation
      mockParentHandle.getDirectoryHandle = jest.fn().mockResolvedValue(mockParentHandle)

      return { mockParentHandle, mockFileHandle, mockWritable }
    }

    it('should write string content to file', async () => {
      const { mockParentHandle, mockWritable } = setupWriteMocks()
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.writeFile('test.txt', 'Hello, World!')

      expect(result.ok).toBe(true)
      expect(mockWritable.write).toHaveBeenCalledWith('Hello, World!')
      expect(mockWritable.close).toHaveBeenCalled()
    })

    it('should write Uint8Array content to file', async () => {
      const { mockParentHandle, mockWritable } = setupWriteMocks()
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })
      const data = new Uint8Array([72, 101, 108, 108, 111])

      const result = await fs.writeFile('test.bin', data)

      expect(result.ok).toBe(true)
      expect(mockWritable.write).toHaveBeenCalledWith(data)
      expect(mockWritable.close).toHaveBeenCalled()
    })

    it('should create intermediate directories when recursive=true', async () => {
      const { mockParentHandle } = setupWriteMocks()
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.writeFile('sub/dir/test.txt', 'content', { recursive: true })

      expect(result.ok).toBe(true)
      expect(mockParentHandle.getDirectoryHandle).toHaveBeenCalledWith('sub', { create: true })
    })

    it('should return EEXIST when overwrite=false and file exists with content', async () => {
      const mockWritable = {
        write: jest.fn(),
        close: jest.fn(),
      }
      const mockFileHandle = {
        kind: 'file',
        createWritable: jest.fn().mockResolvedValue(mockWritable),
        getFile: jest.fn().mockResolvedValue({ size: 100, lastModified: Date.now() }),
      }
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.writeFile('existing.txt', 'new content', { overwrite: false })

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('EEXIST')
    })
  })

  describe('createFile()', () => {
    it('should create new file with content', async () => {
      const mockWritable = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
      }
      const mockFileHandle = {
        kind: 'file',
        createWritable: jest.fn().mockResolvedValue(mockWritable),
        getFile: jest.fn().mockResolvedValue({ size: 0, lastModified: 0 }),
      }
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.createFile('new.txt', 'content')

      expect(result.ok).toBe(true)
    })

    it('should error when file already exists', async () => {
      const mockFileHandle = {
        kind: 'file',
        createWritable: jest.fn(),
        getFile: jest.fn().mockResolvedValue({ size: 50, lastModified: Date.now() }),
      }
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.createFile('existing.txt', 'content')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('EEXIST')
    })
  })

  describe('deleteEntry()', () => {
    it('should delete file successfully', async () => {
      const mockParentHandle = {
        kind: 'directory',
        removeEntry: jest.fn().mockResolvedValue(undefined),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.deleteEntry('test.txt')

      expect(result.ok).toBe(true)
      expect(mockParentHandle.removeEntry).toHaveBeenCalledWith('test.txt', { recursive: false })
    })

    it('should delete directory recursively when specified', async () => {
      const mockParentHandle = {
        kind: 'directory',
        removeEntry: jest.fn().mockResolvedValue(undefined),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.deleteEntry('mydir', { recursive: true })

      expect(result.ok).toBe(true)
      expect(mockParentHandle.removeEntry).toHaveBeenCalledWith('mydir', { recursive: true })
    })

    it('should return ENOENT when entry not found', async () => {
      const mockParentHandle = {
        kind: 'directory',
        removeEntry: jest.fn().mockRejectedValue(
          new DOMException('Entry not found', 'NotFoundError')
        ),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.deleteEntry('missing.txt')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('ENOENT')
    })
  })

  describe('renameEntry()', () => {
    it('should rename file using copy+delete strategy', async () => {
      const mockFile = {
        text: jest.fn().mockResolvedValue('file content'),
        arrayBuffer: jest.fn().mockResolvedValue(new TextEncoder().encode('file content').buffer),
      }
      const mockWritable = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
      }
      const mockFileHandle = {
        kind: 'file',
        getFile: jest.fn().mockResolvedValue(mockFile),
        createWritable: jest.fn().mockResolvedValue(mockWritable),
      }
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
        removeEntry: jest.fn().mockResolvedValue(undefined),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.renameEntry('old.txt', 'new.txt')

      expect(result.ok).toBe(true)
      expect(mockParentHandle.removeEntry).toHaveBeenCalledWith('old.txt', { recursive: false })
    })

    it('should return error when source file not found', async () => {
      const mockParentHandle = {
        kind: 'directory',
        getFileHandle: jest.fn().mockRejectedValue(
          new DOMException('File not found', 'NotFoundError')
        ),
      }
      const fs = new LocalFileSystem({ rootHandle: mockParentHandle })

      const result = await fs.renameEntry('missing.txt', 'new.txt')

      expect(result.ok).toBe(false)
      expect(result.error?.code).toBe('ENOENT')
    })
  })
})

describe('normalizeError', () => {
  const { normalizeError } = require('../types')

  it('should normalize NotFoundError to ENOENT', () => {
    const error = new DOMException('File not found', 'NotFoundError')
    const normalized = normalizeError(error, '/test/path')

    expect(normalized.code).toBe('ENOENT')
    expect(normalized.path).toBe('/test/path')
    expect(normalized.message).toContain('not found')
  })

  it('should normalize permission errors to EACCES', () => {
    const error = new DOMException('Permission denied', 'SecurityError')
    const normalized = normalizeError(error, '/secure/file')

    expect(normalized.code).toBe('EACCES')
    expect(normalized.path).toBe('/secure/file')
    expect(normalized.message).toContain('denied')
  })

  it('should normalize exists errors to EEXIST', () => {
    const error = new Error('File already exists')
    const normalized = normalizeError(error)

    expect(normalized.code).toBe('EEXIST')
    expect(normalized.message).toContain('exists')
  })

  it('should default to UNKNOWN for unrecognized errors', () => {
    const error = new Error('Something weird happened')
    const normalized = normalizeError(error)

    expect(normalized.code).toBe('UNKNOWN')
    expect(normalized.cause).toBe(error)
  })

  it('should handle non-object errors', () => {
    const normalized = normalizeError('string error')

    expect(normalized.code).toBe('UNKNOWN')
    expect(normalized.message).toContain('Unknown filesystem error')
  })
})
