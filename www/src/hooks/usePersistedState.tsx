import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'

const identity = (x: any) => x

// 12 hours, but only used if TTL key explicitly provided
const DEFAULT_TTL_DURATION = 12 * 60 * 60 * 1000

type TTLConfig = {
  key: string
  duration?: number
}

// useState with localStorage persistence
function usePersistedState<T>(
  key: string,
  defaultValue: T,
  ttl?: TTLConfig,
  parser = identity
): [T, Dispatch<SetStateAction<T>>] {
  const ttlKey = ttl ? `plural-${ttl.key}-timestamp` : ''
  const itemKey = `plural-${key}`
  const getInitialVal = useCallback(() => {
    try {
      // if TTL key provided, check if it's expired or not found
      if (ttl) {
        const timestamp = JSON.parse(localStorage.getItem(ttlKey) ?? 'null')
        if (
          !timestamp ||
          Date.now() - timestamp > (ttl.duration ?? DEFAULT_TTL_DURATION)
        )
          return defaultValue
      }
      const item = localStorage.getItem(itemKey)
      if (item) return parser(JSON.parse(item))
    } catch (error) {
      console.log('Error on localStorage.getItem of', key)
    }

    return defaultValue
  }, [key, defaultValue, parser, ttl])

  const [state, setState] = useState<T>(getInitialVal())

  useEffect(() => {
    localStorage.setItem(itemKey, JSON.stringify(state))
    if (ttlKey !== '') localStorage.setItem(ttlKey, JSON.stringify(Date.now()))
  }, [key, state, ttlKey])

  return [state, setState]
}

export default usePersistedState
