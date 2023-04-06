import { ReactElement, useMemo } from 'react'
import { isEmpty } from 'lodash'
import { Flex } from 'honorable'

import ListCard from '../utils/ListCard'
import { MARKETPLACE_QUERY } from '../marketplace/queries'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import LoadingIndicator from '../utils/LoadingIndicator'
import { EmptyListMessage } from '../overview/clusters/misc'
import InfiniteScroller from '../utils/InfiniteScroller'
import { Cluster } from '../../generated/graphql'
import { ensureURLValidity } from '../../utils/url'

import { ClusterApp } from './ClusterApp'

type ClusterAppsProps = {cluster: Cluster}

export function ClusterApps({ cluster: { consoleUrl } }: ClusterAppsProps): ReactElement {
  const [
    repos,
    loading,
    hasMore,
    loadMore,
  ] = usePaginatedQuery(MARKETPLACE_QUERY, { }, data => data.repositories)

  const apps = useMemo(() => repos.filter(({ installation }) => !isEmpty(installation)), [repos])

  if (isEmpty(repos) && loading) return <LoadingIndicator />

  console.log(apps)

  return (
    <ListCard header="Installed apps">
      {!isEmpty(apps)
        ? (
          <Flex
            flexGrow={1}
            direction="column"
            height="100%"
          >
            <InfiniteScroller
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
              // Allow for scrolling in a flexbox layout
              flexGrow={1}
              height={0}
            >
              {apps.map((app, i) => (
                <ClusterApp
                  app={app}
                  consoleUrl={ensureURLValidity(consoleUrl)}
                  last={i === apps.length - 1}
                />
              ))}
            </InfiniteScroller>
          </Flex>
        )
        : <EmptyListMessage>Looks like you haven't installed your first app yet.</EmptyListMessage>}
    </ListCard>
  )
}
