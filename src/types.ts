export type File<Data> = { type: 'file'; data: Data }

export type Directory<Data> = {
  type: 'directory'
  entries: Record<string, Node<Data>>
}

export type Node<Data> = File<Data> | Directory<Data>
