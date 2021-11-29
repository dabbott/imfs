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

it('read directory', () => {
  const directory = Entries.createDirectory({
    a: Entries.createFile(new Uint8Array()),
    nested: Entries.createDirectory({
      b: Entries.createFile(new Uint8Array()),
    }),
  })

  expect(Entries.readDirectory(directory)).toEqual(['a', 'nested'])
  expect(
    Entries.readDirectory(
      Entries.getEntry(directory, 'nested') as Directory<Uint8Array>
    )
  ).toEqual(['b'])

  expect(
    Entries.traverse().diagram(
      ['/', directory],
      ([pathname, entry]) => `${pathname} (${entry.type})`
    )
  ).toMatchSnapshot()
})
