import { Dispatch, SetStateAction, createContext } from 'react'

interface ContextProps {
  domains: Record<string, string>
  setDomains: Dispatch<SetStateAction<Record<string, string>>>
}

const InstallerContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { InstallerContext }
