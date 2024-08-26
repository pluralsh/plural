import {
  DispatchWithoutAction,
  ReactElement,
  createContext,
  useContext,
  useMemo,
} from 'react'

import { RepositoryQuery } from '../generated/graphql'

export const AppContext = createContext<ContextProps>({} as ContextProps)
export const useAppContext = () => useContext(AppContext)?.repository ?? {}
export type Repository = Partial<
  Exclude<RepositoryQuery['repository'], null | undefined>
>
interface ContextProps {
  repository: Repository
  refetch: DispatchWithoutAction
  children: ReactElement
}

export function AppContextProvider({
  children,
  repository,
  refetch,
}: ContextProps) {
  const finalValue = useMemo(
    () => ({ repository, refetch }) as ContextProps,
    [refetch, repository]
  )

  return (
    <AppContext.Provider value={finalValue}>{children}</AppContext.Provider>
  )
}
