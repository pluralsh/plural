import { createContext } from 'react'

export type RoadmapContextType = {
  pluralIssues: any[]
  pluralArtifactsIssues: any[]
}

export default createContext<RoadmapContextType>({
  pluralIssues: [],
  pluralArtifactsIssues: [],
})
