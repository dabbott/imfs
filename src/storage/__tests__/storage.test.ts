import { Entries } from '../entries'
import { Storage } from '../storage'

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
  const nested = Entries.createDirectory({
    b,
  })
  const directory = Entries.createDirectory({
    a,
    nested,
  })

  expect(Storage.getEntry(directory, '/')).toEqual(directory)
  expect(Storage.getEntry(directory, '.')).toEqual(directory)
  expect(Storage.getEntry(directory, '/a')).toEqual(a)
  expect(Storage.getEntry(directory, 'a')).toEqual(a)
  expect(Storage.getEntry(directory, '/nested')).toEqual(nested)
  expect(Storage.getEntry(directory, '/nested/b')).toEqual(b)
  expect(Storage.getEntry(directory, ['nested', 'b'])).toEqual(b)

  expect(() => Storage.getEntry(directory, '..')).toThrowError(
    "Invalid path .., can't go up past root"
  )
  expect(() => Storage.getEntry(directory, '/c')).toThrowError(
    'File c not found'
  )
  expect(() => Storage.getEntry(directory, '/nested/c')).toThrowError(
    'File nested/c not found'
  )
  expect(() => Storage.getEntry(directory, '/nested/b/c')).toThrowError(
    'File nested/b is not a directory'
  )
})
