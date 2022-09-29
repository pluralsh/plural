import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import {
  persistApplications,
  persistConsole,
  persistProvider,
  persistStack,
  persistTerminalOnboardingSidebar,
  retrieveApplications,
  retrieveConsole,
  retrieveProvider,
  retrieveStack,
  retrieveTerminalOnboardingSidebar,
} from './persistance'

export function usePersistedApplications(): [any[], Dispatch<SetStateAction<any[]>>] {
  const [applications, setApplications] = useState(retrieveApplications())

  useEffect(() => {
    persistApplications(applications)
  }, [applications])

  return [applications, setApplications]
}

export function usePersistedProvider(): [string, Dispatch<SetStateAction<string>>] {
  const [provider, setProvider] = useState(retrieveProvider)

  useEffect(() => {
    persistProvider(provider)
  }, [provider])

  return [provider, setProvider]
}

export function usePersistedStack(): [any, Dispatch<SetStateAction<any>>] {
  const [stack, setStack] = useState(retrieveStack)

  useEffect(() => {
    persistStack(stack)
  }, [stack])

  return [stack, setStack]
}

export function usePersistedConsole(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [console, setConsole] = useState(retrieveConsole)

  useEffect(() => {
    persistConsole(console)
  }, [console])

  return [console, setConsole]
}

export function usePersistedTerminalOnboardingSidebar(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [terminalOnboardingSidebar, setTerminalOnboardingSidebar] = useState(retrieveTerminalOnboardingSidebar)

  useEffect(() => {
    persistTerminalOnboardingSidebar(terminalOnboardingSidebar)
  }, [terminalOnboardingSidebar])

  return [terminalOnboardingSidebar, setTerminalOnboardingSidebar]
}
