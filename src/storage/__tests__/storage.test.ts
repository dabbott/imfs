import { basename } from '../../path'
import { Entries } from '../entries'
import { Storage } from '../storage'
import { Entry } from '../types'

function diagram<T>(root: Entry<T>) {
  return Entries.traversal().diagram(
    ['/', root],
    ([pathname, entry]) =>
      `${pathname === '/' ? '/' : basename(pathname)} (${entry.type})`
  )
}

it('gets path components', () => {
  expect(Storage.getPathComponents('/')).toEqual([])
  expect(Storage.getPathComponents('.')).toEqual([])
  expect(Storage.getPathComponents('/a')).toEqual(['a'])
  expect(Storage.getPathComponents('/nested')).toEqual(['nested'])
  expect(Storage.getPathComponents('/nested/b')).toEqual(['nested', 'b'])
})

it('gets entry', () => {
  const a = Entries.createFile(new Uint8Array())
  const b = Entries.createFile(new Uint8Array())
  const nested = Entries.createDirectory({ b })
  const root = Entries.createDirectory({ a, nested })

  expect(Storage.getEntry(root, '/')).toEqual(root)
  expect(Storage.getEntry(root, '.')).toEqual(root)
  expect(Storage.getEntry(root, '/a')).toEqual(a)
  expect(Storage.getEntry(root, 'a')).toEqual(a)
  expect(Storage.getEntry(root, '/nested')).toEqual(nested)
  expect(Storage.getEntry(root, '/nested/b')).toEqual(b)
  expect(Storage.getEntry(root, ['nested', 'b'])).toEqual(b)

  expect(() => Storage.getEntry(root, '..')).toThrowError(
    "Invalid path .., can't go up past root"
  )
  expect(() => Storage.getEntry(root, '/c')).toThrowError('File c not found')
  expect(() => Storage.getEntry(root, '/nested/c')).toThrowError(
    'File nested/c not found'
  )
  expect(() => Storage.getEntry(root, '/nested/b/c')).toThrowError(
    'File nested/b is not a directory'
  )
})

it('reading', () => {
  const a = Entries.createFile(new Uint8Array())
  const b = Entries.createFile(new Uint8Array())
  const nested = Entries.createDirectory({ b })
  const root = Entries.createDirectory({ a, nested })

  expect(Storage.readDirectory(root, '/')).toEqual(['a', 'nested'])
  expect(Storage.readDirectory(root, '/nested')).toEqual(['b'])
  expect(Storage.readFile(root, '/nested/b')).toEqual(b.data)
})

it('writing', () => {
  const root = Entries.createDirectory<string>()
  const withA = Storage.makeDirectory(root, '/a')
  const withAB = Storage.makeDirectory(withA, '/b')
  const withAC = Storage.writeFile(withA, '/c', 'hello')

  expect(diagram(root)).toMatchSnapshot()
  expect(diagram(withA)).toMatchSnapshot()
  expect(diagram(withAB)).toMatchSnapshot()
  expect(diagram(withAC)).toMatchSnapshot()
})
