import { createContext, useMemo } from 'react'
import styled from 'styled-components'

import LoadingIndicator from '../components/utils/LoadingIndicator'
import {
  ConsoleInstanceFragment,
  ConsoleInstanceStatus,
  useConsoleInstancesQuery,
} from '../generated/graphql'

import { ClustersContextProvider } from './ClustersContext'
import { mapExistingNodes } from 'utils/graphql'

type ConsoleInstancesContextType = {
  instances: ConsoleInstanceFragment[]
  refetchInstances: () => void
}

const ConsoleInstancesContext = createContext<ConsoleInstancesContextType>({
  instances: [],
  refetchInstances: () => {},
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

  const consoleInstancesContextValue = useMemo<ConsoleInstancesContextType>(
    () => ({
      instances: mapExistingNodes(data?.consoleInstances).filter(
        (i) => i.status !== ConsoleInstanceStatus.DeploymentDeleted
      ),
      refetchInstances: refetch,
    }),
    [data, refetch]
  )

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
