import { ReactNode, createContext, useMemo } from 'react'
import styled from 'styled-components'

import LoadingIndicator from '../components/utils/LoadingIndicator'
import {
  Cluster,
  ConsoleInstanceFragment,
  Source,
  useClustersQuery,
} from '../generated/graphql'

type ClustersContextType = {
  clusters: Cluster[]
  refetchClusters?: () => Promise<any>
}

const ClustersContext = createContext<ClustersContextType>({
  clusters: [],
})

const Error = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
}))

export function ClustersContextProvider({
  consoleInstances = [],
  children,
}: {
  consoleInstances?: ConsoleInstanceFragment[]
  children: ReactNode
}) {
  const { data, loading, error, refetch } = useClustersQuery({
    pollInterval: 30_000,
  })

  const clustersContextValue = useMemo<ClustersContextType>(() => {
    const clusters =
      data?.clusters?.edges
        ?.map((edge) => edge?.node)
        .filter((node): node is Cluster => !!node)
        .filter(
          (c) =>
            c.source === Source.Default ||
            c.owner?.hasShell ||
            c.owner?.hasInstallations
        )
        .filter(
          (c) =>
            !consoleInstances.some((instance) => instance.console?.id === c.id)
        ) ?? []

    return { clusters, refetchClusters: refetch }
  }, [consoleInstances, data?.clusters?.edges, refetch])

  if (error) return <Error>{error.message}</Error>
  if (!data && loading) return <LoadingIndicator />

  return (
    <ClustersContext.Provider value={clustersContextValue}>
      {children}
    </ClustersContext.Provider>
  )
}

export default ClustersContext
