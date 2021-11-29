import { basename } from '../path'
import { Nodes } from '../node'
import { Storage } from '../storage'
import { Node } from '../types'

function diagram<T>(root: Node<T>) {
  return Nodes.traversal().diagram(
    ['/', root],
    ([pathname, node]) =>
      `${pathname === '/' ? '/' : basename(pathname)} (${node.type})`
  )
}

it('gets path components', () => {
  expect(Storage.getPathComponents('/')).toEqual([])
  expect(Storage.getPathComponents('.')).toEqual([])
  expect(Storage.getPathComponents('/a')).toEqual(['a'])
  expect(Storage.getPathComponents('/nested')).toEqual(['nested'])
  expect(Storage.getPathComponents('/nested/b')).toEqual(['nested', 'b'])
})

it('gets node', () => {
  const a = Nodes.createFile(new Uint8Array())
  const b = Nodes.createFile(new Uint8Array())
  const nested = Nodes.createDirectory({ b })
  const root = Nodes.createDirectory({ a, nested })

  expect(Storage.getNode(root, '/')).toEqual(root)
  expect(Storage.getNode(root, '.')).toEqual(root)
  expect(Storage.getNode(root, '/a')).toEqual(a)
  expect(Storage.getNode(root, 'a')).toEqual(a)
  expect(Storage.getNode(root, '/nested')).toEqual(nested)
  expect(Storage.getNode(root, '/nested/b')).toEqual(b)
  expect(Storage.getNode(root, ['nested', 'b'])).toEqual(b)

  expect(() => Storage.getNode(root, '..')).toThrowError(
    "Invalid path .., can't go up past root"
  )
  expect(() => Storage.getNode(root, '/c')).toThrowError('File c not found')
  expect(() => Storage.getNode(root, '/nested/c')).toThrowError(
    'File nested/c not found'
  )
  expect(() => Storage.getNode(root, '/nested/b/c')).toThrowError(
    'File nested/b is not a directory'
  )
})

it('reading', () => {
  const a = Nodes.createFile(new Uint8Array())
  const b = Nodes.createFile(new Uint8Array())
  const nested = Nodes.createDirectory({ b })
  const root = Nodes.createDirectory({ a, nested })

  expect(Storage.readDirectory(root, '/')).toEqual(['a', 'nested'])
  expect(Storage.readDirectory(root, '/nested')).toEqual(['b'])
  expect(Storage.readFile(root, '/nested/b')).toEqual(b.data)
})

it('writing', () => {
  const root = Nodes.createDirectory<string>()
  const withA = Storage.makeDirectory(root, '/a')
  const withAB = Storage.makeDirectory(withA, '/b')
  const withAC = Storage.writeFile(withA, '/c', 'hello')

  expect(diagram(root)).toMatchSnapshot()
  expect(diagram(withA)).toMatchSnapshot()
  expect(diagram(withAB)).toMatchSnapshot()
  expect(diagram(withAC)).toMatchSnapshot()
})

it('removing', () => {
  const root = Nodes.createDirectory<string>()
  const withA = Storage.makeDirectory(root, '/a')
  const withAC = Storage.writeFile(withA, '/a/c', 'hello')

  expect(diagram(withAC)).toMatchSnapshot()
  expect(diagram(Storage.removeFile(withAC, '/a/c'))).toMatchSnapshot()
  expect(diagram(Storage.removeFile(withAC, '/a'))).toMatchSnapshot()
})
