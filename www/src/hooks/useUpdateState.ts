import { isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'

export function useUpdateState<T extends { [key: string]: unknown }>(
  initialState: T
) {
  const [state, setState] = useState({ ...initialState })

  const update = useCallback(
    (update: Partial<T>) => {
      setState({ ...state, ...update })
    },
    [state]
  )
  const reset = useCallback(() => {
    setState({ ...initialState })
  }, [initialState])

  const hasUpdates = useMemo(() => {
    for (const [prop, value] of Object.entries(state)) {
      if (!isEqual(value, initialState[prop])) {
        return true
      }
    }

    return false
  }, [initialState, state])

  return {
    state: { ...state },
    hasUpdates,
    update,
    reset,
    initialState: { ...initialState },
  }
}
