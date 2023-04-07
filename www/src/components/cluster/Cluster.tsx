import { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  ClusterIcon,
  EmptyState,
  ListBoxItem,
  PersonPlusIcon,
  Select,
  WarningOutlineIcon,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

import ClustersContext from '../../contexts/ClustersContext'
import { ProviderIcon } from '../utils/ProviderIcon'
import { ImpersonateServiceAccountWithSkip } from '../overview/clusters/ImpersonateServiceAccount'

import { ClusterSidecar } from './ClusterSidecar'
import { ClusterApps } from './ClusterApps'
import { ClusterUpgrades } from './ClusterUpgrades'
import { ClusterAdminsModal } from './ClusterAdminsModal'

export function Cluster() {
  const [adminsOpen, setAdminsOpen] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(c => c.id === id)
  const onSelectionChange = id => navigate(`/clusters/${id}`)

  if (!cluster) {
    return (
      <EmptyState
        icon={<WarningOutlineIcon size={100} />}
        message="Cluster not found"
        description={`No clusters found with ID ${id}.`}
      >
        <Button onClick={() => navigate('/overview/clusters')}>Go to cluster overview</Button>
      </EmptyState>
    )
  }

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
        <Flex
          gap="large"
          marginBottom="medium"
        >
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
          {cluster.owner?.serviceAccount && (
            <>
              <Button
                secondary
                startIcon={<PersonPlusIcon />}
                onClick={() => setAdminsOpen(true)}
              >
                Administrators
              </Button>
              <ClusterAdminsModal
                open={adminsOpen}
                setOpen={setAdminsOpen}
                serviceAccount={cluster.owner}
              />
            </>
          )}
        </Flex>
        <Flex
          direction="column"
          gap="medium"
          grow={1}
        >
          <ImpersonateServiceAccountWithSkip
            id={cluster?.owner?.id}
            skip={!cluster.owner?.serviceAccount}
          >
            <ClusterUpgrades cluster={cluster} />
            <ClusterApps cluster={cluster} />
          </ImpersonateServiceAccountWithSkip>
        </Flex>
      </Flex>
      <ClusterSidecar cluster={cluster} />
    </Flex>
  )
}