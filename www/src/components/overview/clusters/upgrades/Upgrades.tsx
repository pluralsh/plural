import {
  Button,
  ClusterIcon,
  ListBoxItem,
  ReloadIcon,
  Select,
} from '@pluralsh/design-system'
import { isEmpty, truncate } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { Div, Flex } from 'honorable'

import { Cluster } from '../../../../generated/graphql'
import { ProviderIcon } from '../../../utils/ProviderIcon'
import { ImpersonateServiceAccountWithSkip } from '../ImpersonateServiceAccount'
import { EmptyListMessage } from '../misc'
import ClustersContext from '../../../../contexts/ClustersContext'
import ListCard from '../../../utils/ListCard'

import UpgradeList from './UpgradeList'

export default function Upgrades() {
  const { clusters } = useContext(ClustersContext)
  const [cluster, setCluster] = useState<Cluster | undefined>(!isEmpty(clusters) ? clusters[0] : undefined)
  const [refreshing, setRefreshing] = useState(false)
  const [refetch, setRefetch] = useState<any>()

  const onSelectionChange = id => {
    setCluster(clusters.find(c => c.id === id))
  }

  useEffect(() => {
    setCluster(clusters.find(({ id }) => id === cluster?.id))
  }, [clusters]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isEmpty(clusters)) return null // TODO: Update.

  return (
    <ListCard header={(
      <>
        <Div width={450}>
          <Select
            size="small"
            label="Select cluster"
            selectedKey={cluster?.id}
            onSelectionChange={onSelectionChange}
            titleContent={(
              <Flex
                gap="xsmall"
                whiteSpace="nowrap"
              >
                <ClusterIcon />
                Cluster upgrades
              </Flex>
            )}
            leftContent={(
              <ProviderIcon
                provider={cluster?.provider}
                width={16}
              />
            )}
            width={450}
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
        </Div>
        <Flex grow={1} />
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
      </>
    )}
    >

      <div className="container">
        {cluster?.queue?.id
          ? (
            <ImpersonateServiceAccountWithSkip
              id={cluster?.owner?.id}
              skip={!cluster?.owner?.serviceAccount}
            >
              <UpgradeList
                cluster={cluster}
                setRefreshing={setRefreshing}
                setRefetch={setRefetch}
              />
            </ImpersonateServiceAccountWithSkip>
          )
          : <EmptyListMessage>Cannot access upgrade queue.</EmptyListMessage>}
      </div>

    </ListCard>

  )
}

