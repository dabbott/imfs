import produce from 'immer'
import { Node } from './types'
import { getPathComponents, PathLike } from './volume/paths'
import {
  getMetadata,
  getNode,
  MakeDirectoryOptions,
  readDirectory,
  readFile,
} from './volume/read'
import {
  create,
  makeDirectory,
  removeFile,
  setMetadata,
  SetMetadataOptions,
  setNode,
  writeFile,
} from './volume/write'

export const Volume = {
  // paths
  getPathComponents,
  // read
  getMetadata,
  getNode,
  readDirectory,
  readFile,
  // write
  create,
  makeDirectory<Data, Metadata>(
    root: Node<Data, Metadata>,
    pathlike: PathLike,
    options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
  ) {
    return produce(root, (draft) => {
      makeDirectory(draft, pathlike, options as any)
    })
  },
  removeFile<Data, Metadata>(root: Node<Data, Metadata>, pathlike: PathLike) {
    return produce(root, (draft) => {
      removeFile(draft, pathlike)
    })
  },
  setMetadata<Data, Metadata>(
    root: Node<Data, Metadata>,
    pathlike: PathLike,
    metadata: Metadata
  ) {
    return produce(root, (draft) => {
      setMetadata(draft, pathlike, metadata as any)
    })
  },
  setNode<Data, Metadata>(
    root: Node<Data, Metadata>,
    pathlike: PathLike,
    node: Node<Data, Metadata>,
    options?: MakeDirectoryOptions<Metadata>
  ) {
    return produce(root, (draft) => {
      setNode(draft, pathlike, node as any, options as any)
    })
  },
  writeFile<Data, Metadata>(
    root: Node<Data, Metadata>,
    pathlike: PathLike,
    data: Data,
    options?: SetMetadataOptions<Metadata> & MakeDirectoryOptions<Metadata>
  ) {
    return produce(root, (draft) => {
      writeFile(draft, pathlike, data as any, options as any)
    })
  },
  // Mutable
  Mutable: {
    makeDirectory,
    removeFile,
    setMetadata,
    setNode,
    writeFile,
  },
}
