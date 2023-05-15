import { A } from 'honorable'
import moment from 'moment'
import { Tooltip } from '@pluralsh/design-system'
import { Dispatch, ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { Cluster } from '../../generated/graphql'
import CopyButton from '../utils/CopyButton'
import ClusterHealth from '../overview/clusters/ClusterHealth'
import ClusterOwner from '../overview/clusters/ClusterOwner'
import { InfoPanel } from '../utils/InfoPanel'
import Prop from '../utils/Prop'

type ClusterMetadataPanelProps = {
  cluster: Cluster
  open: boolean
  setOpen: Dispatch<boolean>
}

export default function ClusterMetadataPanel({
  cluster,
  open,
  setOpen,
}: ClusterMetadataPanelProps): ReactElement | null {
  if (!open) return null

  return (
    <InfoPanel
      title="Metadata"
      width={388}
      marginTop="155px"
      contentHeight={442}
      contentPadding={16}
      contentGap={16}
      onClose={() => setOpen(false)}
    >
      <Prop
        title="Cluster name"
        margin={0}
      >
        {cluster.name}
      </Prop>
      <Prop
        title="Status"
        margin={0}
      >
        <ClusterHealth pingedAt={cluster.pingedAt} />
      </Prop>
      <Prop
        title="Owner"
        margin={0}
      >
        <ClusterOwner
          name={cluster.owner?.name}
          email={cluster.owner?.email}
          avatar={cluster.owner?.avatar}
        />
      </Prop>
      <Prop
        title="Git URL"
        margin={0}
      >
        <CopyButton
          text={cluster.gitUrl || ''}
          type="secondary"
        />
      </Prop>
      {!!cluster.dependency && (
        <Prop
          title="Promotion source"
          margin={0}
        >
          <A
            inline
            as={Link}
            to={`/clusters/${cluster.dependency.dependency?.id}`}
          >
            {cluster.dependency.dependency?.name}
          </A>
        </Prop>
      )}
      <Prop
        title="Acked"
        margin={0}
      >
        {cluster.queue?.acked || '-'}
      </Prop>
      <Prop
        title="Last pinged"
        margin={0}
      >
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
      </Prop>
      <Prop
        title="Docs"
        margin={0}
      >
        <A
          inline
          href="https://docs.plural.sh/operations/uninstall"
          target="_blank"
          rel="noopener noreferrer"
        >
          Destroying the Cluster and Installations
        </A>
      </Prop>
    </InfoPanel>
  )
}
