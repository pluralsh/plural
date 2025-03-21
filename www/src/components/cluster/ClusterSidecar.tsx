import { A, Flex } from 'honorable'
import moment from 'moment'
import { Button, Sidecar, SidecarItem, Tooltip } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { Cluster } from '../../generated/graphql'
import CopyButton from '../utils/CopyButton'
import ClusterHealth from '../overview/clusters/ClusterHealth'
import { ensureURLValidity } from '../../utils/url'
import ClusterOwner from '../overview/clusters/ClusterOwner'

type ClusterSidecarProps = { cluster: Cluster }

export function ClusterSidecar({ cluster }: ClusterSidecarProps): ReactElement {
  return (
    <Flex
      gap="large"
      direction="column"
      width={200}
      display-desktopSmall-down="none"
    >
      {cluster.consoleUrl && (
        <Button
          as="a"
          href={ensureURLValidity(cluster.consoleUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch Console
        </Button>
      )}
      <Sidecar heading="Metadata">
        <SidecarItem heading="Cluster name">{cluster.name}</SidecarItem>
        <SidecarItem heading="Status">
          <ClusterHealth pingedAt={cluster.pingedAt} />
        </SidecarItem>
        <SidecarItem heading="Owner">
          <ClusterOwner
            name={cluster.owner?.name}
            email={cluster.owner?.email}
            avatar={cluster.owner?.avatar}
          />
        </SidecarItem>
        <SidecarItem heading="Git URL">
          <CopyButton
            text={cluster.gitUrl || ''}
            type="secondary"
          />
        </SidecarItem>
        {!!cluster.dependency && (
          <SidecarItem heading="Promotion source">
            <A
              inline
              as={Link}
              to={`/clusters/${cluster.dependency.dependency?.id}`}
            >
              {cluster.dependency.dependency?.name}
            </A>
          </SidecarItem>
        )}
        <SidecarItem heading="Acked">{cluster.queue?.acked || '-'}</SidecarItem>
        <SidecarItem heading="Last pinged">
          {cluster.pingedAt ? (
            <Tooltip
              label={moment(cluster.pingedAt).format('lll')}
              placement="top"
            >
              <span>{moment(cluster.pingedAt).fromNow()}</span>
            </Tooltip>
          ) : (
            '-'
          )}
        </SidecarItem>
      </Sidecar>
    </Flex>
  )
}
