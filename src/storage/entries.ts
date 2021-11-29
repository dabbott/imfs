import { withOptions } from 'tree-visit'
import { join } from '../path'
import { Entry, File, Directory } from './types'

function createFile(data: Uint8Array): File {
  return { type: 'file', data }
}

function createDirectory(entries: Directory['entries']): Directory {
  return { type: 'directory', entries }
}

function isFile(entry: Entry): entry is File {
  return entry.type === 'file'
}

function isDirectory(entry: Entry): entry is Directory {
  return entry.type === 'directory'
}

function readDirectory(directory: Directory) {
  return Object.keys(directory.entries)
}

function getEntry(directory: Directory, name: string): Entry | undefined {
  return directory.entries[name]
}

function hasEntry<T extends string>(
  directory: Directory,
  name: T
): directory is Directory & { value: { [key in T]: Entry } } {
  return name in directory.entries
}

const Traverse = withOptions<[string, Entry]>({
  getChildren: ([pathname, entry]) =>
    entry.type === 'directory'
      ? Object.entries(entry.entries).map(([key, value]) => [
          join(pathname, key),
          value,
        ])
      : [],
})

export const Entries = {
  createFile,
  createDirectory,
  isFile,
  isDirectory,
  readDirectory,
  getEntry,
  hasEntry,
  Traverse,
}
