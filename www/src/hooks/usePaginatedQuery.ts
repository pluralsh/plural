import { useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import * as Apollo from '@apollo/client'

import { type Edges, type PaginatedResult, mapExistingNodes } from '../utils/graphql'

function mapNode<N>(edges?: Edges<N> | null) {
  return (edges || []).map(edge => edge?.node)
}

function usePaginatedQuery(query, options: any = {}, getResults = x => x) {
  const [previousEdges, setPreviousEdges] = useState<any[]>([])
  const [cursor, setCursor] = useState<any>(null)

  const results = useQuery(query, {
    ...options,
    variables: {
      ...(options.variables || {}),
      cursor,
    },
  })

  const workingResults = useMemo(() => (results.data ? getResults(results.data) : {}), [results.data, getResults])

  const handleFetchMore = useCallback(() => {
    setPreviousEdges(x => [...x, ...mapNode(workingResults.edges)])
    setCursor(workingResults?.pageInfo?.endCursor)
  }, [workingResults])

  return [
    [...previousEdges, ...mapNode(workingResults.edges)],
    results.loading,
    workingResults?.pageInfo?.hasNextPage || false,
    handleFetchMore,
    results.subscribeToMore,
  ]
}

export default usePaginatedQuery

/* A version of usePaginatedQuery() for use with hooks created by graphql-codegen */
type OperationVars = Apollo.OperationVariables
type ApolloQueryHook<Q, V extends OperationVars> = (
  baseOptions?: Apollo.QueryHookOptions<Q, V>
) => ReturnType<typeof Apollo.useQuery<Q, V>>

export function usePaginatedQueryHook<Q, V extends OperationVars, N>(hook: ApolloQueryHook<Q, V>,
  options: Apollo.QueryHookOptions<Q, V>,
  getResults: (r: Q) => PaginatedResult<N> | null | undefined) {
  const [previousEdgeNodes, setPreviousEdgeNodes] = useState<(N)[]>(
    [])
  const [cursor, setCursor] = useState<string | null | undefined>(null)

  const results = hook({
    ...options,
    variables: {
      ...(options?.variables || {}),
      cursor,
    } as any,
  })

  const workingResults = useMemo(() => (results?.data ? getResults(results.data) : undefined),
    [getResults, results.data])

  const handleFetchMore = useCallback(() => {
    setPreviousEdgeNodes(x => [...x, ...(mapExistingNodes(workingResults) || [])])
    setCursor(workingResults?.pageInfo?.endCursor ?? null)
  }, [workingResults])

  const ret: [
    (N)[],
    boolean,
    boolean,
    () => void,
    <
      TSubscriptionData = Q,
      TSubscriptionVariables extends Apollo.OperationVariables = V
    >(
      options: Apollo.SubscribeToMoreOptions<
        Q,
        TSubscriptionVariables,
        TSubscriptionData
      >
    ) => () => void
  ] = [
    [...previousEdgeNodes, ...(mapExistingNodes(workingResults) || [])],
    results.loading,
    workingResults?.pageInfo?.hasNextPage || false,
    handleFetchMore,
    results.subscribeToMore,
  ]

  return ret
}
