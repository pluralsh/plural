import {
  ComponentProps,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react'

import { Repository } from '../generated/graphql'

const AppContext = createContext<Repository | Record<string, never>>({})

export const useAppContext = () => useContext(AppContext) ?? {}

type ContextProps = PropsWithChildren<{
  value: ComponentProps<typeof AppContext.Provider>['value'] | undefined | null
}>

export function AppContextProvider({ children, value }: ContextProps) {
  const finalValue = useMemo(() => value ?? {}, [value])

  return (
    <AppContext.Provider value={finalValue}>
      {children}
    </AppContext.Provider>
  )
}
