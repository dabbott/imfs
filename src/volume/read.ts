import { Nodes } from '../node'
import { join } from '../path'
import { Directory, Node } from '../types'
import { normalizePathLikeInternal, PathLike } from './paths'

export type VoidMakeDirectoryOptions = { makeIntermediateDirectories?: boolean }

export type TypedMakeDirectoryOptions<Metadata> = {
  makeIntermediateDirectoryMetadata?: (path: string) => Metadata
}

export type MakeDirectoryOptions<Metadata> = Metadata extends void
  ? VoidMakeDirectoryOptions
  : TypedMakeDirectoryOptions<Metadata>

export function getNodeInternal<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  options: MakeDirectoryOptions<Metadata>
): Node<Data, Metadata> {
  const components = normalizePathLikeInternal(pathlike)

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
        throw new Error(`File ${join(...components.slice(0, i + 1))} not found`)
      }
    }

    current = node

    i++
  }

  return current
}

export function getNode<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Node<Data, Metadata> {
  return getNodeInternal(root, pathlike, {} as MakeDirectoryOptions<Metadata>)
}

export function readFile<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Data {
  const components = normalizePathLikeInternal(pathlike)
  const node = getNode(root, components)

  if (!Nodes.isFile(node)) {
    throw new Error(`Can't read, ${join(...components)} not a file`)
  }

  return node.data
}

export function readDirectory<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): string[] {
  const components = normalizePathLikeInternal(pathlike)
  const node = getNode(root, components)

  if (!Nodes.isDirectory(node)) {
    throw new Error(`Can't read, ${join(...components)} not a directory`)
  }

  return Nodes.readDirectory(node)
}

export function getMetadata<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
): Metadata {
  const components = normalizePathLikeInternal(pathlike)
  const node = getNode(root, components)
  return node.metadata
}
