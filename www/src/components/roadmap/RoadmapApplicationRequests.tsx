import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

import { LABEL_REQUEST } from './constants'

function RoadmapApplicationRequests() {
  const { pluralArtifactsIssues } = useContext(RoadmapContext)

  const issues = useMemo(() => pluralArtifactsIssues.filter(issue => issue.labels.includes(LABEL_REQUEST)), [pluralArtifactsIssues])

  return (
    <>
      <PageTitle heading="Application requests" />
      <RoadmapSearchBox
        displayAuthor
        displayVotes
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </>
  )
}

export default RoadmapApplicationRequests
