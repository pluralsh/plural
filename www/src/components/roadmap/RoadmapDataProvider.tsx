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
    pluralConsoleIssues,
  } = useRoadmapData()

  const roadmapContextValue = useMemo<RoadmapContextType>(() => ({
    pluralIssues,
    pluralArtifactsIssues,
    pluralConsoleIssues,
  }), [
    pluralIssues,
    pluralArtifactsIssues,
    pluralConsoleIssues,
  ])

  return (
    <RoadmapContext.Provider value={roadmapContextValue}>
      {children}
    </RoadmapContext.Provider>
  )
}

export default RoadmapDataProvider
