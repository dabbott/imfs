import produce, { Draft } from 'immer'
import { basename, dirname, join, normalize, sep } from './path'
import { Nodes } from './node'
import { Directory, Node } from './types'

type PathLike = string | string[]

function getPathComponents(filepath: string): string[] {
  return getPathComponentsNormalized(normalize(filepath))

  function getPathComponentsNormalized(filepath: string): string[] {
    if (filepath.startsWith('..')) {
      throw new Error(`Invalid path ${filepath}, can't go up past root.`)
    }

    if (filepath.startsWith('.') || filepath.startsWith('/')) {
      return getPathComponentsNormalized(filepath.slice(1))
    }

    if (filepath === '') return []

    return filepath.split(sep)
  }
}

const getComponentsInternal = (pathlike: PathLike) => {
  return typeof pathlike === 'string' ? getPathComponents(pathlike) : pathlike
}

function getNode<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Node<Data, Metadata> {
  const components = getComponentsInternal(pathlike)

  let i = 0
  let current: Node<Data, Metadata> = root

  while (i < components.length) {
    let component = components[i]

    if (current.type !== 'directory') {
      throw new Error(
        `File ${join(...components.slice(0, i))} is not a directory`
      )
    }

    const node = Nodes.getChild(current, component)

    if (!node) {
      throw new Error(`File ${join(...components)} not found`)
    }

    current = node

    i++
  }

  return current
}

function setNode<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  node: Node<Data, Metadata>
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    parent.children[newName] = node as Draft<Node<Data, Metadata>>
  })
}

function readFile<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Data {
  const components = getComponentsInternal(pathlike)
  const node = getNode(root, components)

  if (!Nodes.isFile(node)) {
    throw new Error(`Can't read, ${join(...components)} not a file`)
  }

  return node.data
}

function readDirectory<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): string[] {
  const components = getComponentsInternal(pathlike)
  const node = getNode(root, components)

  if (!Nodes.isDirectory(node)) {
    throw new Error(`Can't read, ${join(...components)} not a directory`)
  }

  return Nodes.readDirectory(node)
}

function getNewAndParentName(pathlike: PathLike) {
  const parentName =
    typeof pathlike === 'string' ? dirname(pathlike) : pathlike.slice(0, -1)

  const newName =
    typeof pathlike === 'string'
      ? basename(pathlike)
      : pathlike[pathlike.length - 1]

  return { parentName, newName }
}

function makeDirectory<Data>(
  root: Directory<Data, void>,
  pathlike: PathLike,
  metadata: void
): Directory<Data, void>
function makeDirectory<Data, Metadata>(
  root: Directory<Data, Metadata>,
  pathlike: PathLike,
  metadata: Metadata
): Directory<Data, Metadata>
function makeDirectory<Data, Metadata>(
  root: Directory<Data, Metadata>,
  pathlike: PathLike,
  metadata: Metadata
): Directory<Data, Metadata> {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    const existing = Nodes.getChild(parent, newName)

    // Already a directory
    if (existing && Nodes.isDirectory(parent.children[newName])) {
      return
    }

    parent.children[newName] = Nodes.createDirectory({}, metadata) as Draft<
      Node<Data, Metadata>
    >
  })
}

function writeFile<Data, Metadata extends void, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data
): U
function writeFile<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data,
  metadata: Metadata
): U
function writeFile<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data,
  metadata?: Metadata
): U {
  return setNode(root, pathlike, Nodes.createFile(data, metadata))
}

function removeFile<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(
        `Can't remove file ${newName}, ${parentName} not a directory`
      )
    }

    delete parent.children[newName]
  })
}

function getMetadata<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Metadata {
  const components = getComponentsInternal(pathlike)
  const node = getNode(root, components)
  return node.metadata
}

function setMetadata<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  metadata: Metadata
): U {
  return produce(root, (draft) => {
    const node: Draft<Node<Data, Metadata>> = getNode(draft, pathlike)

    node.metadata = metadata as Draft<Metadata>
  })
}

export const Volume = {
  getPathComponents,
  getNode,
  setNode,
  readFile,
  readDirectory,
  makeDirectory,
  writeFile,
  removeFile,
  getMetadata,
  setMetadata,
}
