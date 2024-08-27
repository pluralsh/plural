import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  ClusterIcon,
  EmptyState,
  PersonPlusIcon,
  RocketIcon,
  WarningOutlineIcon,
  useSetBreadcrumbs,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

import { CLUSTERS_ROOT_CRUMB } from 'components/overview/clusters/Clusters'

import ClustersContext from '../../contexts/ClustersContext'
import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'
import { ensureURLValidity } from '../../utils/url'
import { ClusterPicker } from '../utils/ClusterPicker'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import CurrentUserContext from '../../contexts/CurrentUserContext'

import { ClusterDependencyModal } from './ClusterDependencyModal'
import { ClusterSidecar } from './ClusterSidecar'
import { ClusterApps } from './ClusterApps'
import { ClusterUpgrades } from './ClusterUpgrades'
import { ClusterAdminsModal } from './ClusterAdminsModal'
import ClusterMetadataPanel from './ClusterMetadataPanel'
import { CollapsibleButton } from './misc'
import { ClusterPromoteModal } from './ClusterPromoteModal'

export function Cluster() {
  const [dependencyOpen, setDependencyOpen] = useState(false)
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [adminsOpen, setAdminsOpen] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const navigate = useNavigate()
  const { clusterId } = useParams()
  const me = useContext(CurrentUserContext)
  const { clusters } = useContext(ClustersContext)
  const [cluster, setCluster] = useState(
    clusters.find(({ id }) => id === clusterId)
  )
  const breadcrumbs = useMemo(
    () => [
      CLUSTERS_ROOT_CRUMB,
      { label: `${cluster?.name}`, url: `/clusters/${clusterId}` },
    ],
    [cluster?.name, clusterId]
  )

  useEffect(
    () => setCluster(clusters.find(({ id }) => id === clusterId)),
    [clusters, clusterId, setCluster]
  )
  useSetBreadcrumbs(breadcrumbs)

  if (!cluster) {
    return (
      <EmptyState
        icon={<WarningOutlineIcon size={100} />}
        message="Cluster not found"
        description={`No clusters found with ID ${clusterId}.`}
      >
        <Button onClick={() => navigate('/overview/clusters')}>
          Go to cluster overview
        </Button>
      </EmptyState>
    )
  }

  return (
    <ResponsiveLayoutPage
      gap="large"
      overflowY="auto"
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
            <ClusterPicker
              cluster={cluster}
              setCluster={setCluster}
              onChange={(c) => navigate(`/clusters/${c?.id}`)}
              filter={(c) => c.owner?.id === me.id || !!c.owner?.serviceAccount}
              title={
                <Flex gap="xsmall">
                  <ClusterIcon />
                  Cluster
                </Flex>
              }
            />
          </Div>
          <Flex gap="medium">
            {!!cluster && !cluster.dependency ? (
              <>
                <CollapsibleButton
                  label="Set up promotions"
                  icon={<RocketIcon />}
                  onClick={() => setDependencyOpen(true)}
                />
                <ClusterDependencyModal
                  open={dependencyOpen}
                  setOpen={setDependencyOpen}
                  destination={cluster}
                />
              </>
            ) : (
              <>
                <CollapsibleButton
                  label="Promote"
                  icon={<RocketIcon />}
                  onClick={() => setPromoteOpen(true)}
                />
                <ClusterPromoteModal
                  open={promoteOpen}
                  setOpen={setPromoteOpen}
                  destination={cluster}
                />
              </>
            )}

            {cluster.owner?.serviceAccount && (
              <>
                <CollapsibleButton
                  label="Managers"
                  icon={<PersonPlusIcon />}
                  onClick={() => setAdminsOpen(true)}
                />
                {adminsOpen && (
                  <ClusterAdminsModal
                    serviceAccount={cluster.owner}
                    onClose={() => setAdminsOpen(false)}
                  />
                )}
              </>
            )}

            {cluster.consoleUrl && (
              <Button
                as="a"
                href={ensureURLValidity(cluster.consoleUrl)}
                target="_blank"
                rel="noopener noreferrer"
                height="max-content"
                display-desktopSmall-up="none"
              >
                Launch Console
              </Button>
            )}

            <Button
              secondary
              height="max-content"
              onClick={() => setMetadataOpen(true)}
              display-desktopSmall-up="none"
            >
              Metadata
            </Button>
            <ClusterMetadataPanel
              cluster={cluster}
              open={metadataOpen}
              setOpen={setMetadataOpen}
            />
          </Flex>
        </Flex>
        <Flex
          direction="column"
          gap="medium"
          grow={1}
        >
          <ImpersonateServiceAccount
            id={cluster?.owner?.id}
            skip={!cluster.owner?.serviceAccount}
          >
            <>
              <ClusterApps cluster={cluster} />
              <ClusterUpgrades cluster={cluster} />
            </>
          </ImpersonateServiceAccount>
        </Flex>
      </Flex>
      <ClusterSidecar cluster={cluster} />
    </ResponsiveLayoutPage>
  )
}
