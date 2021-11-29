export type File<T> = { type: 'file'; data: T }

export type Directory<T> = {
  type: 'directory'
  entries: Record<string, Node<T>>
}

export type Node<T> = File<T> | Directory<T>
