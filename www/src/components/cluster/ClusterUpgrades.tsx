import { ReactElement, useState } from 'react'
import { Button, ReloadIcon } from '@pluralsh/design-system'
import { Flex } from 'honorable'

import ListCard from '../utils/ListCard'
import UpgradeList from '../overview/clusters/upgrades/UpgradeList'
import { Cluster } from '../../generated/graphql'
import { EmptyListMessage } from '../overview/clusters/misc'

type ClusterUpgradesProps = {cluster: Cluster}

export function ClusterUpgrades({ cluster }: ClusterUpgradesProps): ReactElement {
  const [refreshing, setRefreshing] = useState(false)
  const [refetch, setRefetch] = useState<any>()

  return (
    <ListCard header={(
      <>
        <Flex
          grow={1}
          align="center"
        >
          Upgrades
        </Flex>
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
      {cluster?.queue?.id ? (
        <UpgradeList
          cluster={cluster}
          setRefreshing={setRefreshing}
          setRefetch={setRefetch}
        />
      ) : <EmptyListMessage>Cannot access upgrade queue.</EmptyListMessage>}
    </ListCard>
  )
}
