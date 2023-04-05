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
import { useContext, useEffect, useState } from 'react'

import { Cluster } from '../../../../generated/graphql'
import { ProviderIcon } from '../../../utils/ProviderIcon'
import { ImpersonateServiceAccount } from '../ImpersonateServiceAccount'
import { EmptyListMessage } from '../misc'
import ClustersContext from '../../../../contexts/ClustersContext'

import UpgradeList from './UpgradeList'

const Wrap = styled(Card)(({ theme }) => ({
  borderRadius: theme.borderRadiuses.large,
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',

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
    flexGrow: 1,
    minHeight: 180, // TODO: Adjust scaling.
  },
}))

export default function Upgrades() {
  const { clusters } = useContext(ClustersContext)
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
    <Wrap fillLevel={2}>
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
                  <UpgradeList
                    cluster={cluster}
                    setRefreshing={setRefreshing}
                    setRefetch={setRefetch}
                  />
                </ImpersonateServiceAccount>
              )
              : (
                <UpgradeList
                  cluster={cluster}
                  setRefreshing={setRefreshing}
                  setRefetch={setRefetch}
                />
              )
          )
          : <EmptyListMessage>Cannot access upgrade queue.</EmptyListMessage>}
      </div>
    </Wrap>
  )
}

