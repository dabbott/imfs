import produce, { Draft } from 'immer'
import { basename, dirname, join, normalize, sep } from '../path'
import { Entries } from './entries'
import { Entry } from './types'

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

function getEntry<T>(root: Entry<T>, pathlike: PathLike): Entry<T> {
  const components = getComponentsInternal(pathlike)

  let i = 0
  let current: Entry<T> = root

  while (i < components.length) {
    let component = components[i]

    if (current.type !== 'directory') {
      throw new Error(
        `File ${join(...components.slice(0, i))} is not a directory`
      )
    }

    const entry = Entries.getEntry(current, component)

    if (!entry) {
      throw new Error(`File ${join(...components)} not found`)
    }

    current = entry

    i++
  }

  return current
}

function setEntry<T, U extends Entry<T>>(
  root: U,
  pathlike: PathLike,
  entry: Entry<T>
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    parent.entries[newName] = entry as Draft<Entry<T>>
  })
}

function readFile<T>(root: Entry<T>, pathlike: PathLike): T {
  const components = getComponentsInternal(pathlike)
  const entry = getEntry(root, components)

  if (!Entries.isFile(entry)) {
    throw new Error(`Can't read, ${join(...components)} not a file`)
  }

  return entry.data
}

function readDirectory<T>(root: Entry<T>, pathlike: PathLike): string[] {
  const components = getComponentsInternal(pathlike)
  const entry = getEntry(root, components)

  if (!Entries.isDirectory(entry)) {
    throw new Error(`Can't read, ${join(...components)} not a directory`)
  }

  return Entries.readDirectory(entry)
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

function makeDirectory<T, U extends Entry<T>>(root: U, pathlike: PathLike): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(`Can't create ${newName}, ${parentName} not a directory`)
    }

    const existing = Entries.getEntry(parent, newName)

    // Already a directory
    if (existing && Entries.isDirectory(parent.entries[newName])) {
      return
    }

    parent.entries[newName] = Entries.createDirectory()
  })
}

function writeFile<T, U extends Entry<T>>(
  root: U,
  pathlike: PathLike,
  data: T
): U {
  return setEntry(root, pathlike, Entries.createFile(data))
}

function removeFile<T, U extends Entry<T>>(root: U, pathlike: PathLike): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(
        `Can't remove file ${newName}, ${parentName} not a directory`
      )
    }

    delete parent.entries[newName]
  })
}

export const Storage = {
  getPathComponents,
  getEntry,
  setEntry,
  readFile,
  readDirectory,
  makeDirectory,
  writeFile,
  removeFile,
}
