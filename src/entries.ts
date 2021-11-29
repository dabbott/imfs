import { Nodes } from '.'
import { join } from './path'
import { Entry, Node } from './types'

function getEntries<Data>(entry: Entry<Data>): Entry<Data>[] {
  const [pathname, node] = entry

  return Nodes.isDirectory(node)
    ? Object.entries(node.children).map(([key, value]) => [
        join(pathname, key),
        value,
      ])
    : []
}

function createEntry<Data>(pathname: string, node: Node<Data>): Entry<Data> {
  return [pathname, node]
}

export const Entries = {
  createEntry,
  getEntries,
}
