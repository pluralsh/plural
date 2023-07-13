import { useQuery } from '@apollo/client'
import { createContext, useMemo } from 'react'
import styled from 'styled-components'

import { CLUSTERS } from '../components/overview/queries'
import LoadingIndicator from '../components/utils/LoadingIndicator'
import {
  Cluster,
  RootQueryType,
  RootQueryTypeClustersArgs,
  Source,
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

export function ClustersContextProvider({ children }) {
  const { data, loading, error, refetch } = useQuery<
    Pick<RootQueryType, 'clusters'>,
    RootQueryTypeClustersArgs
  >(CLUSTERS, {
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
        ) ?? []

    return { clusters, refetchClusters: refetch }
  }, [data, refetch])

  if (error) return <Error>{error.message}</Error>
  if (!data && loading) return <LoadingIndicator />

  return (
    <ClustersContext.Provider value={clustersContextValue}>
      {children}
    </ClustersContext.Provider>
  )
}

export default ClustersContext
