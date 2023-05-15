import isEqual from 'lodash/isEqual'
import { useCallback, useMemo, useState } from 'react'

type IsEqualFn<T = any> = (a: T, b: T) => boolean
type IsEqualFns<T> = Partial<Record<keyof T, IsEqualFn<T[keyof T]>>>

export function useUpdateState<T extends { [key: string]: unknown }>(
  initialState: T,
  isEqualFns?: IsEqualFns<T>
) {
  const [state, setState] = useState({ ...initialState })
  const [errors, setErrors] = useState({})

  const update = useCallback(
    (update: Partial<T>) => {
      setState({ ...state, ...update })
    },
    [state]
  )

  const reset = useCallback(() => {
    setState({ ...initialState })
  }, [initialState])

  const updateErrors = useCallback(
    (update: Partial<T>) => {
      setErrors({ ...errors, ...update })
    },
    [errors]
  )

  const clearErrors = useCallback(() => setErrors({}), [])

  const hasUpdates = useMemo(() => {
    for (const [key, value] of Object.entries(state)) {
      const isEqualFn = isEqualFns?.[key]

      if (isEqualFn) {
        if (isEqualFn(value as any, initialState[key] as any)) {
          return true
        }
      } else if (!isEqual(value, initialState[key])) {
        return true
      }
    }

    return false
  }, [isEqualFns, initialState, state])

  return {
    state: { ...state },
    hasUpdates,
    update,
    reset,
    initialState: { ...initialState },
    errors,
    updateErrors,
    clearErrors,
  }
}
