export function* reverse(array, mapper = (i) => i) {
  for (let i = array.length - 1; i >= 0; i--) {
    yield mapper(array[i])
  }
}

export function* rollup(array, mapper = (i) => i) {
  let prev = {}
  for (let item of array) {
    yield mapper(item, prev)
    prev = item
  }
}

export function* lookahead(array, mapper = (i) => i) {
  let len = array.length
  for (let i = 0; i < len; i++) {
    yield mapper(array[i], array[i + 1] || {})
  }
}

export function mergeAppend(list, previous, key = (i) => i.id) {
  const ids = new Set(previous.map(key))
  return [...previous, ...list.filter((e) => !ids.has(key(e)))]
}

export function groupBy(list, key = (i) => i.id) {
  let grouped = {}
  for (const item of list) {
    const k = key(item)
    let group = grouped[k] || []
    group.push(item)
    grouped[k] = group
  }
  return grouped
}

export function* chunk(array, chunkSize) {
  let i, j;
  for (i=0, j=array.length ; i<j; i += chunkSize) {
    yield array.slice(i,i + chunkSize);
}
}