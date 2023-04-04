import { createContext } from 'react'

import { Cluster } from '../../generated/graphql'

export type ClustersContextType = {
  clusters: Cluster[],
  hasClusters: boolean,
}

export const ClustersContext = createContext<ClustersContextType>({
  clusters: [],
  hasClusters: false,
})

export default ClustersContext
