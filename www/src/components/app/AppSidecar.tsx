import { A, Flex } from 'honorable'
import { Button, Sidecar, SidecarItem } from '@pluralsh/design-system'
import { Link, useParams } from 'react-router-dom'
import { useContext } from 'react'

import ClustersContext from '../../contexts/ClustersContext'
import { ensureURLValidity } from '../../utils/url'
import ClusterAppHealth from '../cluster/ClusterAppHealth'
import { useAppContext } from '../../contexts/AppContext'

export function AppSidecar() {
  const { clusterId, appId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)
  const app = useAppContext()

  return (
    <Flex
      flexDirection="column"
      gap="large"
      position="relative"
    >
      {cluster?.consoleUrl && (
        <Button
          as="a"
          href={`${ensureURLValidity(cluster.consoleUrl)}/apps/${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          height="max-content"
        >
          Manage in console
        </Button>
      )}
      <Sidecar
        heading="metadata"
        display="flex"
        flexDirection="column"
        gap="xxsmall"
      >
        <SidecarItem heading="App status">
          <ClusterAppHealth pingedAt={app?.installation?.pingedAt} />
        </SidecarItem>
        <SidecarItem heading="Cluster">
          <A
            inline
            as={Link}
            to={`/clusters/${cluster?.id}`}
          >
            {cluster?.name}
          </A>
        </SidecarItem>
      </Sidecar>
    </Flex>
  )
}
