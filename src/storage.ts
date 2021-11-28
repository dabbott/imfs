import { join, sep } from './path'

export type File = Uint8Array

export type Entry = File | Directory

export interface Directory {
  [key: string]: Entry
}

export function isDirectory(entry: Entry): entry is Directory {
  return typeof entry === 'object'
}

export function isFile(entry: Entry): entry is File {
  return entry instanceof Uint8Array
}

export function contains<T extends string>(
  directory: Directory,
  name: T
): directory is Directory & { [key in T]: Entry } {
  return name in directory
}

export function hasFile<T extends string>(
  directory: Directory,
  name: T
): directory is Directory & { [key in T]: Entry } {
  return contains(directory, name) && isFile(directory[name])
}

export function hasDirectory<T extends string>(
  directory: Directory,
  name: T
): directory is Directory & { [key in T]: Directory } {
  return contains(directory, name) && isDirectory(directory[name])
}

export function locate(
  directory: Directory,
  filepath: string
):
  | {
      parent: Directory
      name: string
    }
  | undefined {
  const components = filepath.split(sep).filter((x) => x !== '')

  if (components.length === 0) return

  let current: Directory = directory

  for (let i = 0; i < components.length - 1; i++) {
    const component = components[i]

    if (hasDirectory(current, component)) {
      current = current[component]
      continue
    } else {
      const next: Directory = {}
      current[component] = next
      current = next
    }
  }

  return {
    parent: current,
    name: components[components.length - 1],
  }
}

export function exists(directory: Directory, filepath: string) {
  return !!locate(directory, filepath)
}

export function getDirectory(
  directory: Directory,
  filepath: string
): Directory | undefined {
  const target = locate(directory, filepath)

  if (!target) return

  if (!hasDirectory(target.parent, target.name)) return

  return target.parent[target.name]
}

export function getFile(
  directory: Directory,
  filepath: string
): Entry | undefined {
  const target = locate(directory, filepath)

  if (!target) return

  if (!hasFile(target.parent, target.name)) return

  return target.parent[target.name]
}

export function makeDirectory(directory: Directory, filepath: string) {
  const target = locate(directory, filepath)

  if (target) {
    target.parent[target.name] = {}
  } else {
    throw new Error(`Failed to locate ${filepath}`)
  }
}

export function readDirectory(
  directory: Directory,
  filepath: string
): string[] {
  const target = getDirectory(directory, filepath)

  if (!target) return []

  return Object.keys(target)
}

export function writeFile(
  directory: Directory,
  filepath: string,
  data: Uint8Array
) {
  const target = locate(directory, filepath)

  if (target) {
    target.parent[target.name] = data
  } else {
    throw new Error(`Failed to locate ${filepath}`)
  }
}

export function getPaths(directory: Directory): string[] {
  function inner(path: string, directory: Directory): string[] {
    const names = Object.keys(directory)

    return names
      .map((name) => join(path, name))
      .concat(
        ...names.map((name) => {
          if (hasDirectory(directory, name)) {
            return inner(join(path, name), directory[name])
          } else {
            return []
          }
        })
      )
  }

  return inner('', directory)
}

export function create(): Directory {
  return {}
}
