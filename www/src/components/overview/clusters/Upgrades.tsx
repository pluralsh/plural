import { Button, ClusterIcon, ReloadIcon } from '@pluralsh/design-system'
import { isEmpty } from 'lodash'
import { useCallback, useContext, useState } from 'react'
import { Div, Flex } from 'honorable'

import { Cluster } from '../../../generated/graphql'
import ClustersContext from '../../../contexts/ClustersContext'
import ListCard from '../../utils/ListCard'
import { ClusterPicker } from '../../utils/ClusterPicker'
import ImpersonateServiceAccount from '../../utils/ImpersonateServiceAccount'
import CurrentUserContext from '../../../contexts/CurrentUserContext'

import { EmptyListMessage } from './misc'
import UpgradeList from './UpgradeList'

export default function Upgrades() {
  const me = useContext(CurrentUserContext)
  const { clusters } = useContext(ClustersContext)
  const isClusterAccessible = useCallback(
    (c) => c.owner?.id === me.id || !!c.owner?.serviceAccount,
    [me.id]
  )
  const accessibleClusters = clusters.filter(isClusterAccessible)
  const [cluster, setCluster] = useState<Cluster | undefined>(
    !isEmpty(accessibleClusters) ? accessibleClusters[0] : undefined
  )
  const [refreshing, setRefreshing] = useState(false)
  const [refetch, setRefetch] = useState<any>()

  if (isEmpty(clusters)) return null

  return (
    <ListCard
      minHeight="min(calc(100vh - 153px), 300px)"
      header={
        <>
          <Div width={500}>
            <ClusterPicker
              cluster={cluster}
              setCluster={setCluster}
              filter={isClusterAccessible}
              size="small"
              title={
                <Flex
                  gap="xsmall"
                  whiteSpace="nowrap"
                >
                  <ClusterIcon />
                  Cluster upgrades
                </Flex>
              }
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
      }
    >
      {cluster?.queue?.id ? (
        <ImpersonateServiceAccount
          id={cluster?.owner?.id}
          skip={!cluster?.owner?.serviceAccount}
        >
          <UpgradeList
            cluster={cluster}
            setRefreshing={setRefreshing}
            setRefetch={setRefetch}
          />
        </ImpersonateServiceAccount>
      ) : (
        <EmptyListMessage>Cannot access upgrade queue.</EmptyListMessage>
      )}
    </ListCard>
  )
}
