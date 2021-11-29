import { Node, File, Directory } from './types'
import { withOptions } from 'tree-visit'
import { join } from './path'

function createFile<Data>(data: Data): File<Data> {
  return { type: 'file', data }
}

function createDirectory<Data>(
  entries: Directory<Data>['entries'] = {}
): Directory<Data> {
  return { type: 'directory', entries }
}

function isFile<Data>(node: Node<Data>): node is File<Data> {
  return node.type === 'file'
}

function isDirectory<Data>(node: Node<Data>): node is Directory<Data> {
  return node.type === 'directory'
}

function readDirectory<Data>(directory: Directory<Data>) {
  return Object.keys(directory.entries)
}

function getNode<Data>(
  directory: Directory<Data>,
  name: string
): Node<Data> | undefined {
  return directory.entries[name]
}

function hasNode<Data, Key extends string>(
  directory: Directory<Data>,
  name: Key
): directory is Directory<Data> & { value: { [key in Key]: Node<Data> } } {
  return name in directory.entries
}

export type NamedEntry<Data> = [string, Node<Data>]

function getNamedEntries<Data>(
  namedEntry: NamedEntry<Data>
): NamedEntry<Data>[] {
  const [pathname, node] = namedEntry

  return node.type === 'directory'
    ? Object.entries(node.entries).map(([key, value]) => [
        join(pathname, key),
        value,
      ])
    : []
}

function traversal<Data>() {
  return withOptions<[string, Node<Data>]>({
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
