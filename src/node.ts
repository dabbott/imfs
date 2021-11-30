import { Directory, File, Node } from './types'

function createFile<Data>(data: Data): File<Data, void>
function createFile<Data, Metadata>(
  data: Data,
  metadata: Metadata
): File<Data, Metadata>
function createFile<Data, Metadata>(
  data: Data,
  metadata?: Metadata
): File<Data, Metadata> {
  return { type: 'file', data, metadata } as File<Data, Metadata>
}

function createDirectory<Data>(
  children?: Directory<Data, void>['children']
): Directory<Data, void>
function createDirectory<Data, Metadata>(
  children: Directory<Data, Metadata>['children'],
  metadata: Metadata
): Directory<Data, Metadata>
function createDirectory<Data, Metadata>(
  children: Directory<Data, Metadata>['children'] = {},
  metadata?: Metadata
): Directory<Data, Metadata> {
  return { type: 'directory', children, metadata } as Directory<Data, Metadata>
}

function isFile<Data, Metadata>(
  node: Node<Data, Metadata>
): node is File<Data, Metadata> {
  return node.type === 'file'
}

function isDirectory<Data, Metadata>(
  node: Node<Data, Metadata>
): node is Directory<Data, Metadata> {
  return node.type === 'directory'
}

function getMetadata<Data, Metadata>(node: Node<Data, Metadata>): Metadata {
  return node.metadata
}

function readDirectory<Data, Metadata>(directory: Directory<Data, Metadata>) {
  return Object.keys(directory.children)
}

function getChild<Data, Metadata>(
  directory: Directory<Data, Metadata>,
  name: string
): Node<Data, Metadata> | undefined {
  return directory.children[name]
}

function hasChild<Data, Metadata, Key extends string>(
  directory: Directory<Data, Metadata>,
  name: Key
): directory is Directory<Data, Metadata> & {
  value: { [key in Key]: Node<Data, Metadata> }
} {
  return name in directory.children
}

export const Nodes = {
  createDirectory,
  createFile,
  getChild,
  getMetadata,
  hasChild,
  isDirectory,
  isFile,
  readDirectory,
}
