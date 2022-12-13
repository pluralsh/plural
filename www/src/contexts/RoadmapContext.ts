import { createContext } from 'react'

export type RoadmapContextType = {
  pluralIssues: any[]
  pluralArtifactsIssues: any[]
  hasMore: boolean
  paginate: () => void
}

export default createContext<RoadmapContextType>({
  pluralIssues: [],
  pluralArtifactsIssues: [],
  hasMore: false,
  paginate: () => {},
})
