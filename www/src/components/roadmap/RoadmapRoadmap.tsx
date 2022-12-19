import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

function RoadmapRoadmap() {
  const {
    pluralIssues,
    pluralArtifactsIssues,
  } = useContext(RoadmapContext)

  const issues = useMemo(() => [...pluralIssues, ...pluralArtifactsIssues], [pluralIssues, pluralArtifactsIssues])

  return (
    <>
      <PageTitle heading="Roadpmap" />
      <RoadmapSearchBox
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </>
  )
}

export default RoadmapRoadmap
