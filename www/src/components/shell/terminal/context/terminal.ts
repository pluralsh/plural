import { Dispatch, SetStateAction, createContext } from 'react'

import { CloudShell, ShellConfiguration } from '../../../../generated/graphql'

enum State {
  New = 'New',
  Installed = 'Installed',
}

interface ContextProps {
  shell: CloudShell
  configuration: ShellConfiguration
  state: State
  setState: Dispatch<SetStateAction<State>>
  onAction?: Dispatch<string>
  setOnAction: Dispatch<Dispatch<string>>
}

const TerminalContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { TerminalContext, State }
