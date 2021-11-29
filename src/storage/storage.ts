import produce from 'immer'
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

function getEntry(root: Entry, pathlike: PathLike): Entry {
  const components = getComponentsInternal(pathlike)

  let i = 0
  let current: Entry = root

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

function readFile(root: Entry, pathlike: PathLike): Uint8Array {
  const components = getComponentsInternal(pathlike)
  const entry = getEntry(root, components)

  if (!Entries.isFile(entry)) {
    throw new Error(`Can't read, ${join(...components)} not a file`)
  }

  return entry.data
}

function readDirectory(root: Entry, pathlike: PathLike): string[] {
  const components = getComponentsInternal(pathlike)
  const entry = getEntry(root, components)

  if (!Entries.isDirectory(entry)) {
    throw new Error(`Can't read, ${join(...components)} not a directory`)
  }

  return Entries.readDirectory(entry)
}

function makeDirectory<T extends Entry>(root: T, path: string): T {
  const parentName = dirname(path)
  const newName = basename(path)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(
        `Can't create directory ${newName}, ${parentName} not a directory`
      )
    }

    parent.entries[newName] = Entries.createDirectory()
  })
}

function writeFile<T extends Entry>(
  root: T,
  path: string,
  data: Uint8Array
): T {
  const parentName = dirname(path)
  const newName = basename(path)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(
        `Can't create file ${newName}, ${parentName} not a directory`
      )
    }

    parent.entries[newName] = Entries.createFile(data)
  })
}

export const Storage = {
  getPathComponents,
  getEntry,
  readFile,
  readDirectory,
  makeDirectory,
  writeFile,
}
