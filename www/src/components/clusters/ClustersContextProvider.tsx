import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import isEmpty from 'lodash/isEmpty'

import { Cluster, RootQueryType, RootQueryTypeClustersArgs } from '../../generated/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'

import { CLUSTERS } from './queries'
import ClustersContext, { ClustersContextType } from './ClustersContext'

export function ClustersContextProvider({ children }) {
  const { data, loading, error }
  = useQuery<Pick<RootQueryType, 'clusters'>, RootQueryTypeClustersArgs>(CLUSTERS, { pollInterval: 30_000 })

  const clustersContextValue = useMemo<ClustersContextType>(() => {
    const clusters = data?.clusters?.edges?.map(edge => edge?.node).filter((node): node is Cluster => !!node) || []
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
