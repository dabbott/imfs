import { Node, File, Directory } from './types'
import { withOptions } from 'tree-visit'
import { join } from './path'

function createFile<T>(data: T): File<T> {
  return { type: 'file', data }
}

function createDirectory<T>(
  entries: Directory<T>['entries'] = {}
): Directory<T> {
  return { type: 'directory', entries }
}

function isFile<T>(node: Node<T>): node is File<T> {
  return node.type === 'file'
}

function isDirectory<T>(node: Node<T>): node is Directory<T> {
  return node.type === 'directory'
}

function readDirectory<T>(directory: Directory<T>) {
  return Object.keys(directory.entries)
}

function getNode<T>(
  directory: Directory<T>,
  name: string
): Node<T> | undefined {
  return directory.entries[name]
}

function hasNode<T, K extends string>(
  directory: Directory<T>,
  name: K
): directory is Directory<T> & { value: { [key in K]: Node<T> } } {
  return name in directory.entries
}

export type NamedEntry<T> = [string, Node<T>]

function getNamedEntries<T>(namedEntry: NamedEntry<T>): NamedEntry<T>[] {
  const [pathname, node] = namedEntry

  return node.type === 'directory'
    ? Object.entries(node.entries).map(([key, value]) => [
        join(pathname, key),
        value,
      ])
    : []
}

function traversal<T>() {
  return withOptions<[string, Node<T>]>({
    getChildren: getNamedEntries,
  })
}

export const Nodes = {
  createFile,
  createDirectory,
  isFile,
  isDirectory,
  readDirectory,
  getNode,
  hasNode,
  traversal,
}
