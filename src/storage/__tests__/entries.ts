import { Entries } from '../entries'
import { Directory } from '../types'

it('entry tools', () => {
  const file = Entries.createFile(Uint8Array.from([0, 1, 2, 3]))
  const directory = Entries.createDirectory({})

  expect(Entries.isFile(directory)).toBe(false)
  expect(Entries.isFile(file)).toBe(true)

  expect(Entries.isDirectory(directory)).toBe(true)
  expect(Entries.isDirectory(file)).toBe(false)
})

// it('gets entries by path', () => {
//   const directory = {
//     a: new Uint8Array(),
//     nested: {
//       b: new Uint8Array(),
//     },
//   }

//   expect(Storage.getEntry(directory, '.')).toEqual(directory)
//   expect(Storage.getEntry(directory, '/')).toEqual(directory)
//   expect(Storage.getEntry(directory, 'a')).toEqual(directory.a)
//   expect(Storage.getEntry(directory, 'fake')).toEqual(undefined)
//   expect(Storage.getEntry(directory, 'nested/b')).toEqual(directory.nested.b)
//   expect(Storage.getEntry(directory, 'nested/fake')).toEqual(undefined)
// })

it('read directory', () => {
  const directory = Entries.createDirectory({
    a: Entries.createFile(new Uint8Array()),
    nested: Entries.createDirectory({
      b: Entries.createFile(new Uint8Array()),
    }),
  })

  expect(Entries.readDirectory(directory)).toEqual(['a', 'nested'])
  expect(
    Entries.readDirectory(Entries.getEntry(directory, 'nested') as Directory)
  ).toEqual(['b'])

  expect(
    Entries.TraverseEntries.diagram(
      ['/', directory],
      ([pathname, entry]) => `${pathname} (${entry.type})`
    )
  ).toMatchSnapshot()
})
