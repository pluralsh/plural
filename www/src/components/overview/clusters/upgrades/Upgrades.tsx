import { Button, ClusterIcon, ReloadIcon } from '@pluralsh/design-system'
import { isEmpty } from 'lodash'
import { useContext, useState } from 'react'
import { Div, Flex } from 'honorable'

import { Cluster } from '../../../../generated/graphql'
import { ImpersonateServiceAccountWithSkip } from '../ImpersonateServiceAccount'
import { EmptyListMessage } from '../misc'
import ClustersContext from '../../../../contexts/ClustersContext'
import ListCard from '../../../utils/ListCard'
import { ClusterPicker } from '../../ClusterPicker'

import UpgradeList from './UpgradeList'

export default function Upgrades() {
  const { clusters } = useContext(ClustersContext)
  const [cluster, setCluster] = useState<Cluster | undefined>(!isEmpty(clusters) ? clusters[0] : undefined)
  const [refreshing, setRefreshing] = useState(false)
  const [refetch, setRefetch] = useState<any>()

  if (isEmpty(clusters)) return null // TODO: Update.

  return (
    <ListCard header={(
      <>
        <Div width={500}>
          <ClusterPicker
            cluster={cluster}
            setCluster={setCluster}
            size="small"
            title={(
              <Flex
                gap="xsmall"
                whiteSpace="nowrap"
              >
                <ClusterIcon />
                Cluster upgrades
              </Flex>
            )}
          />
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

      <Flex height="100%">
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
      </Flex>
    </ListCard>

  )
}

