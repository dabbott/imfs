export type File<Data, Metadata> = {
  readonly type: 'file'
  readonly data: Data
  readonly metadata: Metadata
}

export type Directory<Data, Metadata> = {
  readonly type: 'directory'
  readonly children: Record<string, Node<Data, Metadata>>
  readonly metadata: Metadata
}

export type Node<Data, Metadata> =
  | File<Data, Metadata>
  | Directory<Data, Metadata>

export type Entry<Data, Metadata> = [string, Node<Data, Metadata>]
