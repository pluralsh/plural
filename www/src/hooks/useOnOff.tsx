import { useCallback, useMemo, useState } from 'react'

export default function useOnOff(initial: boolean) {
  const [isOn, setIsOn] = useState(initial)
  const setOn = useCallback(() => setIsOn(true), [])
  const setOff = useCallback(() => setIsOn(false), [])
  const toggle = useCallback(() => setIsOn(!isOn), [isOn])
  const setValue = useCallback((value) => setIsOn(value), [])

  return useMemo(
    () => ({
      on: isOn,
      off: !isOn,
      setOn,
      setOff,
      toggle,
      setValue,
    }),
    [isOn, setOff, setOn, setValue, toggle]
  )
}
