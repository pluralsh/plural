import { Dispatch, SetStateAction, createContext } from 'react'

import { CloudShell, ShellConfiguration } from '../../../../generated/graphql'

enum State {
  New = 'New',
  InProgress = 'InProgress',
  Installed = 'Installed'
}

interface ContextProps {
  shell: CloudShell
  configuration: ShellConfiguration
  state: State
  setState: Dispatch<SetStateAction<State>>
}

const TerminalContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { TerminalContext, State }
