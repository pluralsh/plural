export function* reverse(array, mapper = (i) => i) {
  for (let i = array.length - 1; i >= 0; i--) {
    yield mapper(array[i])
  }
}

export function* lookahead(array, mapper = (i) => i) {
  let len = array.length
  for (let i = 0; i < len; i++) {
    yield mapper(array[i], array[i + 1] || {})
  }
}

export function* chunk(array, chunkSize) {
  let i, j;
  for (i=0, j=array.length ; i<j; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}