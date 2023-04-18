import { Button } from '@pluralsh/design-system'
import { useParams } from 'react-router-dom'
import { useContext, useState } from 'react'

import { Flex } from 'honorable'

import { ensureURLValidity } from '../../utils/url'
import ClustersContext from '../../contexts/ClustersContext'

import AppMetadataPanel from './AppMetadataPanel'

export function AppHeaderActions() {
  const [metadataOpen, setMetadataOpen] = useState(false)
  const { clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)

  return (
    <Flex gap="small">
      {cluster?.consoleUrl && (
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
      <AppMetadataPanel
        open={metadataOpen}
        setOpen={setMetadataOpen}
      />
    </Flex>
  )
}
