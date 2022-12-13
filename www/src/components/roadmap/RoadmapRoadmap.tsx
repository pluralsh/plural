import { useContext, useMemo } from 'react'

import RoadmapContext from '../../contexts/RoadmapContext'

function RoadmapRoadmap() {
  const {
    pluralIssues,
    pluralArtifactsIssues,
    hasMore,
    paginate,
  } = useContext(RoadmapContext)

  const issues = useMemo(() => (
    [
      ...pluralIssues,
      ...pluralArtifactsIssues,
    ]
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      // .map(issue => ({
      //   title: issue.title,
      //   url: issue.html_url,
      //   body: issue.body,
      //   state: issue.state,
      // }))
  ), [pluralIssues, pluralArtifactsIssues])

  return (
    <pre>
      {hasMore ? 'has more' : 'has no more'}
      {JSON.stringify(issues, null, 2)}
    </pre>
  )
}

export default RoadmapRoadmap
