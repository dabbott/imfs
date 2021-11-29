export type File<T> = { type: 'file'; data: T }

export type Directory<T> = {
  type: 'directory'
  entries: Record<string, Entry<T>>
}

export type Entry<T> = File<T> | Directory<T>
