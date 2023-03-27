import { createContext } from 'react'

export type RoadmapContextType = {
  pluralIssues: any[]
  pluralArtifactsIssues: any[]
  pluralConsoleIssues: any[]
  pluralCliIssues: any[]
}

export default createContext<RoadmapContextType>({
  pluralIssues: [],
  pluralArtifactsIssues: [],
  pluralConsoleIssues: [],
  pluralCliIssues: [],
})
