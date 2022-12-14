import { useContext, useMemo } from 'react'

import RoadmapContext from '../../contexts/RoadmapContext'

import RoadmapIssue from './RoadmapIssue'

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
      .map(issue => ({
        title: issue.title ?? '',
        url: issue.html_url ?? '',
        body: issue.body ?? '',
        state: issue.state ?? '',
        createdAt: issue.created_at ?? '',
      }))
  ), [pluralIssues, pluralArtifactsIssues])

  return (
    <>
      {issues.map(issue => (
        <RoadmapIssue issue={issue} />
      ))}
      <pre>
        {hasMore ? 'has more' : 'has no more'}
        {JSON.stringify(issues, null, 2)}
      </pre>
    </>
  )
}

export default RoadmapRoadmap
