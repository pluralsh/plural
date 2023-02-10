import { isNil } from 'lodash'

// Functions to use in Array.filter() that will inform the type checker that
// null and undefined values are guaranteed filtered out

export function notNil<T>(value: T | null | undefined): value is T {
  return !isNil(value)
}

export function notNilAnd<T>(filterFunc: (value: T) => boolean) {
  return function combinedFilter(value: T | null | undefined): value is T {
    return notNil(value) && filterFunc(value)
  }
}
