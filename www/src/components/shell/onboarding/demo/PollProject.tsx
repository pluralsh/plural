import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Box, Text } from 'grommet'

import {
  usePersistedCredentials,
  usePersistedProvider,
  usePersistedWorkspace,
} from '../../usePersistance'

import { POLL_DEMO_PROJECT_QUERY } from '../../queries'

import Status from './Status'

const DemoStatus = {
  CREATED: 'CREATED',
  READY: 'READY',
  ENABLED: 'ENABLED',
}

// TODO un-grommet this file

export function PollProject({
  demo,
  setDemo,
  next,
}) {
  const [, setProvider] = usePersistedProvider()
  const [workspace, setWorkspace] = usePersistedWorkspace()
  const [credentials, setCredentials] = usePersistedCredentials()

  const { data } = useQuery(POLL_DEMO_PROJECT_QUERY, {
    variables: {
      id: demo.id,
    },
    pollInterval: 10000,
  })

  useEffect(() => {
    if (!data) return

    const polled = data.demoProject

    if (polled.state === DemoStatus.ENABLED) {
      setDemo(polled)
      setProvider('GCP')
      setWorkspace(x => ({
        ...(x || {}),
        region: 'us-east1',
        project: polled.projectId,
      }))
      setCredentials(x => ({
        ...(x || {}),
        gcp: {
          ...(x.gcp || {}),
          applicationCredentials: polled.credentials,
        },
      }))
      next()
    }
  }, [
    data,
    workspace,
    credentials,
    setDemo,
    setProvider,
    setWorkspace,
    setCredentials,
    next,
  ])

  const project = data ? data.demoProject : {}
  const { ready } = project
  const enabled = project.state === DemoStatus.ENABLED

  return (
    <Box
      fill
      gap="xsmall"
    >
      <Text size="small">
        Creating your demo project, this might take a minute...
      </Text>
      <Status
        name={`GCP Project ${project.projectId} Created`}
        state={ready}
      />
      <Status
        name="Necessary services enabled"
        state={enabled}
      />
    </Box>
  )
}
