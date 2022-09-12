import { useQuery } from '@apollo/client'
import { List, ListItem } from 'components/utils/List'
import ListInput from 'components/utils/ListInput'
import { Placeholder } from 'components/utils/Placeholder'
import { Div, Flex } from 'honorable'
import isEmpty from 'lodash/isEmpty'
import { EmptyState, PageTitle, SearchIcon } from 'pluralsh-design-system'
import { useCallback, useEffect, useState } from 'react'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { USERS_Q } from './queries'

import { CreateServiceAccount } from './CreateServiceAccount'

import { ServiceAccount } from './User'

function Header({ q, setQ }) {
  return (
    <ListInput
      width="100%"
      value={q}
      placeholder="Search a user"
      startIcon={<SearchIcon color="text-light" />}
      onChange={({ target: { value } }) => setQ(value)}
      flexGrow={0}
    />
  )
}

function ServiceAccountsInner({ q }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(USERS_Q, {
    variables: { q, serviceAccount: true },
    fetchPolicy: 'cache-and-network',
  })
  const update = useCallback((cache, { data: { deleteUser } }) => updateCache(cache, {
    query: USERS_Q,
    variables: { q, serviceAccount: true },
    update: prev => removeConnection(prev, deleteUser, 'users'),
  }),
  [q])

  const [dataCache, setDataCache] = useState(data)

  useEffect(() => {
    if (data) {
      setDataCache(data)
    }
  }, [data])

  if (!data && !dataCache) return <LoopingLogo />

  const { edges, pageInfo } = data?.users || dataCache?.users || {}

  return (
    <Div
      flexGrow={1}
      width="100%"
    >
      {edges?.length ? (
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          mapper={({ node: user }, { prev, next }) => (
            <ListItem
              first={!prev.node}
              last={!next.node}
            >
              <ServiceAccount
                user={user}
                update={update}
              />
            </ListItem>
          )}
          loadNextPage={() => pageInfo.hasNextPage
            && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { users } }) => extendConnection(prev, users, 'users'),
            })}
          hasNextPage={pageInfo.hasNextPage}
          loading={loading}
          placeholder={Placeholder}
        />
      ) : (
        <EmptyState
          message={
            isEmpty(q)
              ? "Looks like you don't have any service accounts yet."
              : "Looks like you don't have any service accounts matching search criteria."
          }
        >
          <CreateServiceAccount q={q} />
        </EmptyState>
      )}
    </Div>
  )
}

export function ServiceAccounts() {
  const [q, setQ] = useState('')

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Service accounts">
        <CreateServiceAccount q={q} />
      </PageTitle>
      <List>
        <Header
          q={q}
          setQ={setQ}
        />
        <ServiceAccountsInner q={q} />
      </List>
    </Flex>
  )
}
