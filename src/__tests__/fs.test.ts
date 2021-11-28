import { copy, createFs, IFS } from 'buffs'
import path, { basename } from 'path'
import { withOptions } from 'tree-visit'
import { bind } from '../fs'
import * as Storage from '../storage'

function isDirectory(source: IFS, path: string) {
  // console.log('is dir', source, path, source.lstatSync(path).isDirectory())
  return source.lstatSync(path).isDirectory()
}

function createVisitor(source: IFS, rootPath: string = '/') {
  return withOptions<string>({
    getChildren: (currentPath) => {
      const fullPath = path.join(rootPath, currentPath)

      if (!isDirectory(source, fullPath)) return []

      return source
        .readdirSync(fullPath)
        .map((child) => path.join(currentPath, child))
    },
  })
}

it('', () => {})

// it('writes files', () => {
//   const storage = create()
//   const filename = 'foo.text'

//   writeFileSync(storage, filename, 'Hello World')

//   const out = readFileSync(storage, filename).toString('utf8')

//   console.log(out)
// })

// it('copies', () => {
//   const testFs = createFs({
//     '/foo': 'Hello World',
//   })

//   // console.log(diagram)

//   const storage = Storage.create()
//   const fs = bind(storage)

//   copy(testFs, fs as IFS, '/')

//   // console.log(storage, Storage.readDirectory(storage))

//   const visitor = createVisitor(fs as IFS)
//   const diagram = visitor.diagram('/', (node) => basename(node))
//   // console.log(diagram)
// })
