import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import { Flex } from 'honorable'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

import { LABEL_REQUEST } from './constants'

function RoadmapApplicationRequests() {
  const { pluralArtifactsIssues } = useContext(RoadmapContext)

  const issues = useMemo(() => pluralArtifactsIssues.filter(issue => issue.labels.includes(LABEL_REQUEST)),
    [pluralArtifactsIssues])

  return (
    <Flex
      overflow="hidden"
      flexDirection="column"
      height="100%"
    >
      <PageTitle heading="Application requests" />
      <RoadmapSearchBox
        displayAuthor
        displayVotes
        removeStateSorting
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </Flex>
  )
}

export default RoadmapApplicationRequests
