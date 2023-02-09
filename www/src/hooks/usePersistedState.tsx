import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'

const identity = (x: any) => x

// useState with localStorage persistence
function usePersistedState<T>(key: string, defaultValue: T, parser = identity): [T, Dispatch<SetStateAction<T>>] {
  const getLocalStorageValue = useCallback(() => {
    try {
      const item = localStorage.getItem(`plural-${key}`)

      if (item) return parser(JSON.parse(item))
    }
    catch (error) {
      console.log('Error on localStorage.getItem of', key)
    }

    return defaultValue
  }, [key, defaultValue, parser])

  const [state, setState] = useState<T>(getLocalStorageValue())

  useEffect(() => {
    localStorage.setItem(`plural-${key}`, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}

export default usePersistedState
