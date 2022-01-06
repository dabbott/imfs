import { Nodes } from '../node'
import { Node } from '../types'
import { getNewAndParentName, PathLike } from './paths'
import { getNode, getNodeInternal, MakeDirectoryOptions } from './read'

export type SetMetadataOptions<Metadata> = Metadata extends void
  ? {}
  : {
      metadata: Metadata
    }

export function setNode<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  node: Node<Data, Metadata>,
  options?: MakeDirectoryOptions<Metadata>
) {
  const { parentName, newName } = getNewAndParentName(pathlike)

  const parent = getNodeInternal(
    root,
    parentName,
    options ?? ({} as MakeDirectoryOptions<Metadata>)
  )

  if (!Nodes.isDirectory(parent)) {
    throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
  }

  parent.children[newName] = node
}

export function writeFile<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  data: Data,
  options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
): void {
  setNode(
    root,
    pathlike,
    Nodes.createFile(data, (options as any)?.metadata),
    options
  )
}

export function makeDirectory<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
) {
  const { parentName, newName } = getNewAndParentName(pathlike)

  const parent = getNodeInternal(
    root,
    parentName,
    options ?? ({} as MakeDirectoryOptions<Metadata>)
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
  )
}

export function removeFile<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike
) {
  const { parentName, newName } = getNewAndParentName(pathlike)

  const parent = getNode(root, parentName)

  if (!Nodes.isDirectory(parent)) {
    throw new Error(
      `Can't remove file ${newName}, ${parentName} not a directory`
    )
  }

  delete parent.children[newName]
}

export function setMetadata<Data, Metadata>(
  root: Node<Data, Metadata>,
  pathlike: PathLike,
  metadata: Metadata
) {
  const node = getNode(root, pathlike)

  ;(node as any).metadata = metadata
}

// We use overloads here to improve type inference when the volume is created.
// After this point, TypeScript will infer the types automatically on other functions,
// so overloads aren't necessary.
export function create<Data>(): Node<Data, void>
export function create<Data, Metadata>(
  options: SetMetadataOptions<Metadata>
): Node<Data, Metadata>
export function create<Data, Metadata>(
  options?: SetMetadataOptions<Metadata>
): Node<Data, Metadata> {
  return Nodes.createDirectory(
    {},
    options && 'metadata' in options ? options.metadata : undefined
  ) as Node<Data, Metadata>
}
