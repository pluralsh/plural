import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import { appendConnection, extendConnection } from '../../utils/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'

import { ClusterUpgradesListItem } from './ClusterUpgradesListItem'
import { QUEUE, UPGRADE_SUB } from './queries'
import { Error } from './misc'

export default function ClusterUpgradesListContent({ cluster }: {cluster: Cluster}) {
  const [listRef, setListRef] = useState<any>(null)

  const {
    data, loading, error, fetchMore, subscribeToMore, // refetch,
  } = useQuery(QUEUE, {
    variables: { id: cluster?.queue?.id },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: { id: cluster?.queue?.id },
    updateQuery: ({ upgradeQueue, ...rest }, { subscriptionData: { data: { upgrade } } }) => ({
      ...rest,
      upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades'),
    }),
  }), [cluster?.queue?.id, subscribeToMore])

  if (error) return <Error>Error loading {cluster?.name} queue: {error.message}</Error>
  if (!data && loading) return <LoadingIndicator />

  const edges = data.upgradeQueue?.upgrades?.edges
  const pageInfo = data.upgradeQueue?.upgrades?.pageInfo

  return (
    <StandardScroller
      listRef={listRef}
      setListRef={setListRef}
      hasNextPage={pageInfo.hasNextPage}
      items={edges}
      loading={loading}
      mapper={({ node }, { next }) => (
        <ClusterUpgradesListItem
          key={node.id}
          upgrade={node}
          acked={cluster?.queue?.acked || ''}
          last={!next.node}
        />
      )}
      loadNextPage={() => pageInfo.hasNextPage && fetchMore({
        variables: { cursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { upgradeQueue: { upgrades } } }) => ({
          ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades'),
        }),
      })}
      placeholder={undefined}
      handleScroll={undefined}
      refreshKey={undefined}
      setLoader={undefined}
    />
  )
}

