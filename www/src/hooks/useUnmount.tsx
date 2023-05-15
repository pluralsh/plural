import { useEffect, useRef } from 'react'

function useUnmount(effect: () => void) {
  const effectRef = useRef(effect)

  effectRef.current = effect

  useEffect(
    () => () => {
      effectRef.current()
    },
    []
  )
}

export default useUnmount
