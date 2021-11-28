import { Storage } from '..'

it('detects files vs directories', () => {
  const file = Uint8Array.from([0, 1, 2, 3])
  const directory = {}

  expect(Storage.isFile(directory)).toBe(false)
  expect(Storage.isFile(file)).toBe(true)

  expect(Storage.isDirectory(directory)).toBe(true)
  expect(Storage.isDirectory(file)).toBe(false)
})

it('gets entries by path', () => {
  const directory = {
    a: new Uint8Array(),
    nested: {
      b: new Uint8Array(),
    },
  }

  expect(Storage.getEntry(directory, '.')).toEqual(directory)
  expect(Storage.getEntry(directory, '/')).toEqual(directory)
  expect(Storage.getEntry(directory, 'a')).toEqual(directory.a)
  expect(Storage.getEntry(directory, 'fake')).toEqual(undefined)
  expect(Storage.getEntry(directory, 'nested/b')).toEqual(directory.nested.b)
  expect(Storage.getEntry(directory, 'nested/fake')).toEqual(undefined)
})

it('read directory', () => {
  const directory = {
    a: new Uint8Array(),
    nested: {
      b: new Uint8Array(),
    },
  }

  expect(Storage.readDirectory(directory)).toEqual(['a', 'nested'])
  expect(
    Storage.readDirectory(
      Storage.getEntry(directory, 'nested') as Storage.Directory
    )
  ).toEqual(['b'])
})
