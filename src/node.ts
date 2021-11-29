import { Node, File, Directory, Entry } from './types'
import { join } from './path'

function createFile<Data>(data: Data): File<Data> {
  return { type: 'file', data }
}

function createDirectory<Data>(
  children: Directory<Data>['children'] = {}
): Directory<Data> {
  return { type: 'directory', children }
}

function isFile<Data>(node: Node<Data>): node is File<Data> {
  return node.type === 'file'
}

function isDirectory<Data>(node: Node<Data>): node is Directory<Data> {
  return node.type === 'directory'
}

function readDirectory<Data>(directory: Directory<Data>) {
  return Object.keys(directory.children)
}

function getChild<Data>(
  directory: Directory<Data>,
  name: string
): Node<Data> | undefined {
  return directory.children[name]
}

function hasChild<Data, Key extends string>(
  directory: Directory<Data>,
  name: Key
): directory is Directory<Data> & { value: { [key in Key]: Node<Data> } } {
  return name in directory.children
}

export const Nodes = {
  createFile,
  createDirectory,
  isFile,
  isDirectory,
  readDirectory,
  getChild,
  hasChild,
}
