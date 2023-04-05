import { ReactElement, useState } from 'react'
import { Button, ReloadIcon } from '@pluralsh/design-system'
import { Flex } from 'honorable'

import ListCard from '../utils/ListCard'
import UpgradeList from '../overview/clusters/upgrades/UpgradeList'
import { Cluster } from '../../generated/graphql'

type ClusterUpgradesProps = {cluster: Cluster}

export function ClusterUpgrades({ cluster }: ClusterUpgradesProps): ReactElement {
  const [refreshing, setRefreshing] = useState(true)
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
      <UpgradeList
        cluster={cluster}
        setRefreshing={setRefreshing}
        setRefetch={setRefetch}
      />
    </ListCard>
  )
}
