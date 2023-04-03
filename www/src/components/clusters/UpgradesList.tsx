import {
  Button,
  Card,
  ClusterIcon,
  ListBoxItem,
  ReloadIcon,
  Select,
} from '@pluralsh/design-system'
import styled from 'styled-components'
import { isEmpty, truncate } from 'lodash'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { ProviderIcon } from '../utils/ProviderIcon'
import { StandardScroller } from '../utils/SmoothScroller'
import { extendConnection } from '../../utils/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'

import { ImpersonateServiceAccount } from './ImpersonateServiceAccount'
import { UpgradeItem } from './ClustersContent'
import { QUEUE } from './queries'

const Wrap = styled(Card)(({ theme }) => ({
  borderRadius: theme.borderRadiuses.large,

  '.header': {
    backgroundColor: theme.colors['fill-two'],
    borderBottom: theme.borders['fill-two'],
    borderTopLeftRadius: theme.borderRadiuses.large,
    borderTopRightRadius: theme.borderRadiuses.large,
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between',

    '.select': {
      width: 450,
      boxShadow: theme.boxShadows.slight,

      '.select-title': {
        display: 'flex',
        gap: theme.spacing.xsmall,
        whiteSpace: 'nowrap',
      },
    },
  },

  '.container': {
    backgroundColor: theme.colors['fill-one'],
    borderBottomLeftRadius: theme.borderRadiuses.large,
    borderBottomRightRadius: theme.borderRadiuses.large,
    minHeight: 300, // TODO: Change to grow automatically.

    '.empty': {
      color: theme.colors['text-xlight'],
      padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
    },
  },
}))

type UpgradesListProps = {
  clusters: Cluster[]
}

export default function UpgradesList({ clusters }: UpgradesListProps) {
  const [cluster, setCluster] = useState<Cluster | undefined>(!isEmpty(clusters) ? clusters[0] : undefined)

  const onSelectionChange = id => {
    setCluster(clusters.find(c => c.id === id))
  }

  useEffect(() => {
    setCluster(clusters.find(({ id }) => id === cluster?.id))
  }, [clusters]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isEmpty(clusters)) return null // TODO: Update.

  return (
    <Wrap
      fillLevel={2}
      display="flex"
      flexDirection="column"
      flexGrow={1}
    >
      <div className="header">
        <div className="select">
          <Select
            size="small"
            label="Select cluster"
            selectedKey={cluster?.id}
            onSelectionChange={onSelectionChange}
            titleContent={(
              <div className="select-title">
                <ClusterIcon />
                Cluster upgrades
              </div>
            )}
            leftContent={(
              <ProviderIcon
                provider={cluster?.provider}
                width={16}
              />
            )}
            width={420}
          >
            {clusters.map(({ id, name, provider }) => (
              <ListBoxItem
                key={id}
                label={truncate(name, { length: 14 })}
                textValue={name}
                leftContent={(
                  <ProviderIcon
                    provider={provider}
                    width={16}
                  />
                )}
              />
            ))}
          </Select>
        </div>
        <Button
          floating
          small
          startIcon={<ReloadIcon />}
          onClick={() => null}
        >
          Refresh
        </Button>
      </div>
      <div className="container">
        {cluster?.queue?.id
          ? (
            cluster?.owner?.serviceAccount
              ? (
                <ImpersonateServiceAccount id={cluster?.owner?.id}>
                  <UpgradesListInternal cluster={cluster} />
                </ImpersonateServiceAccount>
              )
              : <UpgradesListInternal cluster={cluster} />
          )
          : <div className="empty">Looks like you don’t have any upgrades.</div>}
      </div>
    </Wrap>
  )
}

function UpgradesListInternal({ cluster }: {cluster: Cluster}) {
  const [listRef, setListRef] = useState<any>(null)

  const {
    data, loading, error, fetchMore, // subscribeToMore, refetch,
  } = useQuery(QUEUE, {
    variables: { id: cluster?.queue?.id },
    fetchPolicy: 'cache-and-network',
  })

  if (error) return <>Error loading {cluster?.name} queue: {error?.message}</>
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
        <UpgradeItem
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
