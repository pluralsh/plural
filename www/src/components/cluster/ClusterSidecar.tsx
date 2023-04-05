import { A, Flex } from 'honorable'
import moment from 'moment'
import { Button, Sidecar, SidecarItem } from '@pluralsh/design-system'
import { ReactElement } from 'react'

import { Cluster } from '../../generated/graphql'
import CopyButton from '../utils/CopyButton'
import ClusterHealth from '../overview/clusters/ClusterHealth'

type ClusterSidecarProps = {cluster: Cluster}

export function ClusterSidecar({ cluster }: ClusterSidecarProps): ReactElement {
  return (
    <Flex
      gap={24}
      direction="column"
      overflow="hidden"
    >
      <Button
        secondary
        as={A}
        target="_blank"
        href={`https://${cluster.queue?.domain}`}
        {...{
          '&:hover': {
            textDecoration: 'none',
          },
        }}
      >
        Launch Console
      </Button>
      <Sidecar heading="Metadata">
        <SidecarItem heading="Cluster name">
          {cluster.name}
        </SidecarItem>
        <SidecarItem heading="Status">
          <ClusterHealth pingedAt={cluster.queue?.pingedAt} />
        </SidecarItem>
        <SidecarItem heading="Owner">
          owner
        </SidecarItem>
        <SidecarItem heading="Git URL">
          <CopyButton
            text={cluster.gitUrl || ''}
            type="secondary"
          />
        </SidecarItem>
        <SidecarItem heading="Acked">
          {cluster.queue?.acked}
        </SidecarItem>
        <SidecarItem heading="Last pinged">
          {moment(cluster.queue?.pingedAt).format('lll')}
        </SidecarItem>
        <SidecarItem heading="Docs">
          <A
            inline
            href="https://docs.plural.sh/operations/uninstall"
            target="_blank"
            rel="noopener noreferrer"
          >
            Destroying the Cluster and Installations
          </A>
        </SidecarItem>
      </Sidecar>
    </Flex>
  )
}
