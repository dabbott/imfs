import { withOptions } from 'tree-visit'
import { Entries, Entry, Node, Nodes, path, Volume } from '..'

const { diagram: nodeDiagram } = withOptions<Entry<string, void>>({
  getChildren: Entries.getEntries,
})

function diagram(root: Node<string, void>) {
  return nodeDiagram(
    Entries.createEntry('/', root),
    ([pathname, node]) =>
      `${pathname === '/' ? '/' : path.basename(pathname)} (${node.type})`
  )
}

it('gets path components', () => {
  expect(Volume.getPathComponents('/')).toEqual([])
  expect(Volume.getPathComponents('.')).toEqual([])
  expect(Volume.getPathComponents('/a')).toEqual(['a'])
  expect(Volume.getPathComponents('/nested')).toEqual(['nested'])
  expect(Volume.getPathComponents('/nested/b')).toEqual(['nested', 'b'])
})

it('gets node', () => {
  const a = Nodes.createFile(new Uint8Array())
  const b = Nodes.createFile(new Uint8Array())
  const nested = Nodes.createDirectory({ b })
  const root = Nodes.createDirectory({ a, nested })

  expect(Volume.getNode(root, '/')).toEqual(root)
  expect(Volume.getNode(root, '.')).toEqual(root)
  expect(Volume.getNode(root, '/a')).toEqual(a)
  expect(Volume.getNode(root, 'a')).toEqual(a)
  expect(Volume.getNode(root, '/nested')).toEqual(nested)
  expect(Volume.getNode(root, '/nested/b')).toEqual(b)
  expect(Volume.getNode(root, ['nested', 'b'])).toEqual(b)

  expect(() => Volume.getNode(root, '..')).toThrowError(
    "Invalid path .., can't go up past root"
  )
  expect(() => Volume.getNode(root, '/c')).toThrowError('File c not found')
  expect(() => Volume.getNode(root, '/nested/c')).toThrowError(
    'File nested/c not found'
  )
  expect(() => Volume.getNode(root, '/nested/b/c')).toThrowError(
    'File nested/b is not a directory'
  )
})

it('reading', () => {
  const a = Nodes.createFile(new Uint8Array())
  const b = Nodes.createFile(new Uint8Array())
  const nested = Nodes.createDirectory({ b })
  const root = Nodes.createDirectory({ a, nested })

  expect(Volume.readDirectory(root, '/')).toEqual(['a', 'nested'])
  expect(Volume.readDirectory(root, '/nested')).toEqual(['b'])
  expect(Volume.readFile(root, '/nested/b')).toEqual(b.data)
})

describe('mutations', () => {
  it('writing', () => {
    const volume = Volume.create<string>()

    expect(() => Volume.writeFile(volume, '/a/b/c/d/e', 'hello')).toThrowError(
      'File a/b/c/d not found'
    )

    expect(() => Volume.makeDirectory(volume, '/a/b/c/d/e')).toThrowError(
      'File a/b/c/d not found'
    )

    Volume.makeDirectory(volume, '/a')
    Volume.makeDirectory(volume, '/b')
    Volume.writeFile(volume, '/c', 'hello')
    Volume.writeFile(volume, '/a/b/c/d/e', 'hello', {
      makeIntermediateDirectories: true,
    })
    Volume.makeDirectory(volume, '/f/g/h/i/j', {
      makeIntermediateDirectories: true,
    })

    expect(diagram(volume)).toMatchSnapshot()
  })

  it('trailing slashes', () => {
    const root = Volume.create<string>()
    Volume.makeDirectory(root, '/a/')
    Volume.writeFile(root, '/a/d/', 'hello')

    expect(diagram(root)).toMatchSnapshot()
  })

  it('removing', () => {
    const root = Volume.create<string>()
    Volume.writeFile(root, '/a/c', 'hello', {
      makeIntermediateDirectories: true,
    })

    expect(diagram(root)).toMatchSnapshot()

    Volume.removeFile(root, '/a/c')

    expect(diagram(root)).toMatchSnapshot()

    Volume.removeFile(root, '/a')

    expect(diagram(root)).toMatchSnapshot()
  })

  it('metadata', () => {
    const root = Volume.create<string, number>({ metadata: 0 })

    expect(Volume.getMetadata(root, '/')).toEqual(0)

    Volume.makeDirectory(root, '/a', { metadata: 1 })

    expect(Volume.getMetadata(root, '/a')).toEqual(1)

    Volume.writeFile(root, '/a/c', 'hello', { metadata: 2 })

    expect(Volume.getMetadata(root, '/a/c')).toEqual(2)

    Volume.setMetadata(root, '/a', 3)

    expect(Volume.getMetadata(root, '/a')).toEqual(3)

    Volume.setMetadata(root, '/a/c', 4)

    expect(Volume.getMetadata(root, '/a/c')).toEqual(4)

    const paths: string[] = []

    Volume.writeFile(root, '/a/b/c/d/e', 'hello', {
      metadata: 5,
      makeIntermediateDirectoryMetadata: (path) => {
        paths.push(path)
        return 0
      },
    })

    expect(Volume.getMetadata(root, '/a/b/c/d/e')).toEqual(5)
    expect(paths).toEqual(['a/b', 'a/b/c', 'a/b/c/d'])
  })
})
