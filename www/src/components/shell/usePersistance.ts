import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import {
  CONSOLE_LOCAL_STORAGE_KEY,
  CREDENTIALS_LOCAL_STORAGE_KEY,
  DEMO_ID_LOCAL_STORAGE_KEY,
  GIT_DATA_LOCAL_STORAGE_KEY,
  PROVIDER_LOCAL_STORAGE_KEY,
  SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY,
  STACK_LOCAL_STORAGE_KEY,
  TERMINAL_ONBOARDING_SIDEBAR_LOCAL_STORAGE_KEY,
  WORKSPACE_LOCAL_STORAGE_KEY,
} from './constants'

import {
  persistApplications,
  persistConsole,
  persistCredentials,
  persistDemoId,
  persistGitData,
  persistProvider,
  persistStack,
  persistTerminalOnboardingSidebar,
  persistWorkspace,
  retrieveApplications,
  retrieveConsole,
  retrieveCredentials,
  retrieveDemoId,
  retrieveGitData,
  retrieveProvider,
  retrieveStack,
  retrieveTerminalOnboardingSidebar,
  retrieveWorkspace,
} from './persistance'

const identity = (x: any) => x

function useStorageListener<T>(key: string, callback: (x: T) => void, transformer = identity) {
  useEffect(() => {
    function handleStorageEvent(event: StorageEvent) {
      if (event.key === key && event.newValue && event.oldValue !== event.newValue) {
        try {
          callback(transformer(JSON.parse(event.newValue) as T))
        }
        catch (error) {
          console.error(error)
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [key, callback, transformer])
}

export function usePersistedApplications(): [any[], Dispatch<SetStateAction<any[]>>] {
  const [applications, setApplications] = useState(retrieveApplications())

  useStorageListener(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY, setApplications)

  useEffect(() => {
    persistApplications(applications)
  }, [applications])

  return [applications, setApplications]
}

export function usePersistedProvider(): [string, Dispatch<SetStateAction<string>>] {
  const [provider, setProvider] = useState(retrieveProvider())

  useStorageListener(PROVIDER_LOCAL_STORAGE_KEY, setProvider)

  useEffect(() => {
    persistProvider(provider)
  }, [provider])

  return [provider, setProvider]
}

export function usePersistedStack(): [any, Dispatch<SetStateAction<any>>] {
  const [stack, setStack] = useState(retrieveStack())

  useStorageListener(STACK_LOCAL_STORAGE_KEY, setStack)

  useEffect(() => {
    persistStack(stack)
  }, [stack])

  return [stack, setStack]
}

export function usePersistedConsole(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [console, setConsole] = useState(retrieveConsole())

  useStorageListener(CONSOLE_LOCAL_STORAGE_KEY, setConsole, x => x === 'true')

  useEffect(() => {
    persistConsole(console)
  }, [console])

  return [console, setConsole]
}

export function usePersistedTerminalOnboardingSidebar(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [terminalOnboardingSidebar, setTerminalOnboardingSidebar] = useState(retrieveTerminalOnboardingSidebar())

  useStorageListener(TERMINAL_ONBOARDING_SIDEBAR_LOCAL_STORAGE_KEY, setTerminalOnboardingSidebar, x => x === 'true')

  useEffect(() => {
    persistTerminalOnboardingSidebar(terminalOnboardingSidebar)
  }, [terminalOnboardingSidebar])

  return [terminalOnboardingSidebar, setTerminalOnboardingSidebar]
}

export function usePersistedGitData(): [any, Dispatch<SetStateAction<any>>] {
  const [gitData, setGitData] = useState(retrieveGitData())

  useStorageListener(GIT_DATA_LOCAL_STORAGE_KEY, setGitData)

  useEffect(() => {
    persistGitData(gitData)
  }, [gitData])

  return [gitData, setGitData]
}

export function usePersistedWorkspace(): [any, Dispatch<SetStateAction<any>>] {
  const [workspace, setWorkspace] = useState(retrieveWorkspace())

  useStorageListener(WORKSPACE_LOCAL_STORAGE_KEY, setWorkspace)

  useEffect(() => {
    persistWorkspace(workspace)
  }, [workspace])

  return [workspace, setWorkspace]
}

export function usePersistedCredentials(): [any, Dispatch<SetStateAction<any>>] {
  const [credentials, setCredentials] = useState(retrieveCredentials())

  useStorageListener(CREDENTIALS_LOCAL_STORAGE_KEY, setCredentials)

  useEffect(() => {
    persistCredentials(credentials)
  }, [credentials])

  return [credentials, setCredentials]
}

export function usePersistedDemoId(): [string, Dispatch<SetStateAction<string>>] {
  const [demoId, setDemoId] = useState(retrieveDemoId())

  useStorageListener(DEMO_ID_LOCAL_STORAGE_KEY, setDemoId)

  useEffect(() => {
    persistDemoId(demoId)
  }, [demoId])

  return [demoId, setDemoId]
}
