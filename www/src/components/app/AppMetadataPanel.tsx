import { A } from 'honorable'
import { Dispatch, ReactElement, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'

import { InfoPanel } from '../utils/InfoPanel'
import Prop from '../utils/Prop'
import ClusterAppHealth from '../cluster/ClusterAppHealth'
import { useAppContext } from '../../contexts/AppContext'
import ClustersContext from '../../contexts/ClustersContext'

type AppMetadataPanelProps = {
  open: boolean,
  setOpen: Dispatch<boolean>
}

export default function AppMetadataPanel({ open, setOpen }: AppMetadataPanelProps): ReactElement | null {
  const { clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)
  const app = useAppContext()

  if (!open) return null

  return (
    <InfoPanel
      title="Metadata"
      width={388}
      marginTop="172px"
      contentHeight={140}
      contentPadding={16}
      contentGap={16}
      onClose={() => setOpen(false)}
    >
      <Prop
        title="App status"
        margin={0}
      >
        <ClusterAppHealth pingedAt={app.installation?.pingedAt} />
      </Prop>
      <Prop
        title="Cluster"
        margin={0}
      >
        <A
          inline
          as={Link}
          to={`/clusters/${cluster?.id}`}
        >
          {cluster?.name}
        </A>
      </Prop>
    </InfoPanel>
  )
}
