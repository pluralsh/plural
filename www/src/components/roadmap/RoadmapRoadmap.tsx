import { useContext, useMemo } from 'react'
import { PageTitle } from '@pluralsh/design-system'

import { Flex } from 'honorable/dist/components/Flex/Flex'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapSearchBox from './RoadmapSearchBox'

import { LABEL_ROADMAP } from './constants'

function RoadmapRoadmap() {
  const {
    pluralIssues, pluralArtifactsIssues, pluralConsoleIssues, pluralCliIssues,
  } = useContext(RoadmapContext)

  const issues = useMemo(() => [...pluralIssues, ...pluralArtifactsIssues, ...pluralConsoleIssues, ...pluralCliIssues].filter(issue => issue.labels.includes(LABEL_ROADMAP)), [pluralIssues, pluralArtifactsIssues, pluralConsoleIssues, pluralCliIssues])

  return (
    <Flex
      overflow="hidden"
      flexDirection="column"
      height="100%"
    >
      <PageTitle heading="Roadmap" />
      <RoadmapSearchBox
        displayProgress
        removeVoteSorting
        label="Contribute to our roadmap by adding your feedback or voting."
        issues={issues}
      />
    </Flex>
  )
}

export default RoadmapRoadmap
