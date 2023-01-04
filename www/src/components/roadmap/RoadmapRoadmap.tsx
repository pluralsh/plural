import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

import { LABEL_ROADMAP } from './constants'

function RoadmapRoadmap() {
  const { pluralIssues, pluralArtifactsIssues } = useContext(RoadmapContext)

  const issues = useMemo(() => [...pluralIssues, ...pluralArtifactsIssues].filter(issue => issue.labels.includes(LABEL_ROADMAP)), [pluralIssues, pluralArtifactsIssues])

  return (
    <>
      <PageTitle heading="Roadmap" />
      <RoadmapSearchBox
        displayProgress
        removeVoteSorting
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </>
  )
}

export default RoadmapRoadmap
