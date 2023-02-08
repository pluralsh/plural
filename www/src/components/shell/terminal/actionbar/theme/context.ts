import { Dispatch, SetStateAction, createContext } from 'react'

interface ContextProps {
  theme: string
  setTheme: Dispatch<SetStateAction<string>>
}

const TerminalThemeContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { TerminalThemeContext }
