import { createContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'

import { Cluster, RootQueryType, RootQueryTypeClustersArgs } from '../generated/graphql'
import LoadingIndicator from '../components/utils/LoadingIndicator'
import { CLUSTERS } from '../components/overview/queries'

type ClustersContextType = {
  clusters: Cluster[],
  hasClusters: boolean,
}

const ClustersContext = createContext<ClustersContextType>({
  clusters: [],
  hasClusters: false,
})

export function ClustersContextProvider({ children }) {
  const { data, loading, error }
  = useQuery<Pick<RootQueryType, 'clusters'>, RootQueryTypeClustersArgs>(CLUSTERS, { pollInterval: 30_000 })

  const clustersContextValue = useMemo<ClustersContextType>(() => {
    const clusters = data?.clusters?.edges?.map(edge => edge?.node)
      .filter((node): node is Cluster => !!node) || []
    const hasClusters = !isEmpty(clusters)

    return {
      clusters,
      hasClusters,
    }
  }, [data])

  if (error) return <p>{error.message}</p>
  if (!data && loading) return <LoadingIndicator />

  return (
    <ClustersContext.Provider value={clustersContextValue}>
      {children}
    </ClustersContext.Provider>
  )
}

export default ClustersContext
