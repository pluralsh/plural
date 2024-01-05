import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

export type CursorPos = { x: number; y: number } | undefined

function useCursorPosInner() {
  const [cursorPos, setCursorPos] = useState<CursorPos>()

  useEffect(() => {
    const listener = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', listener)

    return () => window.removeEventListener('mousemove', listener)
  }, [setCursorPos])

  return cursorPos
}

export function useCursorPosition() {
  return useContext(CursorPosContext)
}

export const CursorPosContext = createContext<CursorPos>(undefined)

export function CursorPositionProvider({ children }: PropsWithChildren) {
  const cursorPos = useCursorPosInner()

  return (
    <CursorPosContext.Provider value={cursorPos}>
      {children}
    </CursorPosContext.Provider>
  )
}
