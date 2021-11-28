import { path } from '../index'
import nodePath from 'path'

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

// test('dirname', () => {
//   expect(dirname('foo')).toEqual('')
//   expect(dirname('bar/foo')).toEqual('bar')
//   expect(dirname('bar/baz/foo')).toEqual('bar/baz')

//   expect(dirname('')).toEqual('.')
//   expect(dirname('/')).toEqual('/')
//   expect(dirname('bar/')).toEqual('bar')
// })

// test('join', () => {
//   expect(join('foo')).toEqual('foo')
//   expect(join('bar', 'foo')).toEqual('bar/foo')
//   expect(join('bar', 'baz', 'foo')).toEqual('bar/baz/foo')

//   expect(join('')).toEqual('')
//   expect(join('bar', '', 'foo')).toEqual('bar/foo')
// })
