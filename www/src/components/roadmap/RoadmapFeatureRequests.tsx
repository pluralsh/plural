import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

import { LABEL_REQUEST } from './constants'

function RoadmapFeatureRequests() {
  const { pluralIssues } = useContext(RoadmapContext)

  const issues = useMemo(() => pluralIssues.filter(issue => issue.labels.includes(LABEL_REQUEST)), [pluralIssues])

  return (
    <>
      <PageTitle heading="Feature requests" />
      <RoadmapSearchBox
        displayAuthor
        displayVotes
        removeStateSorting
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </>
  )
}

export default RoadmapFeatureRequests
