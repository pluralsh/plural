import { createContext, useMemo } from 'react'
import styled from 'styled-components'

import LoadingIndicator from '../components/utils/LoadingIndicator'
import {
  ConsoleInstanceFragment,
  useConsoleInstancesQuery,
} from '../generated/graphql'

import { ClustersContextProvider } from './ClustersContext'

type ConsoleInstancesContextType = {
  instances: ConsoleInstanceFragment[]
  refetchInstances?: () => Promise<any>
}

const ConsoleInstancesContext = createContext<ConsoleInstancesContextType>({
  instances: [],
})

const Error = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
}))

export function ConsoleInstancesContextProvider({ children }) {
  const { data, loading, error, refetch } = useConsoleInstancesQuery({
    pollInterval: 30_000,
  })

  const consoleInstancesContextValue =
    useMemo<ConsoleInstancesContextType>(() => {
      const instances =
        data?.consoleInstances?.edges
          ?.map((edge) => edge?.node)
          .filter((node): node is ConsoleInstanceFragment => !!node) ?? []

      return { instances, refetchInstances: refetch }
    }, [data, refetch])

  if (error) return <Error>{error.message}</Error>
  if (!data && loading) return <LoadingIndicator />

  return (
    <ConsoleInstancesContext.Provider value={consoleInstancesContextValue}>
      <ClustersContextProvider
        consoleInstances={consoleInstancesContextValue.instances}
      >
        {children}
      </ClustersContextProvider>
    </ConsoleInstancesContext.Provider>
  )
}

export default ConsoleInstancesContext
