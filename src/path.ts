export const sep = '/'

export function normalize(filename: string) {
  const segments = filename.split(sep)

  let i = 0
  let length = segments.length - 1

  while (i < length) {
    if (segments[i] === '.') {
      segments.splice(i, 1)
      length--
    } else if (segments[i] === '..' && i !== 0) {
      segments.splice(i - 1, 2)
      length -= 2
      i -= 1
    } else {
      i++
    }
  }

  return segments.join(sep)
}

export function join(...parts: string[]) {
  return normalize(parts.filter((part) => !!part).join(sep))
}

export function extname(filename: string) {
  const index = filename.lastIndexOf('.')
  return index !== -1 ? filename.slice(index) : filename
}

export function basename(filename: string, extname?: string) {
  if (extname && filename.endsWith(extname)) {
    filename = filename.slice(0, -extname.length)
  }

  const sepIndex = filename.lastIndexOf(sep)

  // If the seperator index is the last character, omit it
  if (sepIndex === filename.length - 1) {
    return filename.slice(0, -1)
  }

  return filename.slice(sepIndex + 1)
}

export function dirname(filename: string) {
  if (filename === '') return '.'
  if (filename === sep) return sep

  let base = basename(filename)
  return filename.slice(0, -(base.length + 1))
}
