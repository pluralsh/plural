import { useQuery } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'
import {
  EmptyState,
  Flex,
  RobotIcon,
  SearchIcon,
} from '@pluralsh/design-system'
import { useCallback, useContext, useEffect, useState } from 'react'

import { Placeholder } from '../utils/Placeholder'
import ListInput from '../utils/ListInput'
import { List, ListItem } from '../utils/List'
import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import LoadingIndicator from '../utils/LoadingIndicator'

import SubscriptionContext from '../../contexts/SubscriptionContext'

import BillingTrialBanner from './billing/BillingTrialBanner'

import { USERS_Q } from './queries'
import { CreateServiceAccount } from './CreateServiceAccount'
import { ServiceAccount } from './User'
import BillingLegacyUserBanner from './billing/BillingLegacyUserBanner'
import { UpgradeGate } from './UpgradeGate'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

const SAMPLE_SERVICE_ACCOUNT_ROWS = [
  'prod-cluster',
  'prod-cluster-2',
  'beta-cluster',
  'dev-cluster',
].map((name) => ({ name, caption: 'demo@plural.sh' }))

function Header({ q, setQ }: any) {
  return (
    <ListInput
      width="100%"
      value={q}
      placeholder="Search a service account"
      startIcon={<SearchIcon color="text-light" />}
      onChange={({ target: { value } }) => setQ(value)}
      flexGrow={0}
    />
  )
}

function ServiceAccountsInner({ q, data, loading, fetchMore }: any) {
  const [listRef, setListRef] = useState<any>(null)
  const update = useCallback(
    (cache, { data: { deleteUser } }) =>
      updateCache(cache, {
        query: USERS_Q,
        variables: { q, serviceAccount: true },
        update: (prev) => removeConnection(prev, deleteUser, 'users'),
      }),
    [q]
  )

  const [dataCache, setDataCache] = useState(data)

  useEffect(() => {
    if (data) {
      setDataCache(data)
    }
  }, [data])

  if (!data && !dataCache) return <LoadingIndicator />

  const { edges, pageInfo } = data?.users || dataCache?.users || {}

  return (
    <div css={{ flexGrow: 1, width: '100%' }}>
      {edges?.length > 0 ? (
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          mapper={({ node: user }, { prev, next }) => (
            <ListItem
              key={user.id}
              first={!prev.node}
              last={!next.node}
            >
              <ServiceAccount
                user={user}
                update={update}
              />
            </ListItem>
          )}
          loadNextPage={() =>
            pageInfo.hasNextPage &&
            fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { users } }) =>
                extendConnection(prev, users, 'users'),
            })
          }
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
    </div>
  )
}

export function ServiceAccounts() {
  const [q, setQ] = useState('')
  const { data, loading, fetchMore } = useQuery(USERS_Q, {
    variables: { q, serviceAccount: true },
    fetchPolicy: 'cache-and-network',
  })
  const { availableFeatures } = useContext(SubscriptionContext)
  const isAvailable =
    !!availableFeatures?.userManagement || !isEmpty(data?.users?.edges)

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <SubpageHeader title="Service accounts">
        <CreateServiceAccount q={q} />
      </SubpageHeader>
      <BillingLegacyUserBanner feature="service accounts" />
      <BillingTrialBanner />
      {isAvailable ? (
        <List>
          <Header
            q={q}
            setQ={setQ}
          />
          <ServiceAccountsInner
            q={q}
            data={data}
            loading={loading}
            fetchMore={fetchMore}
          />
        </List>
      ) : (
        <UpgradeGate
          feature="service accounts"
          description="Create assumable identities that enable multiple people to manage Plural installations."
          searchPlaceholder="Search a service account"
          rowIcon={<RobotIcon />}
          rowAction="Impersonate"
          rows={SAMPLE_SERVICE_ACCOUNT_ROWS}
        />
      )}
    </Flex>
  )
}
