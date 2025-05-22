import { A, Flex } from 'honorable'
import {
  Button,
  Input,
  Modal,
  Sidecar,
  SidecarItem,
} from '@pluralsh/design-system'
import { Link, useParams } from 'react-router-dom'
import { useContext, useState } from 'react'

import ClustersContext from '../../contexts/ClustersContext'
import { ensureURLValidity } from '../../utils/url'
import ClusterAppHealth from '../cluster/ClusterAppHealth'
import { useAppContext } from '../../contexts/AppContext'
import { useReleaseMutation } from '../../generated/graphql'
import { GqlError } from '../utils/Alert'

function ReleaseApp({ app }) {
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState('')
  const [mutation, { error }] = useReleaseMutation({
    variables: { id: app.id, tags: [tag] },
    onCompleted: () => setOpen(false),
  })

  return (
    <>
      <Modal
        open={open}
        size="large"
        header={`Release ${app.name}`}
        onClose={() => setOpen(false)}
      >
        <Flex
          flexDirection="row"
          gap="small"
          alignContent="center"
        >
          {error && (
            <GqlError
              error={error}
              header="Failed to promote"
            />
          )}
          <Input
            value={tag}
            width="100%"
            placeholder="release channel name, eg stable, warm, dev, prod"
            onChange={({ target: { value } }) => setTag(value)}
          />
          <Button onClick={() => mutation()}>Release</Button>
        </Flex>
      </Modal>
      <Sidecar
        heading="Release Controls"
        display="flex"
        flexDirection="column"
        gap="xxsmall"
      >
        <Button
          secondary
          onClick={() => setOpen(true)}
        >
          Release
        </Button>
      </Sidecar>
    </>
  )
}

export function AppSidecar() {
  const { clusterId, appName } = useParams()
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
          href={`${ensureURLValidity(cluster.consoleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          height="max-content"
        >
          Manage in console
        </Button>
      )}
      {app.editable && <ReleaseApp app={app} />}
      <Sidecar
        heading="metadata"
        display="flex"
        flexDirection="column"
        gap="xxsmall"
      >
        <SidecarItem heading="App status">
          <ClusterAppHealth pingedAt={app.installation?.pingedAt} />
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
