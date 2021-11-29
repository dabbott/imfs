import { Nodes } from '../node'
import { Directory } from '../types'

it('node tools', () => {
  const file = Nodes.createFile(Uint8Array.from([0, 1, 2, 3]))
  const directory = Nodes.createDirectory({})

  expect(Nodes.isFile(directory)).toBe(false)
  expect(Nodes.isFile(file)).toBe(true)

  expect(Nodes.isDirectory(directory)).toBe(true)
  expect(Nodes.isDirectory(file)).toBe(false)
})

it('read directory', () => {
  const directory = Nodes.createDirectory({
    a: Nodes.createFile(new Uint8Array()),
    nested: Nodes.createDirectory({
      b: Nodes.createFile(new Uint8Array()),
    }),
  })

  expect(Nodes.readDirectory(directory)).toEqual(['a', 'nested'])
  expect(
    Nodes.readDirectory(
      Nodes.getNode(directory, 'nested') as Directory<Uint8Array>
    )
  ).toEqual(['b'])

  expect(
    Nodes.traversal().diagram(
      ['/', directory],
      ([pathname, node]) => `${pathname} (${node.type})`
    )
  ).toMatchSnapshot()
})
