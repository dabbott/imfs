import produce, { Draft } from 'immer'
import { basename, dirname, join, normalize, sep } from './path'
import { Nodes } from './node'
import { Directory, Node } from './types'

type PathLike = string | string[]

type VoidMakeDirectoryOptions = { makeIntermediateDirectories: boolean }
type TypedMakeDirectoryOptions<Metadata> = {
  makeIntermediateDirectoryMetadata?: (path: string) => Metadata
}
type MakeDirectoryOptions<Metadata> = Metadata extends void
  ? VoidMakeDirectoryOptions
  : TypedMakeDirectoryOptions<Metadata>

type SetMetadataOptions<Metadata> = Metadata extends void
  ? {}
  : {
      metadata: Metadata
    }

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

function getNodeInternal<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  options: MakeDirectoryOptions<Metadata>
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

    let node = Nodes.getChild(current, component)

    if (!node) {
      // Assumes we're in a writable draft
      if (
        (options as TypedMakeDirectoryOptions<Metadata>)
          .makeIntermediateDirectoryMetadata
      ) {
        const child = Nodes.createDirectory<Data, Metadata>(
          {},
          (options as TypedMakeDirectoryOptions<Metadata>)
            .makeIntermediateDirectoryMetadata!(
            join(...components.slice(0, i + 1))
          )
        )

        current.children[component] = child

        node = child
      } else if (
        (options as VoidMakeDirectoryOptions).makeIntermediateDirectories
      ) {
        const child = Nodes.createDirectory<Data>() as Directory<Data, any>

        current.children[component] = child

        node = child
      } else {
        throw new Error(`File ${join(...components)} not found`)
      }
    }

    current = node

    i++
  }

  return current
}

function getNode<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Node<Data, Metadata> {
  return getNodeInternal(root, pathlike, {} as MakeDirectoryOptions<Metadata>)
}

function setNode<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  node: Node<Data, Metadata>,
  options?: MakeDirectoryOptions<Metadata>
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNodeInternal(
      draft,
      parentName,
      (options ?? {}) as MakeDirectoryOptions<Draft<Metadata>>
    )

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

function makeDirectory<Data, Metadata>(
  root: Directory<Data, Metadata>,
  pathlike: PathLike,
  options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
): Directory<Data, Metadata> {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNodeInternal(
      draft,
      parentName,
      (options ?? {}) as MakeDirectoryOptions<Draft<Metadata>>
    )

    if (!Nodes.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    const existing = Nodes.getChild(parent, newName)

    // Already a directory
    if (existing && Nodes.isDirectory(parent.children[newName])) {
      return
    }

    parent.children[newName] = Nodes.createDirectory(
      {},
      (options as any)?.metadata
    ) as Draft<Node<Data, Metadata>>
  })
}

function writeFile<Data, Metadata extends void, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data,
  options?: VoidMakeDirectoryOptions
): U
function writeFile<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data,
  options?: SetMetadataOptions<Metadata> & TypedMakeDirectoryOptions<Metadata>
): U
function writeFile<Data, Metadata, U extends Node<Data, Metadata>>(
  root: U,
  pathlike: PathLike,
  data: Data,
  options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
): U {
  return setNode(
    root,
    pathlike,
    Nodes.createFile(data, (options as any)?.metadata),
    options
  )
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

function create<Data>(): Directory<Data, void>
function create<Data, Metadata>(
  options: SetMetadataOptions<Metadata>
): Directory<Data, Metadata>
function create<Data, Metadata>(
  options?: SetMetadataOptions<Metadata>
): Directory<Data, Metadata> {
  return Nodes.createDirectory(
    {},
    options && 'metadata' in options ? options.metadata : undefined
  ) as Directory<Data, Metadata>
}

export const Volume = {
  create,
  getMetadata,
  getNode,
  getPathComponents,
  makeDirectory,
  readDirectory,
  readFile,
  removeFile,
  setMetadata,
  setNode,
  writeFile,
}
