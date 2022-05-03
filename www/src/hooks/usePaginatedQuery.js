import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'

function mapNode(edges) {
  return (edges || []).map(({ node }) => node)
}

function usePaginatedQuery(query, options = {}, getResults = x => x) {
  const [previousEdges, setPreviousEdges] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const results = useQuery(query, {
    ...options,
    variables: {
      ...options.variables,
      cursor,
    },
  })

  const workingResults = useMemo(() => results.data ? getResults(results.data) : {}, [results.data, getResults])

  useEffect(() => {
    setHasMore(workingResults?.pageInfo?.hasNextPage)
  }, [workingResults])

  const handleFetchMore = useCallback(() => {
    setPreviousEdges(x => [...x, ...mapNode(workingResults.edges)])
    setCursor(workingResults?.pageInfo?.endCursor)
  }, [workingResults])

  return [[...previousEdges, ...mapNode(workingResults.edges)], hasMore, handleFetchMore]
}

export default usePaginatedQuery
