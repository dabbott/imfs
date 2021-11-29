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
      throw new Error(
        `Can't create directory ${newName}, ${parentName} not a directory`
      )
    }

    parent.entries[newName] = Entries.createDirectory()
  })
}

function writeFile<T, U extends Entry<T>>(
  root: U,
  pathlike: PathLike,
  data: T
): U {
  const { parentName, newName } = getNewAndParentName(pathlike)

  return produce(root, (draft) => {
    const parent = getEntry(draft, parentName)

    if (!Entries.isDirectory(parent)) {
      throw new Error(
        `Can't create file ${newName}, ${parentName} not a directory`
      )
    }

    parent.entries[newName] = Entries.createFile(data as Draft<T>)
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
