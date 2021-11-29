import { join, normalize, sep } from '../path'
import { Entries } from './entries'
import { Entry } from './types'

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

function getEntry(entry: Entry, pathlike: string | string[]): Entry {
  const components =
    typeof pathlike === 'string' ? getPathComponents(pathlike) : pathlike

  let i = 0
  let current: Entry = entry

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

export const Storage = {
  getPathComponents,
  getEntry,
}
