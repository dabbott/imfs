import nodePath from 'path'
import { path } from '..'

test('basename', () => {
  expect(path.basename('foo')).toEqual(nodePath.basename('foo'))
  expect(path.basename('bar/foo')).toEqual(nodePath.basename('bar/foo'))
  expect(path.basename('bar/baz/foo')).toEqual(nodePath.basename('bar/baz/foo'))

  expect(path.basename('bar.js', '.js')).toEqual(
    nodePath.basename('bar.js', '.js')
  )
  expect(path.basename('bar.js', '.ts')).toEqual(
    nodePath.basename('bar.js', '.ts')
  )

  expect(path.basename('')).toEqual(nodePath.basename(''))
  expect(path.basename('/')).toEqual(nodePath.basename('/'))
  expect(path.basename('/bar')).toEqual(nodePath.basename('/bar'))
  expect(path.basename('./bar')).toEqual(nodePath.basename('./bar'))
  expect(path.basename('bar/')).toEqual(nodePath.basename('bar/'))
})

test('normalize', () => {
  expect(path.normalize('foo')).toEqual(nodePath.normalize('foo'))
  expect(path.normalize('foo/')).toEqual(nodePath.normalize('foo/'))
  expect(path.normalize('/foo')).toEqual(nodePath.normalize('/foo'))
  expect(path.normalize('/foo/')).toEqual(nodePath.normalize('/foo/'))
  expect(path.normalize('/foo/bar')).toEqual(nodePath.normalize('/foo/bar'))
  expect(path.normalize('/foo//bar')).toEqual(nodePath.normalize('/foo//bar'))
  expect(path.normalize('//')).toEqual(nodePath.normalize('//'))
  expect(path.normalize('/////')).toEqual(nodePath.normalize('/////'))
})

test('dirname', () => {
  expect(path.dirname('foo')).toEqual(nodePath.dirname('foo'))
  expect(path.dirname('bar/foo')).toEqual(nodePath.dirname('bar/foo'))
  expect(path.dirname('bar/baz/foo')).toEqual(nodePath.dirname('bar/baz/foo'))
  expect(path.dirname('/foo')).toEqual(nodePath.dirname('/foo'))

  expect(path.dirname('')).toEqual(nodePath.dirname(''))
  expect(path.dirname('/')).toEqual(nodePath.dirname('/'))
  expect(path.dirname('bar/')).toEqual(nodePath.dirname('bar/'))
})

test('join', () => {
  expect(path.join('foo')).toEqual(nodePath.join('foo'))
  expect(path.join('bar', 'foo')).toEqual(nodePath.join('bar', 'foo'))
  expect(path.join('bar', 'baz', 'foo')).toEqual(
    nodePath.join('bar', 'baz', 'foo')
  )
  expect(path.join('/', 'bar')).toEqual(nodePath.join('/', 'bar'))

  expect(path.join('')).toEqual(nodePath.join(''))
  expect(path.join('/')).toEqual(nodePath.join('/'))
  expect(path.join('/', '/')).toEqual(nodePath.join('/', '/'))
  expect(path.join('bar', '', 'foo')).toEqual(nodePath.join('bar', '', 'foo'))
})
