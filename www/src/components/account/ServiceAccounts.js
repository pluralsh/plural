import { useQuery } from '@apollo/client'
import { EmptyState } from 'components/utils/EmptyState'
import { Box } from 'grommet'
import { Flex, Input } from 'honorable'
import { isEmpty } from 'lodash'
import { PageTitle, SearchIcon } from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { USERS_Q } from '../accounts/queries'
import { ListItem } from '../profile/ListItem'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { CreateServiceAccount } from './CreateServiceAccount'

import { ServiceAccount } from './User'

function Header({ q, setQ }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
    >
      <Input
        width="100%"
        value={q}
        placeholder="Search a service account"
        startIcon={<SearchIcon size={15} />}
        onChange={({ target: { value } }) => setQ(value)}
      />
    </Box>
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

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.users

  return (
    <Box
      fill
      pad={{ bottom: 'small' }}
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
    </Box>
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
      <Box
        fill
        gap="medium"
      >
        <Header
          q={q}
          setQ={setQ}
        />
        <ServiceAccountsInner q={q} />
      </Box>
    </Flex>
  )
}
