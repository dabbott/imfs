import { getPathComponents } from './volume/paths'
import { getMetadata, getNode, readDirectory, readFile } from './volume/read'
import {
  create,
  makeDirectory,
  removeFile,
  setMetadata,
  setNode,
  writeFile,
} from './volume/write'

export const Volume = {
  // paths
  getPathComponents,
  // read
  getMetadata,
  getNode,
  readDirectory,
  readFile,
  // write
  create,
  makeDirectory,
  removeFile,
  setMetadata,
  setNode,
  writeFile,
}
