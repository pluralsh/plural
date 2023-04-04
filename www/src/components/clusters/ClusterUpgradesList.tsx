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

import { Cluster } from '../../generated/graphql'
import { ProviderIcon } from '../utils/ProviderIcon'

import { ImpersonateServiceAccount } from './ImpersonateServiceAccount'
import ClusterUpgradesListContent from './ClusterUpgradesListContent'

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
    minHeight: 250, // TODO: Change to grow automatically.

    '.empty': {
      color: theme.colors['text-xlight'],
      padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
    },
  },
}))

type UpgradesListProps = {
  clusters: Cluster[]
}

export default function ClusterUpgradesList({ clusters }: UpgradesListProps) {
  const [cluster, setCluster] = useState<Cluster | undefined>(!isEmpty(clusters) ? clusters[0] : undefined)
  const [refreshing, setRefreshing] = useState(true)
  const [refetch, setRefetch] = useState<any>()

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
          loading={refreshing}
          disabled={!cluster?.queue?.id}
          onClick={() => {
            if (refetch) refetch()
          }}
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
                  <ClusterUpgradesListContent
                    cluster={cluster}
                    setRefreshing={setRefreshing}
                    setRefetch={setRefetch}
                  />
                </ImpersonateServiceAccount>
              )
              : (
                <ClusterUpgradesListContent
                  cluster={cluster}
                  setRefreshing={setRefreshing}
                  setRefetch={setRefetch}
                />
              )
          )
          : <div className="empty">Cannot access upgrade queue.</div>}
      </div>
    </Wrap>
  )
}

