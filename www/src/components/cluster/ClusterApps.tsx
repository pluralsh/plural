import { ReactElement, useMemo, useState } from 'react'
import { isEmpty } from 'lodash'
import Fuse from 'fuse.js'
import { Input, MagnifyingGlassIcon } from '@pluralsh/design-system'

import ListCard from '../utils/ListCard'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import LoadingIndicator from '../utils/LoadingIndicator'
import { EmptyListMessage } from '../overview/clusters/misc'
import InfiniteScroller from '../utils/InfiniteScroller'
import { Cluster } from '../../generated/graphql'
import { ensureURLValidity } from '../../utils/url'

import { ClusterApp } from './ClusterApp'
import { REPOSITORIES_Q } from './queries'

const searchOptions = {
  keys: ['name'],
  threshold: 0.25,
}

type ClusterAppsProps = { cluster: Cluster }

export function ClusterApps({
  cluster: { consoleUrl },
}: ClusterAppsProps): ReactElement {
  const [search, setSearch] = useState('')
  const [apps, loading, hasMore, loadMore] = usePaginatedQuery(
    REPOSITORIES_Q,
    { variables: { installed: true } },
    (data) => data.repositories
  )

  const fuse = useMemo(() => new Fuse(apps, searchOptions), [apps])
  const filteredApps = useMemo(
    () => (search ? fuse.search(search).map(({ item }) => item) : apps),
    [apps, search, fuse]
  )

  if (isEmpty(apps) && loading) return <LoadingIndicator />

  return (
    <ListCard
      header="Installed apps"
      input={
        <Input
          startIcon={<MagnifyingGlassIcon />}
          placeholder="Search for a repository"
          disabled={isEmpty(apps)}
          border="none"
          borderRadius={0}
          value={search}
          width="100%"
          onChange={({ target: { value } }) => setSearch(value)}
        />
      }
      flexGrow={0}
    >
      {!isEmpty(apps) ? (
        <InfiniteScroller
          loading={loading}
          hasMore={hasMore}
          loadMore={loadMore}
          // Allow for scrolling in a flexbox layout
          flexGrow={1}
          height={0}
        >
          {filteredApps.map((app, i) => (
            <ClusterApp
              key={app.id}
              app={app}
              consoleUrl={ensureURLValidity(consoleUrl)}
              last={i === apps.length - 1}
            />
          ))}
        </InfiniteScroller>
      ) : (
        <EmptyListMessage>
          Looks like you haven't installed your first app yet.
        </EmptyListMessage>
      )}
    </ListCard>
  )
}
