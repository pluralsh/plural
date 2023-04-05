import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  ClusterIcon,
  ListBoxItem,
  PersonPlusIcon,
  Select,
} from '@pluralsh/design-system'

import styled from 'styled-components'

import ClustersContext from '../../contexts/ClustersContext'
import { ProviderIcon } from '../utils/ProviderIcon'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: theme.spacing.large,

  '.header': {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing.large,

    '.cluster-select': {
      flexGrow: 1,
    },
  },
}))

export function Cluster() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(c => c.id === id)
  const onSelectionChange = id => navigate(`/clusters/${id}`)

  if (!cluster) return <>error</>

  console.log(cluster)

  return (
    <Wrap>
      <div className="header">
        <div className="cluster-select">
          <Select
            label="Select cluster"
            selectedKey={cluster?.id}
            onSelectionChange={onSelectionChange}
            titleContent={(
              <>
                <ClusterIcon marginRight="xsmall" />
                Cluster
              </>
            )}
            leftContent={(
              <ProviderIcon
                provider={cluster?.provider}
                width={16}
              />
            )}
          >
            {clusters.map(({ id, name, provider }) => (
              <ListBoxItem
                key={id}
                label={name}
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
          secondary
          startIcon={<PersonPlusIcon />}
        >
          Administrators
        </Button>
      </div>
      <div>content</div>
    </Wrap>
  )
}
