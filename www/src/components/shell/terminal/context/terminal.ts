import { createContext } from 'react'

import { CloudShell, ShellConfiguration } from '../../../../generated/graphql'

interface ContextProps {
  shell: CloudShell
  configuration: ShellConfiguration
}

const TerminalContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { TerminalContext }
