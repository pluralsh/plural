import {
  chunk,
  groupBy,
  lookahead,
  mergeAppend,
  reverse,
  rollup,
} from './array'

describe('test array functions', () => {
  it('test reverse', () => {
    const arr = [1, 2, 3, 4]
    const ret: number[] = []

    reverse(arr)

    for (const i of reverse(arr)) {
      ret.push(i)
    }
    assert.deepEqual(ret, [4, 3, 2, 1])
  })
})

describe('rollup', () => {
  it('should return the correct values', () => {
    const array = [1, 2, 3]

    const result = [...rollup(array)]

    expect(result).toEqual([1, 2, 3])
  })

  it('should return the correct values with a mapper', () => {
    const array = [1, 2, 3]

    const mapper = (item, prev) => item + prev

    const result = [...rollup(array, mapper)]

    expect(result).toEqual([1, 3, 5])
  })
})

describe('lookahead', () => {
  it('should return the correct values', () => {
    const array = [1, 2, 3, 4]

    const expected = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, {}],
    ]
    let index = 0

    for (const item of lookahead(array)) {
      expect(item).toEqual(expected[index])

      index++
    }

    expect(index).toBe(4) // check that all elements have been iterated over
  })

  it('should apply the mapper function correctly', () => {
    const array = [1, 2, 3]

    const expected = [[2, 4], [4, 6], [6, {}]]

    let index = 0

    for (const item of lookahead(array, i => i * 2)) {
      expect(item).toEqual(expected[index])

      index++
    }

    expect(index).toBe(3) // check that all elements have been iterated over
  })
})

describe('mergeAppend', () => {
  it('should return a new array with the previous and list items combined', () => {
    const list = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
    const previous = [{ id: 3, name: 'Jack' }]

    expect(mergeAppend(list, previous)).toEqual([{ id: 3, name: 'Jack' }, { id: 1, name: 'John' }, { id: 2, name: 'Jane' }])
  })

  it('should not duplicate items in the new array', () => {
    const list = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
    const previous = [{ id: 1, name: 'John' }, { id: 3, name: 'Jack' }]

    expect(mergeAppend(list, previous)).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Jack' }, { id: 2, name: 'Jane' }])
  })

  it('should use the key function to determine if an item is a duplicate', () => {
    const list = [{ _id: 1, name: 'John' }, { _id: 2, name: 'Jane' }]
    const previous = [{ _id: 1, name: 'John' }, { _id: 3, name: 'Jack' }]

    expect(mergeAppend(list, previous, e => e._id)).toEqual([{ _id: 1, name: 'John' }, { _id: 3, name: 'Jack' }, { _id: 2, name: 'Jane' }])
  })
})

describe('groupBy', () => {
  it('should group items by a given key', () => {
    const list = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Jack' },
    ]
    const expected = {
      1: [{ id: 1, name: 'John' }],
      2: [{ id: 2, name: 'Jane' }],
      3: [{ id: 3, name: 'Jack' }],
    }

    expect(groupBy(list)).toEqual(expected)
  })

  it('should group items by a custom key', () => {
    const list = [
      { typeId: 1, typeName: 'Foo' },
      { typeId: 2, typeName: 'Bar' },
      { typeId: 3, typeName: 'Baz' },
    ]
    const expected = {
      Foo: [{ typeId: 1, typeName: 'Foo' }],
      Bar: [{ typeId: 2, typeName: 'Bar' }],
      Baz: [{ typeId: 3, typeName: 'Baz' }],
    }

    expect(groupBy(list, item => item.typeName)).toEqual(expected)
  })
})

describe('chunk', () => {
  it('should return an array of chunks of the given size', () => {
    const array = [1, 2, 3, 4, 5]
    const chunkSize = 2
    const expectedResult = [[1, 2], [3, 4], [5]]

    expect(Array.from(chunk(array, chunkSize))).toEqual(expectedResult)
  })

  it('should return an empty array when given an empty array', () => {
    const array = []
    const chunkSize = 2

    expect(Array.from(chunk(array, chunkSize))).toEqual([])
  })

  it('should return an array with a single element when the size of the given array is smaller than the chunk size', () => {
    const array = [1]
    const chunkSize = 2

    expect(Array.from(chunk(array, chunkSize))).toEqual([[1]])
  })
})
