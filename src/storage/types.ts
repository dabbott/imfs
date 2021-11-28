export type File = { type: 'file'; data: Uint8Array }

export type Directory = {
  type: 'directory'
  entries: Record<string, Entry>
}

export type Entry = File | Directory
