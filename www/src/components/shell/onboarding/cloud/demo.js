import { useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { Box, Text } from 'grommet'

import { CREATE_DEMO_PROJECT_MUTATION, POLL_DEMO_PROJECT_QUERY } from '../../query'
import { LoopingLogo } from '../../../utils/AnimatedLogo'
import { Status } from '../../ShellStatus'

import { GqlError } from '../../../utils/Alert'

import { DemoStatus } from './types'

function PollProject({ demo, setDemo, setProvider, workspace, setWorkspace, credentials, setCredentials, next }) {
  const { data } = useQuery(POLL_DEMO_PROJECT_QUERY, { variables: { id: demo.id }, pollInterval: 10000 })

  useEffect(() => {
    if (!data) return
    const polled = data.demoProject
    if (polled.state === DemoStatus.ENABLED) {
      setDemo(polled)
      setProvider('GCP')
      setWorkspace({ ...workspace, region: 'us-east1', project: polled.projectId })
      setCredentials({ ...credentials, gcp: { applicationCredentials: polled.credentials } })
      next()
    }
  }, [data, setDemo, setProvider, setWorkspace, setCredentials, next, workspace, credentials])

  const project = data ? data.demoProject : {}
  const { ready } = project
  const enabled = project.state === DemoStatus.ENABLED

  return (
    <Box
      fill
      gap="xsmall"
    >
      <Text size="small">Creating your demo project, this might take a minute...</Text>
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

export function DemoProject({ setProvider, workspace, setWorkspace, credentials, setCredentials, next, setDemo }) {
  const [mutation, { data, error }] = useMutation(CREATE_DEMO_PROJECT_MUTATION)

  useEffect(() => {
    mutation()
  }, [mutation])

  if (error) {
    return (
      <GqlError
        error={error}
        header="Cannot create demo project"
      />
    )
  }

  if (data) {
    return (
      <PollProject
        demo={data.createDemoProject}
        setDemo={setDemo}
        setProvider={setProvider}
        workspace={workspace}
        setWorkspace={setWorkspace}
        credentials={credentials}
        setCredentials={setCredentials}
        next={next}
      />
    )
  }

  return (
    <Box fill>
      <LoopingLogo dark />
    </Box>
  )
}
