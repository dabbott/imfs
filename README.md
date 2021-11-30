# imfs

A immutable filesystem-like data structure that supports updates via structural sharing. Use this when you want to store the entire history of a filesystem in a low-memory way.

```bash
npm install --save imfs
```

OR

```bash
yarn add imfs
```

## API

There are 4 categories of functions:

1. **`Volume`**: A collection of filesystem-like APIs e.g. `readFile`, `writeFile`. These functions let you use paths to traverse a hierarchy of file nodes. This is likely the main thing you'll use.
2. **`Nodes`**: Lower-level functions for working with file nodes.
3. **`Entries`**: A couple small helpers for traversing the volume. Useful when combined with a tree traversal library like [tree-visit](https://github.com/dabbott/tree-visit).
4. **`path`**: A subset of node's `path` API. Only supports Unix-style paths.

## Usage

To start, create a volume. In TypeScript, each volume has 2 type parameters: the `Data` type that will be used to store file data, and optionally any `Metadata` that should be stored alongside each file and directory.

```ts
import { Volume } from 'imfs'

// Initialize a volume where files are stored as strings, with no metadata.
const root = Volume.create<string>()

// Write the string 'Hello, world!' into the file 'e.txt'
const updated = Volume.writeFile(root, '/a/b/c/d/e.txt', 'Hello, world!', {
  makeIntermediateDirectories: true,
})

// Read the string stored in 'e.txt'
const data = Volume.readFile(updated, '/a/b/c/d/e.txt')

console.log(data) // $> Hello, world!
```

For a more realistic filesystem, use type like `Buffer` as the `Data` type (to support binary data), and a type like node's `fs.Stats` as the `Metadata` type (for permissions, timestamps, etc).

### Volume

- `create`
- `getMetadata`
- `getNode`
- `getPathComponents`
- `makeDirectory`
- `readDirectory`
- `readFile`
- `removeFile`
- `setMetadata`
- `setNode`
- `writeFile`

### Nodes

- `createDirectory`
- `createFile`
- `getChild`
- `getMetadata`
- `hasChild`
- `isDirectory`
- `isFile`
- `readDirectory`

### Entries

- `createEntry`
- `getEntries`

### path

- `basename`
- `dirname`
- `extname`
- `join`
- `normalize`
- `sep`
