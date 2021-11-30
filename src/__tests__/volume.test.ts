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

it('writing', () => {
  const root = Nodes.createDirectory<string>()
  const withA = Volume.makeDirectory(root, '/a')
  const withAB = Volume.makeDirectory(withA, '/b')
  const withAC = Volume.writeFile(withA, '/c', 'hello')
  const withABCDE = Volume.writeFile(root, '/a/b/c/d/e', 'hello', {
    makeIntermediateDirectories: true,
  })
  const withABCDEDirectory = Volume.makeDirectory(root, '/a/b/c/d/e', {
    makeIntermediateDirectories: true,
  })

  expect(() => Volume.writeFile(root, '/a/b/c/d/e', 'hello')).toThrowError(
    'File a/b/c/d not found'
  )

  expect(diagram(root)).toMatchSnapshot()
  expect(diagram(withA)).toMatchSnapshot()
  expect(diagram(withAB)).toMatchSnapshot()
  expect(diagram(withAC)).toMatchSnapshot()
  expect(diagram(withABCDE)).toMatchSnapshot()
  expect(diagram(withABCDEDirectory)).toMatchSnapshot()
})

it('removing', () => {
  const root = Nodes.createDirectory<string>()
  const withA = Volume.makeDirectory(root, '/a')
  const withAC = Volume.writeFile(withA, '/a/c', 'hello')

  expect(diagram(withAC)).toMatchSnapshot()
  expect(diagram(Volume.removeFile(withAC, '/a/c'))).toMatchSnapshot()
  expect(diagram(Volume.removeFile(withAC, '/a'))).toMatchSnapshot()
})

it('metadata', () => {
  const root = Nodes.createDirectory<string, number>({}, 0)
  const withA = Volume.makeDirectory(root, '/a', {
    metadata: 1,
  })
  const withAC = Volume.writeFile(withA, '/a/c', 'hello', {
    metadata: 2,
  })
  const withAMetadata = Volume.setMetadata(withA, '/a', 3)
  const withACMetadata = Volume.setMetadata(withAC, '/a/c', 4)

  const paths: string[] = []
  const withABCDEMetadata = Volume.writeFile(root, '/a/b/c/d/e', 'hello', {
    metadata: 5,
    makeIntermediateDirectoryMetadata: (path) => {
      paths.push(path)
      return 0
    },
  })

  expect(Volume.getMetadata(root, '/')).toEqual(0)
  expect(Volume.getMetadata(withAMetadata, '/a')).toEqual(3)
  expect(Volume.getMetadata(withACMetadata, '/a/c')).toEqual(4)
  expect(Volume.getMetadata(withA, '/a')).toEqual(1)
  expect(Volume.getMetadata(withAC, '/a/c')).toEqual(2)
  expect(Volume.getMetadata(withABCDEMetadata, '/a/b/c/d/e')).toEqual(5)
  expect(paths).toEqual(['a', 'a/b', 'a/b/c', 'a/b/c/d'])
})
