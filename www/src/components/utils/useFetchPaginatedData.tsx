import { ComponentProps, useCallback, useMemo, useState } from 'react'
import { VirtualItem } from '@tanstack/react-virtual'
import { extendConnection, updateNestedConnection } from 'utils/graphql'
import {
  reduceNestedData,
  useSlicePolling,
} from 'components/utils/tableFetchHelpers'
import {
  ErrorPolicy,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
} from '@apollo/client'
import { Table } from '@pluralsh/design-system'

export const DEFAULT_REACT_VIRTUAL_OPTIONS: ComponentProps<
  typeof Table
>['reactVirtualOptions'] = { overscan: 10 }

export const DEFAULT_PAGE_SIZE = 100
export const POLL_INTERVAL = 10_000

type GenericQueryHook<TQueryType, TVariables extends OperationVariables> = (
  baseOptions: QueryHookOptions<TQueryType, TVariables>
) => QueryResult<TQueryType, TVariables> & {
  fetchMore: (options: any) => Promise<any>
}

type FetchDataOptions<TQueryType, TVariables extends OperationVariables> = {
  queryHook: GenericQueryHook<TQueryType, TVariables>
  pageSize?: number
  keyPath: string[]
  pollInterval?: number
  errorPolicy?: ErrorPolicy
}

export type FetchPaginatedDataResult<TQueryType> = {
  data: TQueryType | undefined
  loading: boolean
  error: any
  refetch: () => void
  pageInfo: any
  fetchNextPage: () => void
  setVirtualSlice: (slice: {
    start: VirtualItem | undefined
    end: VirtualItem | undefined
  }) => void
}

export function useFetchPaginatedData<
  TQueryType extends Partial<Record<string, any>>,
  TVariables extends OperationVariables,
>(
  options: FetchDataOptions<TQueryType, TVariables>,
  variables: TVariables = {} as TVariables
): FetchPaginatedDataResult<TQueryType> {
  const [virtualSlice, setVirtualSlice] = useState<
    | {
        start: VirtualItem | undefined
        end: VirtualItem | undefined
      }
    | undefined
  >()

  const queryKey = useMemo(
    () => options.keyPath[options.keyPath.length - 1],
    [options.keyPath]
  )

  const queryResult = options.queryHook({
    variables: {
      ...variables,
      first: options.pageSize ?? DEFAULT_PAGE_SIZE,
    },
    errorPolicy: options.errorPolicy,
    fetchPolicy: 'cache-and-network',
    // Important so loading will be updated on fetchMore to send to Table
    notifyOnNetworkStatusChange: true,
  })

  const {
    data: currentData,
    previousData,
    loading,
    error,
    fetchMore,
  } = queryResult

  const data = currentData || previousData
  const { pageInfo, reducedQueryResult } = useMemo(() => {
    const reducedData = reduceNestedData(options.keyPath, currentData)

    return {
      pageInfo: reducedData?.[queryKey]?.pageInfo,
      reducedQueryResult: { ...queryResult, data: reducedData as TQueryType },
    }
  }, [currentData, options.keyPath, queryKey, queryResult])

  const { refetch } = useSlicePolling(reducedQueryResult, {
    virtualSlice,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
    interval: options.pollInterval || POLL_INTERVAL,
    keyPath: options.keyPath,
  })

  const fetchNextPage = useCallback(() => {
    if (pageInfo?.endCursor) {
      fetchMore({
        variables: { after: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          const newConnection = extendConnection(
            reduceNestedData(options.keyPath, prev),
            reduceNestedData(options.keyPath, fetchMoreResult)[queryKey],
            queryKey
          )

          return updateNestedConnection(options.keyPath, prev, newConnection)
        },
      })
    }
  }, [pageInfo, fetchMore, options.keyPath, queryKey])

  return {
    data,
    loading,
    error,
    refetch,
    pageInfo,
    fetchNextPage,
    setVirtualSlice,
  }
}
