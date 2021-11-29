import produce, { Draft } from 'immer'
import { basename, dirname, join, normalize, sep } from './path'
import { Nodes } from './node'
import { Node } from './types'

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

function getNode<T>(root: Node<T>, pathlike: PathLike): Node<T> {
  const components = getComponentsInternal(pathlike)

  let i = 0
  let current: Node<T> = root

  while (i < components.length) {
    let component = components[i]

    if (current.type !== 'directory') {
      throw new Error(
        `File ${join(...components.slice(0, i))} is not a directory`
      )
    }

    const node = Nodes.getNode(current, component)

    if (!node) {
      throw new Error(`File ${join(...components)} not found`)
    }

    current = node

    i++
  }

  return current
}

function setNode<T, U extends Node<T>>(
  root: U,
  pathlike: PathLike,
  node: Node<T>
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    parent.entries[newName] = node as Draft<Node<T>>
  })
}

function readFile<T>(root: Node<T>, pathlike: PathLike): T {
  const components = getComponentsInternal(pathlike)
  const node = getNode(root, components)

  if (!Nodes.isFile(node)) {
    throw new Error(`Can't read, ${join(...components)} not a file`)
  }

  return node.data
}

function readDirectory<T>(root: Node<T>, pathlike: PathLike): string[] {
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

function makeDirectory<T, U extends Node<T>>(root: U, pathlike: PathLike): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    const existing = Nodes.getNode(parent, newName)

    // Already a directory
    if (existing && Nodes.isDirectory(parent.entries[newName])) {
      return
    }

    parent.entries[newName] = Nodes.createDirectory()
  })
}

function writeFile<T, U extends Node<T>>(
  root: U,
  pathlike: PathLike,
  data: T
): U {
  return setNode(root, pathlike, Nodes.createFile(data))
}

function removeFile<T, U extends Node<T>>(root: U, pathlike: PathLike): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getNode(draft, parentName)

    if (!Nodes.isDirectory(parent)) {
      throw new Error(
        `Can't remove file ${newName}, ${parentName} not a directory`
      )
    }

    delete parent.entries[newName]
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
}
