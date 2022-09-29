import { Dispatch, SetStateAction, createContext } from 'react'

export type TerminalThemeContextType = [string, Dispatch<SetStateAction<string>>]

export default createContext<TerminalThemeContextType>(['', () => {}])
