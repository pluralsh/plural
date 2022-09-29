import { Dispatch, SetStateAction, createContext } from 'react'

export type OnboardigContextType = {
  applications: any[],
  provider: string,
  stack: any
  console: boolean
  terminalOnboardingSidebar: boolean
  setApplications: Dispatch<SetStateAction<any[]>>
  setProvider: Dispatch<SetStateAction<string>>
  setStack: Dispatch<SetStateAction<any>>
  setConsole: Dispatch<SetStateAction<boolean>>
  setTerminalOnboardingSidebar: Dispatch<SetStateAction<boolean>>
}

export default createContext<OnboardigContextType>({
  applications: [],
  provider: 'GCP',
  stack: null,
  console: true,
  terminalOnboardingSidebar: true,
  setApplications: () => {},
  setProvider: () => {},
  setStack: () => {},
  setConsole: () => {},
  setTerminalOnboardingSidebar: () => {},
})
