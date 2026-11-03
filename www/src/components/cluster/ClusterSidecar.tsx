import { Flex, Sidecar, SidecarItem, Tooltip } from '@pluralsh/design-system'
import moment from 'moment'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { ClusterFragment } from '../../generated/graphql'
import ClusterHealth from '../overview/clusters/ClusterHealth'
import ClusterOwner from '../overview/clusters/ClusterOwner'
import CopyButton from '../utils/CopyButton'
import { InlineLinkSC } from '../utils/Typography'

type ClusterSidecarProps = { cluster: ClusterFragment }

const SidecarSC = styled(Flex)(({ theme }) => ({
  [`@media (max-width: ${theme.breakpoints.desktopSmall - 1}px)`]: {
    display: 'none',
  },
}))

export function ClusterSidecar({ cluster }: ClusterSidecarProps): ReactElement {
  return (
    <SidecarSC
      gap="large"
      direction="column"
      width={200}
      flexShrink={0}
      alignSelf="flex-start"
      maxHeight="100%"
      overflowY="auto"
    >
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
            <InlineLinkSC to={`/clusters/${cluster.dependency.dependency?.id}`}>
              {cluster.dependency.dependency?.name}
            </InlineLinkSC>
          </SidecarItem>
        )}
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
    </SidecarSC>
  )
}
