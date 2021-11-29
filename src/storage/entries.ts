import { Entry, File, Directory } from './types'
import { withOptions } from 'tree-visit'
import { join } from '../path'

function createFile<T>(data: T): File<T> {
  return { type: 'file', data }
}

function createDirectory<T>(
  entries: Directory<T>['entries'] = {}
): Directory<T> {
  return { type: 'directory', entries }
}

function isFile<T>(entry: Entry<T>): entry is File<T> {
  return entry.type === 'file'
}

function isDirectory<T>(entry: Entry<T>): entry is Directory<T> {
  return entry.type === 'directory'
}

function readDirectory<T>(directory: Directory<T>) {
  return Object.keys(directory.entries)
}

function getEntry<T>(
  directory: Directory<T>,
  name: string
): Entry<T> | undefined {
  return directory.entries[name]
}

function hasEntry<T, K extends string>(
  directory: Directory<T>,
  name: K
): directory is Directory<T> & { value: { [key in K]: Entry<T> } } {
  return name in directory.entries
}

function traversal<T>() {
  return withOptions<[string, Entry<T>]>({
    getChildren: ([pathname, entry]) =>
      entry.type === 'directory'
        ? Object.entries(entry.entries).map(([key, value]) => [
            join(pathname, key),
            value,
          ])
        : [],
  })
}

export const Entries = {
  createFile,
  createDirectory,
  isFile,
  isDirectory,
  readDirectory,
  getEntry,
  hasEntry,
  traversal,
}
