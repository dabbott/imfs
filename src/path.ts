export const sep = '/'

function preserveLeadingAndTrailingSlash(original: string, updated: string) {
  if (original.startsWith('/')) {
    updated = '/' + updated
  }

  if (updated[updated.length - 1] !== '/' && original.endsWith('/')) {
    updated = updated + '/'
  }

  return updated
}

export function normalize(filename: string) {
  const components = filename.split(sep).filter((component) => !!component)

  let i = 0
  let length = components.length - 1

  while (i < length) {
    if (components[i] === '.') {
      components.splice(i, 1)
      length--
    } else if (components[i] === '..' && i !== 0) {
      components.splice(i - 1, 2)
      length -= 2
      i -= 1
    } else if (components[i] === '' && components[i + 1] === '') {
      // Consecutive "/"
      components.splice(i, 1)
      length--
    } else {
      i++
    }
  }

  return preserveLeadingAndTrailingSlash(filename, components.join(sep))
}

export function join(...components: string[]) {
  let result = normalize(components.join(sep))

  if (result === '') {
    result = '.'
  }

  return result
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
  let base = basename(filename)
  let result = filename.slice(0, -(base.length + 1))

  if (result === '') {
    if (filename.startsWith(sep)) {
      result = sep
    } else {
      result = '.'
    }
  }

  return result
}
