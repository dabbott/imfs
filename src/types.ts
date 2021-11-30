export type File<Data, Metadata = void> = {
  readonly type: 'file'
  readonly data: Data
  readonly metadata: Metadata
}

export type Directory<Data, Metadata = void> = {
  readonly type: 'directory'
  readonly children: Record<string, Node<Data, Metadata>>
  readonly metadata: Metadata
}

export type Node<Data, Metadata = void> =
  | File<Data, Metadata>
  | Directory<Data, Metadata>

export type Entry<Data, Metadata = void> = [string, Node<Data, Metadata>]
