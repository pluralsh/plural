import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  ClusterIcon,
  ListBoxItem,
  PersonPlusIcon,
  Select,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

import ClustersContext from '../../contexts/ClustersContext'
import { ProviderIcon } from '../utils/ProviderIcon'

import { ClusterSidecar } from './ClusterSidecar'

export function Cluster() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(c => c.id === id)
  const onSelectionChange = id => navigate(`/clusters/${id}`)

  if (!cluster) return <>error</>

  console.log(cluster)

  return (
    <Flex
      grow={1}
      gap="large"
      padding="large"
    >
      <Flex
        direction="column"
        grow={1}
      >
        <Flex gap="large">
          <Div flexGrow={1}>
            <Select
              label="Select cluster"
              selectedKey={cluster?.id}
              onSelectionChange={onSelectionChange}
              titleContent={(
                <Flex gap="xsmall">
                  <ClusterIcon />
                  Cluster
                </Flex>
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
          </Div>
          <Button
            secondary
            startIcon={<PersonPlusIcon />}
          >
            Administrators
          </Button>
        </Flex>
        <div>
          content
        </div>
      </Flex>
      <ClusterSidecar cluster={cluster} />
    </Flex>
  )
}
