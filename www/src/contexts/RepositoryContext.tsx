import {
  ComponentProps,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react'

import { RepositoryQuery } from '../generated/graphql'

const RepositoryContext = createContext<
  | Exclude<RepositoryQuery['repository'], undefined | null>
  | Record<string, never>
>({})

export const useRepositoryContext = () => useContext(RepositoryContext) ?? {}

type ContextProps = PropsWithChildren<{
  value:
    | ComponentProps<typeof RepositoryContext.Provider>['value']
    | undefined
    | null
}>

export function RepositoryContextProvider({ children, value }: ContextProps) {
  const finalValue = useMemo(() => value ?? {}, [value])

  return (
    <RepositoryContext.Provider value={finalValue}>
      {children}
    </RepositoryContext.Provider>
  )
}
