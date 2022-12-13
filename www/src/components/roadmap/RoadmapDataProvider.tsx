import { ReactNode, useMemo } from 'react'

import RoadmapContext, { RoadmapContextType } from '../../contexts/RoadmapContext'

import useRoadmapData from './useRoadmapData'

type RoadmapDataProviderPropsType = {
  children: ReactNode
}

function RoadmapDataProvider({ children }: RoadmapDataProviderPropsType) {
  const {
    pluralIssues,
    pluralArtifactsIssues,
    hasMore,
    paginate,
  } = useRoadmapData()

  const roadmapContextValue = useMemo<RoadmapContextType>(() => ({
    pluralIssues,
    pluralArtifactsIssues,
    hasMore,
    paginate,
  }), [
    pluralIssues,
    pluralArtifactsIssues,
    hasMore,
    paginate,
  ])

  return (
    <RoadmapContext.Provider value={roadmapContextValue}>
      {children}
    </RoadmapContext.Provider>
  )
}

export default RoadmapDataProvider
