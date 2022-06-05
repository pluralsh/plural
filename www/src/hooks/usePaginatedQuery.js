import { useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'

function mapNode(edges) {
  return (edges || []).map(({ node }) => node)
}

function usePaginatedQuery(query, options = {}, getResults = x => x) {
  const [previousEdges, setPreviousEdges] = useState([])
  const [cursor, setCursor] = useState(null)

  const results = useQuery(query, {
    ...options,
    variables: {
      ...(options.variables || {}),
      cursor,
    },
  })

  const workingResults = useMemo(() => results.data ? getResults(results.data) : {}, [results.data, getResults])

  const handleFetchMore = useCallback(() => {
    setPreviousEdges(x => [...x, ...mapNode(workingResults.edges)])
    setCursor(workingResults?.pageInfo?.endCursor)
  }, [workingResults])

  return [
    [...previousEdges, ...mapNode(workingResults.edges)],
    results.loading,
    workingResults?.pageInfo?.hasNextPage || false,
    handleFetchMore,
  ]
}

export default usePaginatedQuery
