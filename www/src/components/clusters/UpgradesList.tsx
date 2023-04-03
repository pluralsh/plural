import {
  Button,
  Card,
  ClusterIcon,
  ListBoxItem,
  ReloadIcon,
  Select,
} from '@pluralsh/design-system'
import styled from 'styled-components'
import { truncate } from 'lodash'
import { useEffect, useState } from 'react'

import { Cluster } from '../../generated/graphql'
import { ProviderIcon } from '../utils/ProviderIcon'

const Wrap = styled(Card)(({ theme }) => ({
  borderRadius: theme.borderRadiuses.large,

  '.header': {
    backgroundColor: theme.colors['fill-two'],
    borderBottom: theme.borders['fill-two'],
    borderTopLeftRadius: theme.borderRadiuses.large,
    borderTopRightRadius: theme.borderRadiuses.large,
    padding: 10,
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'space-between',

    '.select': {
      width: 420,
    },
  },

  '.container': {
    backgroundColor: theme.colors['fill-one'],
    borderBottomLeftRadius: theme.borderRadiuses.large,
    borderBottomRightRadius: theme.borderRadiuses.large,
  },
}))

type UpgradesListProps = {
  clusters: Cluster[]
}

export default function UpgradesList({ clusters }: UpgradesListProps) {
  const [selectedKey, setSelectedKey] = useState<Cluster | undefined>(clusters.length > 0 ? clusters[0] : undefined)

  const onSelectionChange = id => {
    const cluster = clusters.find(q => q.id === id)

    setSelectedKey(cluster)
  }

  useEffect(() => {
    const cluster = clusters.find(({ id }) => id === selectedKey?.id)

    setSelectedKey(cluster)
  }, [clusters, selectedKey, setSelectedKey])

  return (
    <Wrap fillLevel={2}>
      <div className="header">
        <div className="select">
          <Select
            size="small"
            label="Select cluster"
            selectedKey={selectedKey?.id}
            onSelectionChange={onSelectionChange}
            titleContent={<><ClusterIcon marginRight="xsmall" />Cluster</>}
            leftContent={(
              <ProviderIcon
                provider={selectedKey?.provider}
                width={16}
              />
            )}
            width={420}
          >
            {clusters.map(cluster => (
              <ListBoxItem
                key={cluster.id}
                label={truncate(cluster.name, { length: 14 })}
                textValue={cluster.name}
                leftContent={(
                  <ProviderIcon
                    provider={cluster.provider}
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
        >
          Refresh
        </Button>
      </div>
      <div className="container">content</div>
    </Wrap>
  )
}
