import { Nodes } from './node'
import { join } from './path'
import { Entry, Node } from './types'

function getEntries<Data, Metadata>(
  entry: Entry<Data, Metadata>
): Entry<Data, Metadata>[] {
  const [pathname, node] = entry

  return Nodes.isDirectory(node)
    ? Object.entries(node.children).map(([key, value]) => [
        join(pathname, key),
        value,
      ])
    : []
}

function createEntry<Data, Metadata>(
  pathname: string,
  node: Node<Data, Metadata>
): Entry<Data, Metadata> {
  return [pathname, node]
}

export const Entries = {
  createEntry,
  getEntries,
}
