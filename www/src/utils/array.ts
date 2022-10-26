export function* reverse(array: any[], mapper: (...args) => void = i => i) {
  for (let i = array.length - 1; i >= 0; i--) {
    yield mapper(array[i])
  }
}

export function* rollup(array: any[], mapper: (...args) => void = i => i) {
  let prev = {}

  for (const item of array) {
    yield mapper(item, prev)
    prev = item
  }
}

export function* lookahead(array: any[], mapper: (...args) => void = i => i) {
  const len = array.length

  for (let i = 0; i < len; i++) {
    yield mapper(array[i], array[i + 1] || {})
  }
}

export function mergeAppend(list, previous, key = i => i.id) {
  const ids = new Set(previous.map(key))

  return [...previous, ...list.filter(e => !ids.has(key(e)))]
}

export function groupBy(list, key = i => i.id) {
  const grouped = {}

  for (const item of list) {
    const k = key(item)
    const group = grouped[k] || []

    group.push(item)
    grouped[k] = group
  }

  return grouped
}

export function* chunk(array: any[], chunkSize) {
  let i; let
    j

  for (i = 0, j = array.length; i < j; i += chunkSize) {
    yield array.slice(i, i + chunkSize)
  }
}

export function trimSuffix(str, suff) {
  if (str.endsWith(suff)) {
    return str.slice(0, str.length - suff.length)
  }

  return str
}
