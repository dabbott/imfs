// import { encode } from 'base64-arraybuffer'
import type { IFS } from 'buffs'
import type { ObjectEncodingOptions, PathOrFileDescriptor, Stats } from 'fs'
import * as Storage from './storage/storage'
import { TextEncoder } from 'util'
import { Buffer } from 'buffer'

export function toUint8Array(data: string | ArrayBufferView) {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data)
  } else {
    return new Uint8Array(data.buffer)
  }
}

// function fileNameToString(file: PathOrFileDescriptor): string {
//   if (typeof file !== 'string')
//     throw new Error('only string filepaths are supported')

//   return file
// }

// type FunctionWithStorage<T extends (...args: any[]) => any> = (
//   storage: Storage.Directory,
//   ...rest: Parameters<T>
// ) => ReturnType<T>

// export const writeFileSync: FunctionWithStorage<IFS['writeFileSync']> =
//   function writeFileSync(storage, file, data) {
//     const bytes = toUint8Array(data)
//     const filename = fileNameToString(file)
//     Storage.writeFile(storage, filename, bytes)
//   }

// export const readFileSync: FunctionWithStorage<IFS['readFileSync']> =
//   function readFileSync(storage, path, options) {
//     const filename = fileNameToString(path)
//     const bytes = Storage.getFile(storage, filename)

//     if (!bytes) throw new Error('File not found')

//     return Buffer.from(bytes as any)
//   }

// export const lstatSync: FunctionWithStorage<IFS['lstatSync']> =
//   function lstatSync(storage, path, options) {
//     const filename = fileNameToString(path)

//     let file: Storage.Entry

//     if (filename === '/') {
//       file = storage
//     } else {
//       const entry = Storage.locate(storage, filename)

//       if (!entry) throw new Error(`File ${filename} not found`)

//       file = entry.parent[entry.name]
//     }

//     return {
//       isDirectory() {
//         return Storage.isDirectory(file)
//       },
//       isFile() {
//         return Storage.isFile(file)
//       },
//     } as Stats
//   }

// export const readdirSync: FunctionWithStorage<IFS['readdirSync']> =
//   function readdirSync(storage, path, options) {
//     const filename = fileNameToString(path)
//     return Storage.readDirectory(storage, filename) as any
//   }

// export function bind(root: Storage.Directory): Partial<IFS> {
//   return {
//     // writeFileSync: writeFileSync.bind(null, root),
//     // readFileSync: readFileSync.bind(null, root) as any,
//     // lstatSync: lstatSync.bind(null, root) as any,
//     // readdirSync: readdirSync.bind(null, root) as any,
//     // chmodSync: () => {},
//   }
// }
