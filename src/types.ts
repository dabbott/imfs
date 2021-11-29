export type File<Data> = { type: 'file'; data: Data }

export type Directory<Data> = {
  type: 'directory'
  children: Record<string, Node<Data>>
}

export type Node<Data> = File<Data> | Directory<Data>

export type Entry<Data> = [string, Node<Data>]
